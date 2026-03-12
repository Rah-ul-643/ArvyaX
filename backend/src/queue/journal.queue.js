const { Queue } = require("bullmq");
const redis = require("../config/redis");

const journalQueue = new Queue("journal-analysis", {
  connection: redis
});

module.exports = journalQueue;