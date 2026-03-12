const journalService = require("../services/journal.service");
const insightService = require("../services/insight.service");
const { analyzeText } = require("../services/llm.service");

async function analyzeJournal(req, res) {

  try {

    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: "text is required"
      });
    }

    const result = await analyzeText(text);

    res.json(result);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "analysis failed"
    });

  }

}

async function createJournal(req,res){

  const journal = await journalService.createJournal(req.body);

  res.json({
    status:"saved",
    journal
  });
}

async function getEntries(req,res){

  const data = await journalService.getUserJournals(
    req.params.userId
  );

  res.json(data);
}

async function getInsights(req,res){

  const insights =
    await insightService.getInsights(req.params.userId);

  res.json(insights);
}

module.exports = {
  createJournal,
  getEntries,
  getInsights,
  analyzeJournal
};