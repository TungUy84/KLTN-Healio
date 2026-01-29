const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY in .env");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching available models from Google API...");

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("❌ API Error:", json.error.message);
            } else if (json.models) {
                console.log("✅ Available Models:");
                json.models.forEach(m => {
                    // Filter for models that support generateContent
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                    }
                });
            } else {
                console.log("⚠️ No models found or unexpected format:", json);
            }
        } catch (e) {
            console.error("❌ JSON Parse Error:", e.message);
            console.log("Raw output:", data);
        }
    });

}).on('error', (err) => {
    console.error("❌ Request Error:", err.message);
});
