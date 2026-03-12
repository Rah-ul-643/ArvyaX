const express = require("express");
const cors = require("cors");

const journalRoutes = require("./routes/journal.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/journal", journalRoutes);

module.exports = app;