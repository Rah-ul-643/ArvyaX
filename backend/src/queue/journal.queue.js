const { Queue } = require("bullmq");
const connection = require("../config/redis");

const journalQueue = new Queue("journal-analysis", {
  connection
});

module.exports = journalQueue;