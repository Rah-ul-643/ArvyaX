import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Journal Entries ──────────────────────────────────────────────────────────

export const createEntry = (userId, ambience, text) =>
  api.post("/api/journal", { userId, ambience, text });

export const getEntries = (userId) =>
  api.get(`/api/journal/${userId}`);

// ── Emotion Analysis ─────────────────────────────────────────────────────────

export const analyzeText = (text) =>
  api.post("/api/journal/analyze", { text });

// ── Insights ─────────────────────────────────────────────────────────────────

export const getInsights = (userId) =>
  api.get(`/api/journal/insights/${userId}`);