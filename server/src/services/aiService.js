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

            Format JSON trả về:
            {
                "description": "Mô tả món ăn...",
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

module.exports = {
    generateRecipeFromText
};
