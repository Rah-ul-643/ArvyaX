const Journal = require("../models/Journal");
const journalQueue = require("../queue/journal.queue");

const { encrypt } = require("../utils/encryption");
const { decrypt } = require("../utils/encryption");

async function createJournal(data) {

  const encryptedText = encrypt(data.text);

  const journal = await Journal.create({
    userId: data.userId,
    ambience: data.ambience,
    text: encryptedText
  });

  await journalQueue.add("analyze", {
    journalId: journal._id,
    text: data.text
  });

  return journal;
}

async function getUserJournals(userId) {

  const entries = await Journal.find({ userId })
    .sort({ createdAt: -1 });

  return entries.map(e => ({
    ...e.toObject(),
    text: decrypt(e.text)
  }));

}

module.exports = {
  createJournal,
  getUserJournals
};