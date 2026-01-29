const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
            7. "diet_tags": Mảng các chế độ ăn phù hợp (chọn từ: "balanced", "low_carb", "low_fat", "high_protein", "keto", "vegan", "vegetarian").

            Format JSON trả về:
            {
                "description": "Mô tả món ăn...",
                "serving_unit": "Dĩa",
                "meal_categories": ["lunch", "dinner"],
                "diet_tags": ["balanced", "high_protein"],
                "ingredients": [
                    {
                        "name": "Tên nguyên liệu (VD: Thịt ba chỉ)",
                        "amount": 100, // Số nguyên, tính bằng gam
                        "calories": 250, // Calo trên 100g
                        "carb": 0, // Gram trên 100g
                        "protein": 18, // Gram trên 100g
                        "fat": 15 // Gram trên 100g
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
            Chọn ra 3 món cho 3 bữa (Sáng, Trưa, Tối) từ danh sách trên sao cho:
            1. Tổng calo dao động trong khoảng ${Math.round(nutritionTarget.target_calories * 0.9)} - ${Math.round(nutritionTarget.target_calories * 1.1)}.
            2. TUYỆT ĐỐI KHÔNG chọn món chứa thành phần dị ứng (kiểm tra kỹ tên và thành phần).
            3. Xác định **Số lượng (amount)** cho mỗi món (VD: 1.5 tô, 2 cái...) để đạt mục tiêu calo. "amount" phải là số thực (float), ví dụ: 0.5, 1, 1.5, 2.

            **Output JSON (Only JSON, no markdown):**
            {
                "breakfast": { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" },
                "lunch": { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" },
                "dinner": { "food_id": Number, "amount": Number, "reason": "Ngắn gọn tại sao chọn" },
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

module.exports = {
    generateRecipeFromText,
    suggestMealPlan
};
