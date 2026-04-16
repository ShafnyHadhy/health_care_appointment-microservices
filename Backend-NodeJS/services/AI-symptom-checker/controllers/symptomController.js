const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Initialize Gemini ─────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

// ─── Clinical Prompt Builder ───────────────────────────────────────────────────
const buildPrompt = (symptoms) => `
You are an expert clinical triage AI assistant.
A patient reports these symptoms: ${symptoms.join(', ')}.

Based on these symptoms, respond ONLY with a valid JSON object. 
Do NOT include any markdown formatting, backticks, or preamble.

Expected JSON Structure:
{
  "riskLevel": "Low" | "Moderate" | "Urgent" | "Critical",
  "isEmergency": true | false,
  "matchScore": "85%",
  "possibleConditions": [
    { "name": "Condition 1", "likelihood": "More Likely", "specialty": "Specialist" }
  ],
  "recommendedSpecialty": "SPECIALTY_NAME",
  "clinicalAdvice": "Detailed guidance for the patient.",
  "lifestyleAdvice": "Recovery and home care tips.",
  "recommendedAction": "Actionable next steps.",
  "isAmbiguous": false,
  "followUpQuestions": []
}

CRITICAL: For "recommendedSpecialty", you MUST choose exactly ONE from this list of available departments in our hospital:
[Cardiology, Dermatology, Gastroenterology, Neurology, Ophthalmology, Orthopedics, Pediatrics, Psychiatry, General Practitioner]
`;

// ─── Graceful Fallback (if Gemini is unavailable) ─────────────────────────────
const fallbackAnalysis = () => ({
    riskLevel: 'Moderate',
    isEmergency: false,
    matchScore: 'N/A',
    possibleConditions: [
        { name: 'Common Cold', likelihood: 'Possible', specialty: 'General Practitioner' },
        { name: 'Influenza', likelihood: 'Possible', specialty: 'General Practitioner' },
        { name: 'Allergic Rhinitis', likelihood: 'Possible', specialty: 'Allergist' }
    ],
    recommendedSpecialty: 'General Practitioner',
    clinicalAdvice: 'AI analysis encountered a temporary connection issue. Please consult a GP if symptoms persist.',
    lifestyleAdvice: 'Stay hydrated and rest.',
    recommendedAction: 'Consult a GP for a proper diagnosis.',
    isAmbiguous: true,
    followUpQuestions: ['How long have you had these symptoms?']
});

// ─── Main Analysis Controller ──────────────────────────────────────────────────
const analyzeSymptoms = async (req, res) => {
    try {
        const { symptoms } = req.body;

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ success: false, message: 'No symptoms provided.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('[AI SERVICE] ❌ Missing GEMINI_API_KEY');
            return res.status(200).json({ success: true, data: fallbackAnalysis() });
        }

        console.log(`[AI SERVICE] 🔍 Analyzing: ${symptoms.join(', ')}`);

        const prompt = buildPrompt(symptoms);
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();

        // Robust parsing: extract content between first { and last }
        let aiData;
        try {
            const jsonStart = rawText.indexOf('{');
            const jsonEnd = rawText.lastIndexOf('}') + 1;
            const cleanJson = rawText.substring(jsonStart, jsonEnd);
            aiData = JSON.parse(cleanJson);
        } catch (parseError) {
            console.error('[AI SERVICE] ⚠️ Parse failed. Raw response:', rawText);
            return res.status(200).json({ success: true, data: fallbackAnalysis() });
        }

        return res.status(200).json({ success: true, data: aiData });

    } catch (error) {
        console.error('[AI SERVICE] ❌ Error:', error.message);
        return res.status(200).json({ success: true, data: fallbackAnalysis() });
    }
};

module.exports = { analyzeSymptoms };

module.exports = { analyzeSymptoms };
