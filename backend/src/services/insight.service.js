const Journal = require("../models/Journal");

async function getInsights(userId) {

  const entries = await Journal.find({ userId });

  const totalEntries = entries.length;

  const emotionCount = {};
  const ambienceCount = {};
  const keywordCount = {};

  for (const e of entries) {

    if (e.emotion) {
      emotionCount[e.emotion] =
        (emotionCount[e.emotion] || 0) + 1;
    }

    ambienceCount[e.ambience] =
      (ambienceCount[e.ambience] || 0) + 1;

    for (const k of e.keywords || []) {
      keywordCount[k] = (keywordCount[k] || 0) + 1;
    }
  }

  function top(map) {
    return Object.keys(map).sort((a,b)=>map[b]-map[a])[0];
  }

  return {
    totalEntries,
    topEmotion: top(emotionCount),
    mostUsedAmbience: top(ambienceCount),
    recentKeywords: Object.keys(keywordCount)
      .sort((a,b)=>keywordCount[b]-keywordCount[a])
      .slice(0,5)
  };
}

module.exports = { getInsights };