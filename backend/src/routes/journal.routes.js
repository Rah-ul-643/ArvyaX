const express = require("express");
const router = express.Router();

const controller = require("../controllers/journal.controller");
const analyzeLimiter = require("../middleware/rateLimiter");

router.post("/", controller.createJournal);

router.post(
  "/analyze",
  analyzeLimiter,
  controller.analyzeJournal
);

router.get("/:userId", controller.getEntries);

router.get("/insights/:userId", controller.getInsights);

module.exports = router;