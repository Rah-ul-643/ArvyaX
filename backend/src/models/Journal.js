const mongoose = require("mongoose");

const JournalSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true
  },

  ambience: {
    type: String,
    enum: ["forest", "ocean", "mountain"]
  },

  text: {
    iv: String,
    content: String,
    tag: String
  },

  emotion: String,
  keywords: [String],
  summary: String,

  analysisStatus: {
    type: String,
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Journal", JournalSchema);