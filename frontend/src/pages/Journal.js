import React, { useState, useEffect, useCallback } from "react";
import { createEntry, getEntries, analyzeText, getInsights } from "../api";
import "./Journal.css";

// ── Helpers ──────────────────────────────────────────────────────────────────

const AMBIENCIES = [
  { id: "forest",   label: "Forest",   emoji: "🌲" },
  { id: "ocean",    label: "Ocean",    emoji: "🌊" },
  { id: "mountain", label: "Mountain", emoji: "⛰️" },
];

const ambienceColor = (a) =>
  a === "forest" ? "var(--forest)" : a === "ocean" ? "var(--ocean)" : "var(--mountain)";

const formatDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

// ── Sub-components ────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-leaf">✦</span>
        <span className="header-title">ArvyaX</span>
        <span className="header-subtitle">Nature Journal</span>
      </div>
    </header>
  );
}

function InsightsPanel({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInsights(userId);
      setData(res.data);
    } catch {
      setError("Could not load insights.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <section className="insights-panel">
      <div className="section-header">
        <h2 className="section-title">Insights</h2>
        <button className="icon-btn" onClick={fetch} title="Refresh">↻</button>
      </div>

      {loading && <p className="muted-text">Loading…</p>}
      {error   && <p className="error-text">{error}</p>}

      {data && !loading && (
        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-value">{data.totalEntries ?? 0}</span>
            <span className="insight-label">Total Entries</span>
          </div>
          <div className="insight-card accent">
            <span className="insight-value">{data.topEmotion ?? "—"}</span>
            <span className="insight-label">Top Emotion</span>
          </div>
          <div className="insight-card">
            <span className="insight-value capitalize">{data.mostUsedAmbience ?? "—"}</span>
            <span className="insight-label">Fav. Ambience</span>
          </div>

          {data.recentKeywords?.length > 0 && (
            <div className="insight-keywords">
              <span className="insight-label mb-4">Recent Keywords</span>
              <div className="tags">
                {data.recentKeywords.map((k) => (
                  <span key={k} className="tag">{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function AnalysisResult({ result, streaming }) {
  if (!result && !streaming) return null;

  return (
    <div className={`analysis-result ${streaming ? "streaming" : ""}`}>
      <div className="analysis-header">
        <span className="analysis-icon">✦</span>
        <span>Emotion Analysis</span>
        {streaming && <span className="streaming-dot" />}
      </div>

      {result ? (
        <>
          <div className="analysis-row">
            <span className="analysis-key">Emotion</span>
            <span className="analysis-emotion">{result.emotion}</span>
          </div>
          {result.summary && (
            <div className="analysis-row">
              <span className="analysis-key">Summary</span>
              <span className="analysis-summary">{result.summary}</span>
            </div>
          )}
          {result.keywords?.length > 0 && (
            <div className="analysis-row">
              <span className="analysis-key">Keywords</span>
              <div className="tags">
                {result.keywords.map((k) => (
                  <span key={k} className="tag tag-accent">{k}</span>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="muted-text">Analyzing…</p>
      )}
    </div>
  );
}

function EntryCard({ entry }) {
  const [analysis, setAnalysis] = useState(entry.analysis || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeText(entry.text);
      setAnalysis(res.data);
    } catch {
      setError("Analysis failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const amb = AMBIENCIES.find((a) => a.id === entry.ambience) || AMBIENCIES[0];

  return (
    <article className="entry-card" onClick={() => setExpanded((v) => !v)}>
      <div className="entry-top">
        <div className="entry-meta">
          <span
            className="entry-ambience"
            style={{ color: ambienceColor(entry.ambience), borderColor: ambienceColor(entry.ambience) + "55" }}
          >
            {amb.emoji} {amb.label}
          </span>
          <span className="entry-date">{formatDate(entry.createdAt || entry.created_at || new Date())}</span>
        </div>
        <span className="entry-chevron">{expanded ? "▲" : "▼"}</span>
      </div>

      <p className="entry-text">{entry.text}</p>

      {expanded && (
        <div
          className="entry-expanded"
          onClick={(e) => e.stopPropagation()}
        >
          {!analysis && !analyzing && (
            <button className="btn-analyze" onClick={handleAnalyze}>
              ✦ Analyze Emotion
            </button>
          )}
          {analyzing && <p className="muted-text">Analyzing…</p>}
          {error && <p className="error-text">{error}</p>}
          <AnalysisResult result={analysis} />
        </div>
      )}
    </article>
  );
}

function NewEntryForm({ userId, onCreated }) {
  const [text, setText] = useState("");
  const [ambience, setAmbience] = useState("forest");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [analyzeNow, setAnalyzeNow] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await createEntry(userId, ambience, text.trim());
      if (analyzeNow) {
        setAnalyzing(true);
        const res = await analyzeText(text.trim());
        setAnalysis(res.data);
        setAnalyzing(false);
      }
      setText("");
      onCreated();
    } catch (err) {
      setError("Failed to save entry. Is the backend running?");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="new-entry-section">
      <h2 className="section-title">New Entry</h2>
      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="ambience-selector">
          {AMBIENCIES.map((a) => (
            <button
              type="button"
              key={a.id}
              className={`ambience-btn ${ambience === a.id ? "active" : ""}`}
              style={ambience === a.id ? {
                borderColor: ambienceColor(a.id),
                color: ambienceColor(a.id),
                background: ambienceColor(a.id) + "18",
              } : {}}
              onClick={() => setAmbience(a.id)}
            >
              <span className="ambience-emoji">{a.emoji}</span>
              {a.label}
            </button>
          ))}
        </div>

        <textarea
          className="entry-textarea"
          placeholder="How did your session feel today…"
          value={text}
          onChange={(e) => { setText(e.target.value); setAnalysis(null); }}
          rows={5}
          maxLength={2000}
        />
        <div className="char-count">{text.length}/2000</div>

        <div className="form-footer">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={analyzeNow}
              onChange={(e) => setAnalyzeNow(e.target.checked)}
            />
            Analyze after saving
          </label>
          <button
            type="submit"
            className="btn-primary"
            disabled={submitting || !text.trim()}
          >
            {submitting ? "Saving…" : "Save Entry"}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {analyzing && <p className="muted-text">Running analysis…</p>}
        <AnalysisResult result={analysis} />
      </form>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Journal({ userId }) {
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entriesError, setEntriesError] = useState(null);
  const [refreshInsights, setRefreshInsights] = useState(0);

  const fetchEntries = useCallback(async () => {
    setLoadingEntries(true);
    setEntriesError(null);
    try {
      const res = await getEntries(userId);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data.entries || [];
      setEntries(list.slice().reverse());
    } catch {
      setEntriesError("Could not load entries. Is the backend running?");
    } finally {
      setLoadingEntries(false);
    }
  }, [userId]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCreated = () => {
    fetchEntries();
    setRefreshInsights((v) => v + 1);
  };

  return (
    <div className="journal-layout">
      <Header />

      <main className="journal-main">
        {/* Left column */}
        <div className="journal-left">
          <NewEntryForm userId={userId} onCreated={handleCreated} />
        </div>

        {/* Right column */}
        <div className="journal-right">
          <InsightsPanel userId={userId} key={refreshInsights} />

          <section className="entries-section">
            <div className="section-header">
              <h2 className="section-title">Past Entries</h2>
              <button className="icon-btn" onClick={fetchEntries} title="Refresh">↻</button>
            </div>

            {loadingEntries && <p className="muted-text">Loading entries…</p>}
            {entriesError  && <p className="error-text">{entriesError}</p>}

            {!loadingEntries && entries.length === 0 && !entriesError && (
              <p className="muted-text empty">No entries yet. Write your first one →</p>
            )}

            <div className="entries-list">
              {entries.map((entry, i) => (
                <EntryCard key={entry.id || entry._id || i} entry={entry} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}