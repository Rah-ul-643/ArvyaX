const redis = require("../config/redis");

async function getCachedAnalysis(hash) {

  const data = await redis.get(hash);

  if (!data) return null;

  return JSON.parse(data);
}

async function storeAnalysis(hash, result) {

  await redis.set(
    hash,
    JSON.stringify(result),
    {
      EX: 60 * 60 * 24 // 24 hours
    }
  );
}

module.exports = {
  getCachedAnalysis,
  storeAnalysis
};