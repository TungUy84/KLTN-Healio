const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const generateRecipeFromText = async (foodName) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }
        console.log(`[AI] Generating recipe for: ${foodName}`);

        const prompt = `
            Bạn là một chuyên gia dinh dưỡng hàng đầu. Hãy phân tích món ăn: "${foodName}".
            Nhiệm vụ: Trả về một JSON duy nhất (không có markdown, không có text dẫn dắt) mô tả chi tiết các nguyên liệu chính để nấu món này.
            
            Yêu cầu bắt buộc:
            1. Các giá trị dinh dưỡng (carb, protein, fat...) tính trên 100g nguyên liệu SỐNG.
            2. "amount" là khối lượng cần dùng cho 1 suất ăn tiêu chuẩn, đơn vị là GAM (số nguyên).
            3. "description": Mô tả ngắn gọn về món ăn này (dưới 50 từ).
            4. Tên nguyên liệu ("name") phải bằng Tiếng Việt, phổ thông.
            5. "serving_unit": Đơn vị tính phổ biến của món này (VD: Tô, Dĩa, Cái, Ly).
            6. "meal_categories": Mảng các bữa ăn phù hợp (chọn từ: "breakfast", "lunch", "dinner", "snack").
            7. "diet_tags": Mảng các chế độ ăn phù hợp (chọn từ: "balanced", "low_carb", "low_fat", "high_protein", "keto", "vegetarian").
            8. "micronutrients": Object chứa các vi chất quan trọng. QUY ĐỊNH: Tất cả quy đổi về đơn vị **mg** (miligam). Giá trị chỉ là SỐ (String hoặc Number), không kèm đơn vị.
            
            Format JSON trả về:
            {
                "description": "Mô tả món ăn...",
                "serving_unit": "Dĩa",
                "meal_categories": ["lunch", "dinner"],
                "diet_tags": ["balanced", "high_protein"],
                "micronutrients": { 
                    "Vit_A_mg": "0.8",   // Vitamin A (mg)
                    "Vit_C_mg": "50",    // Vitamin C (mg)
                    "Calcium_mg": "100", // Calcium (mg)
                    "Iron_mg": "2.5"     // Iron (mg)
                },
                "ingredients": [
                    {
                        "name": "Tên nguyên liệu (VD: Thịt ba chỉ)",
                        "amount": 100, // Số nguyên, tính bằng gam
                        "calories": 250, // Calo trên 100g
                        "carb": 0, // Gram trên 100g
                        "protein": 18, // Gram trên 100g
                        "fat": 15, // Gram trên 100g
                        "fiber": 0, // Gram trên 100g
                        "micronutrients": {} // Các vi chất (nếu có, VD: {"Vitamin A": "..."})
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log("[AI] Raw response:", text);

        // Clean markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            const data = JSON.parse(text);
            return data;
        } catch (jsonError) {
            console.error("[AI] JSON Parse Error:", jsonError);
            console.error("[AI] Bad JSON Text:", text);
            throw new Error("AI trả về dữ liệu không hợp lệ.");
        }
    } catch (error) {
        console.error("Gemini AI Error:", error);
        throw error; // Re-throw to controller
    }
};

const suggestMealPlan = async (userProfile, nutritionTarget, availableFoods) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }

        // Prepare simplified food list for AI to save tokens
        const simplifiedFoods = availableFoods.map(f => ({
            id: f.id,
            name: f.name,
            cal: Math.round(f.calories), // Calories per serving
            unit: f.serving_unit || 'suất',
            macro: `P:${Math.round(f.protein)} C:${Math.round(f.carb)} F:${Math.round(f.fat)}`,
            ingr: f.ingredients_description // Simplified ingredients check
        }));

        const prompt = `
            Bạn là chuyên gia dinh dưỡng cá nhân (Personal Dietitian).
            
            **Hồ sơ User:**
            - Mục tiêu: ${Math.round(nutritionTarget.target_calories)} Kcal/ngày.
            - Dị ứng/Kiêng: ${userProfile.allergies && userProfile.allergies.length > 0 ? userProfile.allergies.join(", ") : "Không có"}.
            
            **Danh sách món ăn khả dụng (Database):**
            ${JSON.stringify(simplifiedFoods)}

            **Nhiệm vụ:**
            Chọn ra danh sách các món ăn cho 3 bữa (Sáng, Trưa, Tối) từ danh sách trên sao cho:
            1. Tổng calo dao động trong khoảng ${Math.round(nutritionTarget.target_calories * 0.9)} - ${Math.round(nutritionTarget.target_calories * 1.1)}.
            2. TUYỆT ĐỐI KHÔNG chọn món chứa thành phần dị ứng (kiểm tra kỹ tên và thành phần).
            3. Xác định **Số lượng (amount)** cho mỗi món (VD: 1.5 tô, 2 cái...) để đạt mục tiêu calo. "amount" phải là số thực (float).
            4. YÊU CẦU BẮT BUỘC: Bữa Trưa (lunch) và Bữa Tối (dinner) PHẢI BAO GỒM TỪ 2 ĐẾN 3 MÓN KHÁC NHAU (Ví dụ: Cơm + Gà + Rau, hoặc Cơm + Bò). Bữa sáng (breakfast) có thể có 1-2 món tùy ý.
            5. Không dồn mọi thứ vào 1 món với amount khổng lồ (VD: 3 phần Mì Ý là sai). Hãy đa dạng hóa.

            **Output JSON (Only JSON, no markdown):**
            {
                "breakfast": [ { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" } ],
                "lunch": [ { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" }, { "food_id": Number, "amount": Number, "reason": "..." } ],
                "dinner": [ { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" }, { "food_id": Number, "amount": Number, "reason": "..." } ],
                "total_calories": Number,
                "note": "Lời khuyên ngắn gọn"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        console.log("[AI] Meal Plan Response:", text);

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("AI Meal Plan Error:", error);
        throw error;
    }
};

const generateRawFoodInfo = async (foodName) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("Missing GEMINI_API_KEY");
        }
        console.log(`[AI] Generating raw food info for: ${foodName}`);

        const prompt = `
            Bạn là chuyên gia dinh dưỡng. Hãy cung cấp thông tin dinh dưỡng cho nguyên liệu THÔ (RAW): "${foodName}".
            
            Yêu cầu:
            1. Tính toán dinh dưỡng trên 100g phần ăn được (edible portion).
            2. Trả về JSON duy nhất.
            
            Format JSON:
            {
                "name": "Tên chuẩn hóa (VD: Ức gà, Cà rốt...)",
                "calories": 165, // Kcal
                "protein": 31, // Gram
                "fat": 3.6, // Gram
                "carb": 0, // Gram
                "fiber": 0, // Gram (Chất xơ)
                "micronutrients": { // Các vi chất nổi bật. QUY ĐỊNH: Tất cả quy đổi về đơn vị **mg**. Key dùng định dạng chuẩn (VD: Calcium_mg, Vit_A_mg).
                    "Vit_A_mg": "12.5", 
                    "Vit_C_mg": "0.5",
                    "Calcium_mg": "100",
                    "Iron_mg": "2.5"
                },
                "description": "Mô tả ngắn gọn về đặc điểm dinh dưỡng (dưới 30 từ)."
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);

    } catch (error) {
        console.error("AI Generate Raw Food Error:", error);
        throw error;
    }
};

module.exports = {
    generateRecipeFromText,
    suggestMealPlan,
    generateRawFoodInfo
};
