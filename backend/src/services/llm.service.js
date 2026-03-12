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

async function analyzeText(text) {

  const hash = hashText(text);

  // Check cache
  const cached = await getCachedAnalysis(hash);

  if (cached) {
    console.log("CACHE HIT");
    return cached;
  }

  console.log("CACHE MISS -> calling LLM");

  const prompt = `
You are an emotion analysis assistant.

Extract:
emotion
keywords (3-5)
summary

Return STRICT JSON:
{
"emotion":"",
"keywords":[],
"summary":""
}

Journal:
${text}
`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_KEY}`
      }
    }
  );

  const result = JSON.parse(
    response.data.choices[0].message.content
  );

  // store in cache
  await storeAnalysis(hash, result);

  return result;

}

module.exports = { analyzeText };