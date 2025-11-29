"use client";

import { useState, FormEvent } from "react";

export default function Home() {
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("https://web-api-recon.onrender.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("API error:", res.status, text);
        setError(`API error: ${res.status}`);
        return;
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to contact API (backend not running yet?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="hacker-bg">
      <div className="overlay-grid" />

      <div className="layout">
        {/* Header */}
        <header className="header">
          <div>
            <h1 className="title">
              🧑‍💻 <span className="accent">WEB</span> RECON TERMINAL
            </h1>
            <p className="subtitle">
              Lightweight OSINT / recon dashboard for ethical hacking & lab use only.
            </p>
          </div>
          <div className="header-status">
            <span className="status-dot" />
            <span className="status-text">
              Backend: <span className="accent">ONLINE</span>
            </span>
          </div>
        </header>

        {/* Input + log */}
        <section className="top-row">
          <div className="glass-card scan-card fade-in">
            <h2 className="card-title">Target Scanner</h2>
            <p className="card-help">
              Enter a URL or domain. The tool will probe HTTP, headers, common
              ports and robots.txt.
            </p>

            <form onSubmit={handleScan} className="scan-form">
              <input
                className="scan-input"
                placeholder="https://example.com"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
              />
              <button
                type="submit"
                className="scan-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loader">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                    Scanning...
                  </span>
                ) : (
                  <>Launch Scan</>
                )}
              </button>
            </form>

            {error && <p className="error-text">{error}</p>}

            <div className="small-log">
              <div className="log-header">Event Log</div>
              <div className="log-body">
                {loading && <div>&gt; dispatching HTTP probe…</div>}
                {loading && <div>&gt; fingerprinting response headers…</div>}
                {loading && <div>&gt; running mini port scan…</div>}
                {result && !loading && (
                  <>
                    <div>&gt; scan completed for {result.host}</div>
                    <div>
                      &gt; status {result.status_code} in{" "}
                      {result.response_time_ms} ms
                    </div>
                    <div>&gt; risk profile: {result.risk}</div>
                  </>
                )}
                {!loading && !result && (
                  <div className="log-muted">
                    &gt; waiting for target<span className="cursor">_</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats block when result exists */}
          {result && (
            <div className="glass-card compact-card fade-in">
              <h2 className="card-title">Quick Glance</h2>
              <div className="stats-grid">
                <div className="stat-pill">
                  <div className="label">STATUS</div>
                  <div className="value">
                    {result.status_code} ({result.status_family})
                  </div>
                </div>
                <div className="stat-pill">
                  <div className="label">LATENCY</div>
                  <div className="value">{result.response_time_ms} ms</div>
                </div>
                <div className="stat-pill">
                  <div className="label">SIZE</div>
                  <div className="value">{result.content_length} bytes</div>
                </div>
                <div className="stat-pill">
                  <div className="label">RISK</div>
                  <div
                    className={`risk-pill risk-${String(
                      result.risk || ""
                    ).toLowerCase()}`}
                  >
                    {result.risk}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        {result && (
          <section className="results-grid fade-in">
            {/* Overview */}
            <div className="glass-card">
              <h3 className="card-title">Overview</h3>
              <div className="kv">
                <span>Target</span>
                <code>{result.target}</code>
              </div>
              {result.final_url && (
                <div className="kv">
                  <span>Final URL</span>
                  <code>{result.final_url}</code>
                </div>
              )}
              <div className="kv">
                <span>Host</span>
                <code>{result.host}</code>
              </div>
              <div className="kv">
                <span>IP</span>
                <code>{result.ip}</code>
              </div>
              {result.reverse_dns && (
                <div className="kv">
                  <span>Reverse DNS</span>
                  <code>{result.reverse_dns}</code>
                </div>
              )}
              {result.scheme && (
                <div className="kv">
                  <span>Scheme</span>
                  <code>{String(result.scheme).toUpperCase()}</code>
                </div>
              )}
              {result.timestamp && (
                <div className="kv">
                  <span>Scanned (UTC)</span>
                  <code>{result.timestamp}</code>
                </div>
              )}
            </div>

            {/* Headers */}
            <div className="glass-card">
              <h3 className="card-title">Interesting Headers</h3>
              {result.interesting_headers &&
              Object.keys(result.interesting_headers).length > 0 ? (
                <ul className="list">
                  {Object.entries(result.interesting_headers).map(
                    ([k, v]: any) => (
                      <li key={k}>
                        <span className="list-key">{k}</span>
                        <span className="list-value">{String(v)}</span>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p className="muted">No interesting headers detected.</p>
              )}
            </div>

            {/* Ports */}
            <div className="glass-card">
              <h3 className="card-title">Common Ports</h3>
              {result.ports && Object.keys(result.ports).length > 0 ? (
                <table className="ports-table">
                  <thead>
                    <tr>
                      <th>Port</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(result.ports).map(
                      ([port, status]: any) => (
                        <tr key={port}>
                          <td>{port}</td>
                          <td>
                            <span
                              className={
                                status === "open"
                                  ? "port-pill port-open"
                                  : "port-pill port-closed"
                              }
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              ) : (
                <p className="muted">No port data available.</p>
              )}
            </div>

            {/* robots.txt */}
            <div className="glass-card">
              <h3 className="card-title">robots.txt</h3>
              {result.robots ? (
                <>
                  <div className="kv">
                    <span>URL</span>
                    <code>{result.robots.url}</code>
                  </div>
                  <div className="kv">
                    <span>Found</span>
                    <code>{result.robots.found ? "Yes" : "No"}</code>
                  </div>
                  {result.robots.status_code && (
                    <div className="kv">
                      <span>Status</span>
                      <code>{result.robots.status_code}</code>
                    </div>
                  )}
                  {result.robots.preview &&
                    result.robots.preview.length > 0 && (
                      <div className="robots-preview">
                        {result.robots.preview.map(
                          (line: string, idx: number) => (
                            <div key={idx}>{line}</div>
                          )
                        )}
                      </div>
                    )}
                </>
              ) : (
                <p className="muted">No robots.txt data.</p>
              )}
            </div>

            {/* Security findings */}
            <div className="glass-card wide">
              <h3 className="card-title">Security Findings</h3>
              {result.hints && result.hints.length > 0 ? (
                <ul className="bullets">
                  {result.hints.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">
                  No obvious misconfigurations detected. This does{" "}
                  <b>not</b> mean the target is fully secure.
                </p>
              )}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <span className="footer-left">
            ⚠ For educational use. Scan only hosts you have permission to test.
          </span>
          <span className="footer-right">
            Built by <span className="accent">B5</span> · Cybersec Recon 🛡️
          </span>
        </footer>
      </div>

      {/* Global styles for the “hacker” vibe */}
      <style jsx global>{`
        body {
          margin: 0;
        }

        .hacker-bg {
          min-height: 100vh;
          background: radial-gradient(circle at top, #1b2735, #090a0f 60%);
          color: #e5f9ff;
          position: relative;
          overflow-x: hidden;
        }

        .overlay-grid {
          pointer-events: none;
          position: fixed;
          inset: 0;
          background-image: linear-gradient(
              rgba(0, 255, 157, 0.04) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(0, 255, 157, 0.04) 1px,
              transparent 1px
            );
          background-size: 40px 40px;
          opacity: 0.6;
        }

        .layout {
          position: relative;
          z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px 16px 40px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }

        .title {
          margin: 0;
          font-size: 28px;
          letter-spacing: 0.12em;
        }

        .accent {
          color: #00ff9d;
        }

        .subtitle {
          margin: 4px 0 0;
          font-size: 13px;
          color: #8ca3b3;
        }

        .header-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #7ee8a6;
        }

        .status-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #00ff9d;
          box-shadow: 0 0 8px rgba(0, 255, 157, 0.8);
          animation: pulse 1.6s infinite;
        }

        .status-text {
          opacity: 0.9;
        }

        .top-row {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.2fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 900px) {
          .top-row {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .glass-card {
          background: linear-gradient(
            to bottom right,
            rgba(15, 20, 30, 0.9),
            rgba(10, 18, 25, 0.94)
          );
          border-radius: 14px;
          border: 1px solid rgba(0, 255, 157, 0.12);
          box-shadow: 0 14px 35px rgba(0, 0, 0, 0.6);
          padding: 14px 16px;
          backdrop-filter: blur(10px);
        }

        .compact-card {
          align-self: stretch;
        }

        .card-title {
          margin: 0 0 6px;
          font-size: 16px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #9decc4;
        }

        .card-help {
          margin: 0 0 12px;
          font-size: 12px;
          color: #8ca3b3;
        }

        .scan-form {
          display: flex;
          gap: 8px;
          margin-bottom: 10px;
        }

        .scan-input {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid rgba(148, 163, 184, 0.6);
          background: rgba(8, 12, 18, 0.9);
          color: #e5f9ff;
          font-size: 14px;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .scan-input::placeholder {
          color: #64748b;
        }

        .scan-input:focus {
          border-color: #00ff9d;
          box-shadow: 0 0 0 1px rgba(0, 255, 157, 0.2);
          background: rgba(8, 12, 18, 0.95);
        }

        .scan-button {
          min-width: 120px;
          border-radius: 999px;
          border: 1px solid rgba(0, 255, 157, 0.4);
          background: radial-gradient(
            circle at top left,
            #00ff9d,
            #009f66 60%,
            #006b46
          );
          color: #020617;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.12s ease, box-shadow 0.12s ease,
            opacity 0.12s ease;
        }

        .scan-button:hover:not(:disabled) {
          transform: translateY(-1px) scale(1.01);
          box-shadow: 0 10px 25px rgba(0, 255, 157, 0.35);
        }

        .scan-button:disabled {
          opacity: 0.65;
          cursor: default;
          box-shadow: none;
        }

        .btn-loader {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .dot {
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: #0f172a;
          animation: bounce 1s infinite;
        }

        .dot-1 {
          animation-delay: 0s;
        }
        .dot-2 {
          animation-delay: 0.16s;
        }
        .dot-3 {
          animation-delay: 0.32s;
        }

        .error-text {
          color: #fecaca;
          font-size: 12px;
          margin-top: 6px;
        }

        .small-log {
          margin-top: 10px;
          border-radius: 10px;
          background: radial-gradient(
              circle at top left,
              rgba(0, 255, 157, 0.14),
              transparent 55%
            ),
            rgba(6, 12, 22, 0.96);
          border: 1px solid rgba(0, 255, 157, 0.25);
          box-shadow: 0 0 18px rgba(0, 255, 157, 0.25);
          overflow: hidden;
          font-size: 11px;
        }

        .log-header {
          padding: 6px 10px;
          background: rgba(15, 23, 42, 0.95);
          border-bottom: 1px solid rgba(15, 23, 42, 0.95);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #9decc4;
        }

        .log-body {
          padding: 8px 10px 9px;
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular,
            Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
            monospace;
          color: #cbd5f5;
          position: relative;
          overflow: hidden;
        }

        .log-body::before {
          content: "";
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            to bottom,
            rgba(15, 23, 42, 0),
            rgba(15, 23, 42, 0) 2px,
            rgba(15, 23, 42, 0.35) 3px
          );
          mix-blend-mode: soft-light;
          pointer-events: none;
        }

        .log-muted {
          color: #64748b;
        }

        .cursor {
          display: inline-block;
          width: 6px;
          margin-left: 2px;
          animation: blink 1s steps(2, start) infinite;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 8px;
        }

        @media (max-width: 1000px) {
          .results-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .results-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        .wide {
          grid-column: span 3;
        }

        @media (max-width: 1000px) {
          .wide {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .wide {
            grid-column: span 1;
          }
        }

        .kv {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
          font-size: 12px;
        }

        .kv span {
          color: #8ca3b3;
        }

        .kv code {
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular,
            Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
            monospace;
          font-size: 11px;
          color: #e5f9ff;
          background: rgba(15, 23, 42, 0.8);
          padding: 2px 6px;
          border-radius: 999px;
        }

        .list {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 12px;
        }

        .list li {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          padding: 4px 0;
          border-bottom: 1px dashed rgba(51, 65, 85, 0.6);
        }

        .list li:last-child {
          border-bottom: none;
        }

        .list-key {
          color: #9decc4;
        }

        .list-value {
          color: #e5f9ff;
          max-width: 60%;
          text-align: right;
          word-break: break-all;
        }

        .muted {
          font-size: 12px;
          color: #8ca3b3;
        }

        .ports-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }

        .ports-table th,
        .ports-table td {
          padding: 4px 4px;
          border-bottom: 1px solid rgba(30, 41, 59, 0.8);
        }

        .ports-table th {
          text-align: left;
          color: #9decc4;
          font-weight: 500;
        }

        .port-pill {
          padding: 1px 8px;
          border-radius: 999px;
          font-size: 11px;
        }

        .port-open {
          background: rgba(34, 197, 94, 0.12);
          color: #4ade80;
        }

        .port-closed {
          background: rgba(75, 85, 99, 0.4);
          color: #e5e7eb;
        }

        .robots-preview {
          margin-top: 6px;
          padding: 6px;
          font-family: "JetBrains Mono", ui-monospace, SFMono-Regular,
            Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
            monospace;
          font-size: 11px;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 6px;
          max-height: 150px;
          overflow: auto;
        }

        .bullets {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .stat-pill {
          padding: 8px 10px;
          border-radius: 10px;
          background: radial-gradient(
              circle at top left,
              rgba(0, 255, 157, 0.1),
              transparent 55%
            ),
            rgba(15, 23, 42, 0.96);
        }

        .label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #64748b;
          margin-bottom: 2px;
        }

        .value {
          font-size: 13px;
          color: #e5f9ff;
        }

        .risk-pill {
          display: inline-block;
          padding: 2px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
        }

        .risk-low {
          background: rgba(34, 197, 94, 0.16);
          color: #4ade80;
        }

        .risk-medium {
          background: rgba(250, 204, 21, 0.16);
          color: #facc15;
        }

        .risk-high {
          background: rgba(248, 113, 113, 0.16);
          color: #f97373;
        }

        .footer {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 11px;
          color: #64748b;
        }

        .footer-right {
          text-align: right;
        }

        @media (max-width: 768px) {
          .footer {
            flex-direction: column;
            align-items: flex-start;
          }
          .footer-right {
            text-align: left;
          }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-4px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%,
          50% {
            opacity: 1;
          }
          50.01%,
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
