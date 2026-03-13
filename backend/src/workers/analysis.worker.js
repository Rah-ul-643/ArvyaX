require("dotenv").config();

const connectDB = require("../config/db"); 

const { Worker } = require("bullmq");
const connection = require("../config/redis");

const Journal = require("../models/Journal");

const { analyzeText } = require("../services/llm.service");
const { decrypt } = require("../utils/encryption");

// connect to Mongo DB before starting the worker
connectDB();

const worker = new Worker(
  "journal-analysis",

  async (job) => {

    try {

      const { journalId } = job.data;

      console.log("Processing journal:", journalId);

      const journal = await Journal.findById(journalId);

      if (!journal) {
        throw new Error("Journal not found");
      }

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

      console.log("Analysis complete:", journalId);

    } catch (err) {

      console.error("Worker error:", err);

      throw err;

    }

  },

  { connection }
);

console.log("Worker started");