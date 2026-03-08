import { useState, useRef, useCallback, useEffect } from "react";

// *** REPLACE THIS with your Web3Forms access key ***
// Get one free at https://web3forms.com (enter scott.freitag91@gmail.com)
const WEB3FORMS_KEY = "a570a1cd-cdaa-4330-83a9-b8dbaccf8748";

async function sendEmail(subject, data) {
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, ...data }),
    });
  } catch (e) { console.error("Email failed:", e); }
}

const COMPANIES = [
  {
    ticker: "AAPL", name: "Apple", color: "#A2AAAD", accent: "#fff",
    nextEarnings: "Apr 30, 2026", mcap: "$3.9T",
    kpis: [
      { id: "aapl-iphone", label: "iPhone Revenue", unit: "$B", line: 55.0, desc: "Last Q: $85.3B (holiday). Q2 guided 13-16% total rev growth" },
      { id: "aapl-services", label: "Services Revenue", unit: "$B", line: 31.0, desc: "Last Q: $30.0B (record, +14% YoY). Guided similar growth" },
      { id: "aapl-china", label: "Greater China Revenue", unit: "$B", line: 18.0, desc: "Last Q: $25.5B (+38% YoY surge). March Q typically lower" },
      { id: "aapl-gm", label: "Gross Margin", unit: "%", line: 47.0, desc: "Last Q: 48.2%. Guided 46-48%. Rising component costs" },
    ],
  },
  {
    ticker: "NVDA", name: "NVIDIA", color: "#76b900", accent: "#76b900",
    nextEarnings: "May 27, 2026", mcap: "$4.3T",
    kpis: [
      { id: "nvda-rev", label: "Total Revenue", unit: "$B", line: 78.0, desc: "Guided $78B +/-2%. Last Q: $68.1B (+73% YoY)" },
      { id: "nvda-dc", label: "Data Center Revenue", unit: "$B", line: 72.0, desc: "91%+ of total. Last Q: $62.3B (+75% YoY). THE number" },
      { id: "nvda-gm", label: "Gross Margin", unit: "%", line: 75.0, desc: "Guided 75.0% +/-50bps. Last Q: 75.2%. Blackwell mix" },
      { id: "nvda-eps", label: "Earnings Per Share", unit: "$", line: 1.78, desc: "Consensus $1.78. Last Q: $1.62 (beat by $0.08)" },
    ],
  },
  {
    ticker: "TSLA", name: "Tesla", color: "#cc0000", accent: "#ff4444",
    nextEarnings: "Apr 22, 2026", mcap: "$1.1T",
    kpis: [
      { id: "tsla-del", label: "Total Deliveries", unit: "K", line: 450, desc: "Last Q: 418K (-16% seq). Cybercab ramp starting. THE number" },
      { id: "tsla-rev", label: "Total Revenue", unit: "$B", line: 26.0, desc: "Last Q: $28.1B (+12% YoY). Auto + Energy + Services" },
      { id: "tsla-autogm", label: "Auto Gross Margin (ex credits)", unit: "%", line: 18.0, desc: "Last Q: 17.9%. Up from 15.4%. Key profitability signal" },
      { id: "tsla-energy", label: "Energy Storage Deployed", unit: "GWh", line: 12.0, desc: "Last Q: 14.2 GWh (record). Growing 29% YoY" },
    ],
  },
  {
    ticker: "NFLX", name: "Netflix", color: "#e50914", accent: "#ff3333",
    nextEarnings: "Apr 16, 2026", mcap: "$430B",
    kpis: [
      { id: "nflx-rev", label: "Revenue", unit: "$B", line: 12.2, desc: "Q1 forecast: ~$12.2B. 2026 full year guided $50.7-51.7B" },
      { id: "nflx-opm", label: "Operating Margin", unit: "%", line: 32.0, desc: "2026 target: 31.5%. Expanding consistently every year" },
      { id: "nflx-members", label: "Paid Memberships", unit: "M", line: 332, desc: "Crossed 325M in Q4. Total membership milestone everyone watches" },
      { id: "nflx-adrev", label: "Ad Revenue Run Rate", unit: "$B", line: 0.75, desc: "2025 total >$1.5B. 2026 guided to roughly double to ~$3B" },
    ],
  },
  {
    ticker: "META", name: "Meta Platforms", color: "#0668E1", accent: "#3b82f6",
    nextEarnings: "Apr 30, 2026", mcap: "$1.8T",
    kpis: [
      { id: "meta-rev", label: "Revenue", unit: "$B", line: 55.0, desc: "Q1 guided $53.5-56.5B. Last Q: $59.9B (+24% YoY)" },
      { id: "meta-dap", label: "Family Daily Active People", unit: "B", line: 3.62, desc: "Last Q: 3.58B (+7% YoY). Key engagement metric" },
      { id: "meta-adprice", label: "Avg Price Per Ad Change", unit: "% YoY", line: 8.0, desc: "Last Q: +6% YoY. Full year 2025: +9%. Monetization signal" },
      { id: "meta-rloss", label: "Reality Labs Loss", unit: "$B", line: 5.0, desc: "Last Q: $5.07B loss. Watching for any narrowing" },
    ],
  },
];

function getOverUnder(kpi) {
  const s = kpi.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const over = 42 + (s % 22);
  return { over, under: 100 - over };
}

// ─── WAGER DIAL ───
function WagerDial({ value, onChange }) {
  const dragging = useRef(false);
  const lastY = useRef(0);
  const display = String(value).padStart(4, " ");
  const onDown = (e) => { dragging.current = true; lastY.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!dragging.current) return;
    const d = lastY.current - e.clientY;
    if (Math.abs(d) > 3) { onChange(Math.min(5000, Math.max(1, value + (d > 0 ? (Math.abs(d) > 20 ? 10 : 1) : (Math.abs(d) > 20 ? -10 : -1))))); lastY.current = e.clientY; }
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#6ee7b7", fontFamily: "monospace", textTransform: "uppercase", opacity: 0.7 }}>drag to set wager</div>
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} style={{
        display: "flex", gap: 2, cursor: "ns-resize", userSelect: "none", padding: "5px 8px",
        background: "linear-gradient(180deg, #060610 0%, #12122a 50%, #060610 100%)",
        borderRadius: 8, border: "1px solid #6ee7b720", touchAction: "none",
      }}>
        {display.split("").map((c, i) => (
          <div key={i} style={{
            width: 28, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            background: c === " " ? "transparent" : "linear-gradient(180deg, #0c0c1e 0%, #16163a 45%, #16163a 55%, #0c0c1e 100%)",
            borderRadius: 4, fontSize: 22, fontWeight: 700, fontFamily: "monospace",
            color: c === " " ? "transparent" : "#6ee7b7", border: c === " " ? "none" : "1px solid #6ee7b720",
            textShadow: "0 0 8px rgba(110,231,183,0.4)",
          }}>{c}</div>
        ))}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 2, fontSize: 13, color: "#6ee7b760", fontFamily: "monospace" }}>$</div>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[25, 100, 250, 500].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            background: value === v ? "#6ee7b715" : "#ffffff05", border: "1px solid " + (value === v ? "#6ee7b7" : "#ffffff10"),
            color: value === v ? "#6ee7b7" : "#555", borderRadius: 4, padding: "2px 7px", fontSize: 9, cursor: "pointer", fontFamily: "monospace",
          }}>${v}</button>
        ))}
      </div>
    </div>
  );
}

// ─── SIGN UP MODAL ───
function SignUpModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ username: "", email: "", age: "", gender: "", expertise: "", portfolioSize: "", tradingFreq: "", venmo: "", referral: "" });
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const ss = { width: "100%", padding: "10px 12px", background: "#0e0e20", border: "1px solid #ffffff15", borderRadius: 8, color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", appearance: "none", WebkitAppearance: "none" };
  const ls = { fontSize: 11, color: "#94a3b8", marginBottom: 4, display: "block", fontFamily: "monospace", letterSpacing: 0.5 };
  const ok = form.username && form.email && form.age && form.gender && form.expertise;

  const handleSubmit = async () => {
    if (!ok) return;
    setLoading(true);
    await sendEmail("[BetKPI] New Signup: " + form.username, {
      message: "NEW USER SIGNUP\n\nUsername: " + form.username + "\nEmail: " + form.email + "\nAge: " + form.age + "\nGender: " + form.gender + "\nExpertise: " + form.expertise + "\nPortfolio: " + (form.portfolioSize || "not provided") + "\nTrading Freq: " + (form.tradingFreq || "not provided") + "\nVenmo: " + (form.venmo || "not provided") + "\nReferral: " + (form.referral || "not provided"),
      from_name: "BetKPI Signups",
    });
    localStorage.setItem("betkpi_user", JSON.stringify(form));
    setLoading(false);
    onSubmit(form);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div style={{ width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", background: "linear-gradient(180deg, #111128 0%, #0a0a14 100%)", border: "1px solid #ffffff12", borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#e2e8f0" }}>Join <span style={{ color: "#6ee7b7" }}>betkpi</span></div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Create your account to start predicting</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 20 }}>x</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><label style={ls}>Username *</label><input placeholder="traderguy42" value={form.username} onChange={set("username")} style={ss} /></div>
          <div><label style={ls}>Email *</label><input placeholder="you@email.com" type="email" value={form.email} onChange={set("email")} style={ss} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label style={ls}>Age *</label><select value={form.age} onChange={set("age")} style={ss}><option value="">Select</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55-64</option><option>65+</option></select></div>
            <div><label style={ls}>Gender *</label><select value={form.gender} onChange={set("gender")} style={ss}><option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
          </div>
          <div><label style={ls}>Investment Expertise *</label><select value={form.expertise} onChange={set("expertise")} style={ss}><option value="">Select</option><option>Beginner - new to investing</option><option>Casual - follow markets occasionally</option><option>Active - trade regularly</option><option>Advanced - use options/derivatives</option><option>Professional - finance is my career</option></select></div>
          <div><label style={ls}>Portfolio Size (optional)</label><select value={form.portfolioSize} onChange={set("portfolioSize")} style={ss}><option value="">Prefer not to say</option><option>Under $1K</option><option>$1K-$10K</option><option>$10K-$50K</option><option>$50K-$250K</option><option>$250K-$1M</option><option>$1M+</option></select></div>
          <div><label style={ls}>How often do you trade? (optional)</label><select value={form.tradingFreq} onChange={set("tradingFreq")} style={ss}><option value="">Select</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>A few times a year</option><option>Rarely / buy and hold</option></select></div>
          <div><label style={ls}>Venmo Handle (optional - for prize payouts)</label><input placeholder="@your-venmo" value={form.venmo} onChange={set("venmo")} style={ss} /></div>
          <div><label style={ls}>How did you hear about us? (optional)</label><select value={form.referral} onChange={set("referral")} style={ss}><option value="">Select</option><option>Twitter / X</option><option>Reddit</option><option>TikTok</option><option>Friend referral</option><option>News article</option><option>Search</option><option>Other</option></select></div>
        </div>
        <button disabled={!ok || loading} onClick={handleSubmit} style={{
          width: "100%", marginTop: 20, padding: "14px 0", borderRadius: 10, border: "none",
          background: ok ? "linear-gradient(135deg, #059669 0%, #6ee7b7 100%)" : "#333",
          color: ok ? "#000" : "#666", fontSize: 14, fontWeight: 800, cursor: ok ? "pointer" : "not-allowed",
          fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase",
          boxShadow: ok ? "0 4px 20px rgba(110,231,183,0.25)" : "none",
        }}>{loading ? "Creating..." : "Create Account"}</button>
        <div style={{ fontSize: 10, color: "#4b5563", textAlign: "center", marginTop: 10 }}>By signing up you agree to our Terms. Your predictions help build better market intelligence.</div>
      </div>
    </div>
  );
}

// ─── KPI CARD ───
function KPICard({ kpi, co, onSelect, isActive }) {
  const p = getOverUnder(kpi);
  const isPct = kpi.unit.includes("%");
  return (
    <div onClick={() => onSelect(kpi)} style={{
      background: isActive ? co.color + "0a" : "#0c0c18", border: "1px solid " + (isActive ? co.color + "40" : "#ffffff08"),
      borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3, flex: 1 }}>{kpi.label}</div>
        <div style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "#ffffff08", color: "#888", fontFamily: "monospace", whiteSpace: "nowrap", marginLeft: 8 }}>{kpi.unit}</div>
      </div>
      <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5, marginBottom: 12 }}>{kpi.desc}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "6px 10px", background: "#ffffff04", borderRadius: 7, border: "1px solid #ffffff06" }}>
        <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>LINE</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", fontFamily: "monospace", letterSpacing: -1 }}>{kpi.line}{isPct ? "%" : ""}</span>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        <div style={{ flex: 1, padding: "8px 0", borderRadius: 7, textAlign: "center", background: "#6ee7b708", border: "1px solid #6ee7b720" }}>
          <div style={{ fontSize: 8, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>Over</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#6ee7b7", fontFamily: "monospace" }}>{p.over}c</div>
        </div>
        <div style={{ flex: 1, padding: "8px 0", borderRadius: 7, textAlign: "center", background: "#f8717108", border: "1px solid #f8717120" }}>
          <div style={{ fontSize: 8, color: "#f87171", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>Under</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f87171", fontFamily: "monospace" }}>{p.under}c</div>
        </div>
      </div>
    </div>
  );
}

// ─── TRADE SLIP ───
function TradeSlip({ kpi, co, onClose, user, onRequireLogin }) {
  const [side, setSide] = useState("over");
  const [wager, setWager] = useState(100);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const p = getOverUnder(kpi);
  const price = side === "over" ? p.over : p.under;
  const contracts = Math.floor((wager / price) * 100);
  const isPct = kpi.unit.includes("%");

  const handleSubmit = async () => {
    if (!user) { onRequireLogin(); return; }
    setLoading(true);
    await sendEmail("[BetKPI] New Bet: " + user.username + " on " + co.ticker, {
      message: "NEW BET\n\nUser: " + user.username + " (" + user.email + ")\nExpertise: " + user.expertise + "\nPortfolio: " + (user.portfolioSize || "N/A") + "\n\nBet Details:\nTicker: " + co.ticker + "\nKPI: " + kpi.label + "\nLine: " + kpi.line + (isPct ? "%" : " " + kpi.unit) + "\nSide: " + side.toUpperCase() + "\nPrice: " + price + "c\nWager: $" + wager + "\nContracts: " + contracts + "\nMax Payout: $" + contracts,
      from_name: "BetKPI Bets",
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ background: "linear-gradient(180deg, #111128 0%, #0a0a12 100%)", border: "1px solid #6ee7b730", borderRadius: 14, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>&#10003;</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#6ee7b7", marginBottom: 6 }}>Bet Placed!</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{co.ticker} - {kpi.label}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: side === "over" ? "#6ee7b7" : "#f87171", marginBottom: 4 }}>{side.toUpperCase()} {kpi.line}{isPct ? "%" : ""}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>${wager} wagered - {contracts} contracts</div>
        <button onClick={() => { setSubmitted(false); onClose(); }} style={{
          padding: "10px 24px", borderRadius: 8, border: "1px solid #ffffff15", background: "#ffffff08",
          color: "#e2e8f0", fontSize: 12, cursor: "pointer", fontFamily: "monospace",
        }}>Place Another Bet</button>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(180deg, #111128 0%, #0a0a12 100%)", border: "1px solid #ffffff10", borderRadius: 14, padding: 20, position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>x</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, background: co.color + "15", border: "1px solid " + co.color + "30", color: co.accent, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.5 }}>{co.ticker}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{kpi.label}</div>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6, fontFamily: "monospace" }}>Line: <span style={{ color: "#fff", fontWeight: 700 }}>{kpi.line}{isPct ? "%" : ""}</span></div>
      <div style={{ display: "flex", gap: 5, marginBottom: 16 }}>
        {["over", "under"].map(s => (
          <button key={s} onClick={() => setSide(s)} style={{
            flex: 1, padding: "10px 0", borderRadius: 7, border: "1px solid " + (side === s ? (s === "over" ? "#6ee7b7" : "#f87171") : "#ffffff10"),
            background: side === s ? (s === "over" ? "#6ee7b710" : "#f8717110") : "#ffffff04",
            color: side === s ? (s === "over" ? "#6ee7b7" : "#f87171") : "#555",
            fontSize: 12, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", fontFamily: "monospace", letterSpacing: 2,
          }}>{s} {s === "over" ? p.over : p.under}c</button>
        ))}
      </div>
      <WagerDial value={wager} onChange={setWager} />
      <div style={{ marginTop: 14, padding: 12, background: "#ffffff04", borderRadius: 8, border: "1px solid #ffffff06" }}>
        {[["Avg Price", price + "c"], ["Contracts", contracts], ["Max Payout", "$" + contracts + ".00"]].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 2 ? 5 : 0 }}>
            <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace" }}>{k}</span>
            <span style={{ fontSize: 10, color: i === 2 ? "#6ee7b7" : "#ddd", fontWeight: i === 2 ? 700 : 400, fontFamily: "monospace" }}>{v}</span>
          </div>
        ))}
      </div>
      <button disabled={loading} onClick={handleSubmit} style={{
        width: "100%", marginTop: 12, padding: "12px 0", borderRadius: 8, border: "none",
        background: !user ? "linear-gradient(135deg, #059669, #6ee7b7)" : side === "over" ? "linear-gradient(135deg, #059669, #6ee7b7)" : "linear-gradient(135deg, #dc2626, #f87171)",
        color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase",
      }}>{loading ? "Submitting..." : !user ? "Sign Up to Bet" : "Buy " + side.toUpperCase() + " - $" + wager}</button>
    </div>
  );
}

// ─── MAIN APP ───
export default function BetKPI() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeBet, setActiveBet] = useState(null);
  const [activeCo, setActiveCo] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);

  // Load saved user on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("betkpi_user");
      if (saved) setUser(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const handleBet = useCallback((kpi) => {
    const co = COMPANIES.find(c => c.kpis.some(k => k.id === kpi.id));
    setActiveBet(kpi);
    setActiveCo(co);
  }, []);

  const handleSignUp = (data) => {
    setUser(data);
    setShowSignUp(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("betkpi_user");
    setUser(null);
  };

  const companies = activeTab === "ALL" ? COMPANIES : COMPANIES.filter(c => c.ticker === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{"\
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');\
        * { box-sizing: border-box; margin: 0; padding: 0; }\
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }\
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }\
        @keyframes blink { 0%,100% { opacity:.4 } 50% { opacity:1 } }\
        select option { background: #0e0e20; color: #e2e8f0; }\
      "}</style>

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onSubmit={handleSignUp} />}

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 22px", borderBottom: "1px solid #ffffff08", position: "sticky", top: 0, zIndex: 50, background: "#08080fee", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #6ee7b7, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#000", fontFamily: "monospace", boxShadow: "0 0 14px rgba(110,231,183,0.2)" }}>B</div>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: -0.5 }}>bet<span style={{ color: "#6ee7b7" }}>kpi</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6ee7b7", animation: "blink 2s infinite" }} />
          <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace", letterSpacing: 1 }}>LIVE</span>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
              <div style={{ padding: "6px 14px", borderRadius: 6, background: "#6ee7b715", border: "1px solid #6ee7b740", color: "#6ee7b7", fontSize: 11, fontWeight: 600, fontFamily: "monospace" }}>{user.username}</div>
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>logout</button>
            </div>
          ) : (
            <button onClick={() => setShowSignUp(true)} style={{ marginLeft: 10, padding: "6px 14px", borderRadius: 6, border: "1px solid #6ee7b750", background: "#6ee7b710", color: "#6ee7b7", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Sign Up</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 18px" }}>
        <div style={{ padding: "36px 0 24px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#6ee7b7", fontFamily: "monospace", marginBottom: 8 }}>Earnings KPI Markets</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Sora', sans-serif", background: "linear-gradient(135deg, #e2e8f0 0%, #6ee7b7 70%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 6 }}>Bet the KPIs that move markets.</h1>
          <p style={{ fontSize: 13, color: "#6b7280", maxWidth: 460, lineHeight: 1.5 }}>Over/under contracts on earnings metrics for AAPL, NVDA, TSLA, NFLX and META. Pick your side before earnings drop.</p>
        </div>

        <div style={{ display: "flex", gap: 5, marginBottom: 22, padding: "8px 0", borderBottom: "1px solid #ffffff08", overflowX: "auto", animation: "fadeUp 0.6s ease" }}>
          {["ALL", ...COMPANIES.map(c => c.ticker)].map(t => {
            const isA = activeTab === t;
            const col = t === "ALL" ? "#6ee7b7" : COMPANIES.find(c => c.ticker === t)?.accent || "#6ee7b7";
            return (<button key={t} onClick={() => setActiveTab(t)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid " + (isA ? col + "50" : "#ffffff0d"), background: isA ? col + "10" : "transparent", color: isA ? col : "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1, whiteSpace: "nowrap" }}>{t}</button>);
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: activeBet ? "1fr 310px" : "1fr", gap: 22, animation: "fadeUp 0.7s ease" }}>
          <div>
            {companies.map(co => (
              <div key={co.ticker} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, padding: "12px 16px", background: co.color + "06", border: "1px solid " + co.color + "15", borderRadius: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: co.color + "18", border: "1px solid " + co.color + "35", fontSize: 10, fontWeight: 800, color: co.accent, fontFamily: "monospace" }}>{co.ticker.slice(0, 2)}</div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{co.ticker}</span><span style={{ fontSize: 10, color: "#555", fontFamily: "monospace" }}>{co.mcap}</span></div>
                      <div style={{ fontSize: 10, color: "#6b7280" }}>{co.name}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>Next Earnings</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: co.accent, fontFamily: "monospace" }}>{co.nextEarnings}</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 9 }}>
                  {co.kpis.map(k => (<KPICard key={k.id} kpi={k} co={co} onSelect={handleBet} isActive={activeBet?.id === k.id} />))}
                </div>
              </div>
            ))}
          </div>
          {activeBet && activeCo && (
            <div style={{ position: "sticky", top: 68, alignSelf: "start" }}>
              <TradeSlip kpi={activeBet} co={activeCo} onClose={() => { setActiveBet(null); setActiveCo(null); }} user={user} onRequireLogin={() => setShowSignUp(true)} />
            </div>
          )}
        </div>

        <div style={{ margin: "44px 0 28px", padding: "22px 24px", background: "#0c0c18", border: "1px solid #ffffff08", borderRadius: 13 }}>
          <div style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace", marginBottom: 10 }}>How it works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18 }}>
            {[{ s: "01", t: "Pick a KPI", d: "Choose a metric from an upcoming earnings report." }, { s: "02", t: "Over or Under", d: "Will the actual number beat the line or fall short?" }, { s: "03", t: "Set your wager", d: "Scroll the odometer to set your stake." }, { s: "04", t: "Earnings drop", d: "Contracts settle. Right = $1. Wrong = $0." }].map(x => (
              <div key={x.s}><div style={{ fontSize: 20, fontWeight: 800, color: "#6ee7b725", fontFamily: "monospace", marginBottom: 3 }}>{x.s}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>{x.t}</div><div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5 }}>{x.d}</div></div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 0", borderTop: "1px solid #ffffff06", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>bet<span style={{ color: "#6ee7b7" }}>kpi</span></span>
          <span style={{ fontSize: 9, color: "#4b5563", fontFamily: "monospace" }}>2026 betkpi.ai</span>
        </div>
      </div>
    </div>
  );
}
