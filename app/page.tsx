"use client";

import { useState } from "react";

export default function Home() {
  const [target, setTarget] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      // ⛔ This will work AFTER we build the backend at http://localhost:8000/scan
      const res = await fetch("https://web-api-recon.onrender.com/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError("Failed to contact API (backend not running yet?)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: "sans-serif", padding: "24px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", marginBottom: "16px" }}>
        Web Recon Tool
      </h1>

      <form onSubmit={handleScan} style={{ display: "flex", gap: "8px", maxWidth: "600px" }}>
        <input
          style={{ flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          placeholder="https://example.com"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: "4px",
            border: "none",
            backgroundColor: "#111",
            color: "#fff",
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </form>

      {error && (
        <p style={{ color: "red", marginTop: "12px" }}>{error}</p>
      )}

      {result && (
        <section
          style={{
            marginTop: "24px",
            maxWidth: "700px",
            border: "1px solid #ddd",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
            Result
          </h2>

          {result.error && (
            <p style={{ color: "red" }}>Error: {result.error}</p>
          )}

          <p><b>Target:</b> {result.target}</p>
          <p><b>Host:</b> {result.host}</p>
          <p><b>IP:</b> {result.ip}</p>

          {"status_code" in result && (
            <>
              <p><b>Status:</b> {result.status_code}</p>
              <p><b>Response time:</b> {result.response_time_ms} ms</p>
              <p><b>Title:</b> {result.title || "N/A"}</p>

              <div style={{ marginTop: "8px" }}>
                <b>Interesting headers:</b>
                <ul>
                  {result.interesting_headers &&
                    Object.entries(result.interesting_headers).map(
                      ([k, v]: any) => (
                        <li key={k}>
                          {k}: {String(v)}
                        </li>
                      )
                    )}
                </ul>
              </div>

              {result.hints && result.hints.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <b>Security hints:</b>
                  <ul>
                    {result.hints.map((h: string, i: number) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
