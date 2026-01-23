const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MAX_INPUT_CHARS = 6000;

const parseJDWithAI = async (jdText) => {
  const truncatedText =
    jdText.length > MAX_INPUT_CHARS
      ? jdText.slice(0, MAX_INPUT_CHARS)
      : jdText;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        temperature: 0,
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content:
              "You are a job description parser. Return ONLY valid JSON. No markdown. No explanation.",
          },
          {
            role: "user",
            content: `
Extract structured data from this job description.

Return JSON in this format:

{
  "title": "",
  "requiredSkills": [],
  "preferredSkills": [],
  "experienceLevel": "",
  "responsibilities": []
}

JD:
"""${truncatedText}"""
`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = response.data.choices[0].message.content;

    return JSON.parse(content);
  } catch (err) {
    console.error("❌ JD AI PARSE FAILED:", err.response?.data || err.message);
    throw new Error("JD parsing failed at AI layer");
  }
};

module.exports = { parseJDWithAI };

