const { Worker } = require("bullmq");
const redis = require("../config/redis");

const Journal = require("../models/Journal");

const { analyzeText } =
require("../services/llm.service");

const { decrypt } =
require("../utils/encryption");

const worker = new Worker(
  "journal-analysis",

  async job => {

    const { journalId } = job.data;

    const journal = await Journal.findById(journalId);

    const text = decrypt(journal.text);

    const result = await analyzeText(text);

    await Journal.findByIdAndUpdate(
      journalId,
      {
        emotion: result.emotion,
        keywords: result.keywords,
        summary: result.summary,
        analysisStatus: "complete"
      }
    );

  },

  { connection: redis }
);

console.log("Worker started");