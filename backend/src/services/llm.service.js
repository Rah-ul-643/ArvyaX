const axios = require("axios");
const crypto = require("crypto");

const {
  getCachedAnalysis,
  storeAnalysis
} = require("../cache/analysis.cache");

function hashText(text) {

  return crypto
    .createHash("sha256")
    .update(text)
    .digest("hex");

}

function extractJSON(content) {

  // remove markdown blocks
  let cleaned = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("LLM did not return valid JSON");
  }

  return JSON.parse(match[0]);

}

async function analyzeText(text) {

  try {

    const hash = hashText(text);

    // check cache
    const cached = await getCachedAnalysis(hash);

    if (cached) {
      console.log("CACHE HIT");
      return cached;
    }

    console.log("CACHE MISS -> calling LLM");

    const prompt = `
You are an emotion analysis assistant.

Extract the following fields from the journal entry.

emotion
keywords (3-5 words)
summary

Return ONLY a JSON object in this format.

{
  "emotion": "",
  "keywords": [],
  "summary": ""
}

Do not include markdown or explanations.

Journal entry:
${text}
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;

    console.log("RAW LLM RESPONSE:", content);

    const result = extractJSON(content);

    // store in cache
    await storeAnalysis(hash, result);

    return result;

  } catch (err) {

    console.error("LLM ERROR:");

    if (err.response) {
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }

    throw err;

  }

}

module.exports = { analyzeText };