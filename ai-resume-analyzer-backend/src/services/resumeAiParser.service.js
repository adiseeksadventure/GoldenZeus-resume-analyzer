const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set in environment variables");
}

//Groq has strict payload limits. We defensively truncate resume text to avoid 400 errors.
const MAX_INPUT_CHARS = 6000;

const parseResumeWithAI = async (resumeText) => {
  const truncatedText =
    resumeText.length > MAX_INPUT_CHARS
      ? resumeText.slice(0, MAX_INPUT_CHARS)
      : resumeText;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        temperature: 0,
        max_tokens: 1500, // REQUIRED by Groq
        messages: [
          {
            role: "system",
            content:
              "You are a backend resume parser. Return ONLY valid JSON. No markdown. No explanations.",
          },
          {
            role: "user",
            content: `
Return JSON exactly in this structure:

{
  "name": "",
  "email": "",
  "phone": "",
  "skills": [],
  "education": [
    { "degree": "", "institution": "", "year": "" }
  ],
  "experience": [
    {
      "role": "",
      "company": "",
      "duration": "",
      "description": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "tech": []
    }
  ]
}

Resume text:
"""${truncatedText}"""
`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30_000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned empty response");
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (jsonErr) {
      console.error("❌ GROQ RAW OUTPUT:");
      console.error(content);
      throw new Error("Groq returned invalid JSON");
    }

    return parsed;
  } catch (err) {
    if (err.response) {
      console.error(" GROQ STATUS:", err.response.status);
      console.error(
        " GROQ ERROR DATA:",
        JSON.stringify(err.response.data, null, 2)
      );
    } else {
      console.error(" GROQ REQUEST ERROR:", err.message);
    }

    throw new Error("Resume parsing failed at AI layer");
  }
};

module.exports = { parseResumeWithAI };
