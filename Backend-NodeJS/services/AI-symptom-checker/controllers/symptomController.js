const { GoogleGenerativeAI } = require('@google/generative-ai');

// ─── Initialize Gemini ─────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

console.log('[AI SERVICE] 🚀 Initialization: Gemini 1.5 Flash Enabled (v1.0.2 Smart Fallback)');

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

// ─── Smart Fallback (if Gemini is unavailable or Quota Exceeded) ──────────────
const fallbackAnalysis = (symptoms = []) => {
    const text = symptoms.join(' ').toLowerCase();
    
    // Default fallback
    let result = {
        riskLevel: 'Moderate',
        isEmergency: false,
        matchScore: '75%',
        possibleConditions: [
            { name: 'Common Cold', likelihood: 'Possible', specialty: 'Neurology' },
            { name: 'Viral Infection', likelihood: 'Possible', specialty: 'Pediatrics' }
        ],
        recommendedSpecialty: 'Neurology',
        clinicalAdvice: 'AI analysis encountered a temporary connection issue. Please consult a GP if symptoms persist.',
        lifestyleAdvice: 'Stay hydrated and rest.',
        recommendedAction: 'Consult a GP for a proper diagnosis.',
        isAmbiguous: true,
        followUpQuestions: ['How long have you had these symptoms?'],
        _isSmartFallback: true
    };

    // Keyword matching for better fallback diagnostics
    if (text.includes('gastric') || text.includes('stomach') || text.includes('acid') || text.includes('nausea') || text.includes('vomiting') || text.includes('abdominal')) {
        result.possibleConditions = [{ name: 'Gastritis / Acid Reflux', likelihood: 'Likely', specialty: 'Gastroenterology' }];
        result.recommendedSpecialty = 'Gastroenterology';
        result.matchScore = '88%';
        result.clinicalAdvice = 'Your symptoms suggest a digestive issue. Avoid spicy foods and maintain regular meal times.';
        result.followUpQuestions = ['Are you experiencing any burning sensation in your chest?'];
    } else if (text.includes('heart') || text.includes('chest') || text.includes('breath')) {
        result.riskLevel = 'Critical';
        result.isEmergency = true;
        result.matchScore = '95%';
        result.possibleConditions = [{ name: 'Potential Cardiac Issue', likelihood: 'Urgent', specialty: 'Cardiology' }];
        result.recommendedSpecialty = 'Cardiology';
        result.clinicalAdvice = 'Chest pain requires immediate medical attention to rule out cardiac issues.';
        result.followUpQuestions = ['Does the pain radiate to your arm or jaw?'];
    } else if (text.includes('headache') || text.includes('migraine') || text.includes('dizziness') || text.includes('fever') || text.includes('cough')) {
        result.possibleConditions = [{ name: 'Viral Illness / Tension Headache', likelihood: 'Likely', specialty: 'Neurology' }];
        result.recommendedSpecialty = 'Neurology';
        result.matchScore = '82%';
        result.followUpQuestions = ['Have you taken any medication for the fever or pain?'];
    } else if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
        result.possibleConditions = [{ name: 'Dermatitis', likelihood: 'Possible', specialty: 'Dermatology' }];
        result.recommendedSpecialty = 'Dermatology';
        result.matchScore = '78%';
        result.followUpQuestions = ['How long have you had these symptoms?'];
    } else if (text.includes('eye') || text.includes('vision') || text.includes('blur')) {
        result.possibleConditions = [{ name: 'Vision Issue', likelihood: 'Possible', specialty: 'Ophthalmology' }];
        result.recommendedSpecialty = 'Ophthalmology';
        result.matchScore = '80%';
        result.followUpQuestions = ['Is your vision blurry in one eye or both?'];
    } else if (text.includes('bone') || text.includes('joint') || text.includes('pain') || text.includes('muscle')) {
        result.possibleConditions = [{ name: 'Musculoskeletal Strain', likelihood: 'Possible', specialty: 'Orthopedics' }];
        result.recommendedSpecialty = 'Orthopedics';
        result.matchScore = '86%';
        result.followUpQuestions = ['Did this pain start after a specific physical activity?'];
    }

    // If the user already provided duration info or answered the specific follow-up questions, clear them.
    if (text.includes('duration') || text.includes('day') || text.includes('week') || text.includes('month') || 
        text.includes('sensation') || text.includes('arm') || text.includes('jaw') || text.includes('medication') || 
        text.includes('blurry') || text.includes('activity')) {
        result.followUpQuestions = [];
        result.isAmbiguous = false;
    }

    return result;
};

// ─── Main Analysis Controller ──────────────────────────────────────────────────
const analyzeSymptoms = async (req, res) => {
    const { symptoms } = req.body;
    try {

        if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ success: false, message: 'No symptoms provided.' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('[AI SERVICE] ❌ Missing GEMINI_API_KEY');
            return res.status(200).json({ success: true, data: fallbackAnalysis(symptoms) });
        }

        console.log(`[AI SERVICE] 🔍 Analyzing: ${symptoms.join(', ')}`);
        
        if (!process.env.GEMINI_API_KEY) {
             console.error('[AI SERVICE] ❌ Quota/Key Error: Falling back to internal clinical logic.');
        }

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
            return res.status(200).json({ success: true, data: fallbackAnalysis(symptoms) });
        }

        return res.status(200).json({ success: true, data: aiData });

    } catch (error) {
        console.error('[AI SERVICE] ❌ Error:', error.message);
        return res.status(200).json({ success: true, data: fallbackAnalysis(symptoms) });
    }
};

module.exports = { analyzeSymptoms };
