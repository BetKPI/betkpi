import { useState, useRef, useCallback, useEffect } from "react";

const WEB3FORMS_KEY = "YOUR_ACCESS_KEY_HERE";

async function sendEmail(subject, data) {
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, ...data }),
    });
  } catch (e) { console.error("Email failed:", e); }
}

const COMPANIES = [
  {
    ticker: "AAPL", name: "Apple", color: "#A2AAAD", accent: "#fff",
    nextEarnings: "2026-04-30T20:00:00Z", mcap: "$3.9T",
    kpis: [
      { id: "aapl-iphone", label: "iPhone Revenue", unit: "$B", line: 55.0, desc: "Last Q: $85.3B (holiday). Q2 guided 13-16% total rev growth",
        explain: "How much money Apple made selling iPhones this quarter. It's their biggest product (~60% of revenue). The holiday quarter is always huge, so the spring quarter drops. Wall Street obsesses over this because it shows if people are still upgrading." },
      { id: "aapl-services", label: "Services Revenue", unit: "$B", line: 31.0, desc: "Last Q: $30.0B (record, +14% YoY). Guided similar growth",
        explain: "Revenue from App Store, iCloud, Apple Music, Apple TV+, AppleCare, and Apple Pay. This is recurring revenue with 75%+ margins — way more profitable than selling hardware. Investors love watching this grow because it makes Apple's earnings more predictable." },
      { id: "aapl-china", label: "Greater China Revenue", unit: "$B", line: 18.0, desc: "Last Q: $25.5B (+38% YoY surge). March Q typically lower",
        explain: "Apple's sales in China, Hong Kong, and Taiwan combined. China is Apple's third-largest market and the most volatile. When China is strong, the stock rips. When it's weak, it's a huge overhang. Last quarter saw a massive 38% surge — can it hold?" },
      { id: "aapl-gm", label: "Gross Margin", unit: "%", line: 47.0, desc: "Last Q: 48.2%. Guided 46-48%. Rising component costs",
        explain: "For every dollar of revenue, how many cents Apple keeps after manufacturing costs. Higher = more profitable. Apple's been expanding margins thanks to the shift to Services (which are super high margin). Component costs and chip prices can squeeze this." },
    ],
  },
  {
    ticker: "NVDA", name: "NVIDIA", color: "#76b900", accent: "#76b900",
    nextEarnings: "2026-05-27T20:00:00Z", mcap: "$4.3T",
    kpis: [
      { id: "nvda-rev", label: "Total Revenue", unit: "$B", line: 78.0, desc: "Guided $78B +/-2%. Last Q: $68.1B (+73% YoY)",
        explain: "NVIDIA's total sales across all segments. They guided $78 billion for next quarter — the market will react to whether they beat this and by how much. For context, their revenue has gone from $6B/quarter to $68B in two years. Insane growth driven entirely by AI chip demand." },
      { id: "nvda-dc", label: "Data Center Revenue", unit: "$B", line: 72.0, desc: "91%+ of total. Last Q: $62.3B (+75% YoY). THE number",
        explain: "Revenue from selling AI chips (GPUs) to data centers — Microsoft, Google, Meta, Amazon, etc. are all buying as fast as NVIDIA can make them. This is 91% of NVIDIA's business now. If this number disappoints even slightly, the stock tanks. It's THE number." },
      { id: "nvda-gm", label: "Gross Margin", unit: "%", line: 75.0, desc: "Guided 75.0% +/-50bps. Last Q: 75.2%. Blackwell mix",
        explain: "How much profit NVIDIA makes per chip after manufacturing costs. 75% is extraordinary — it means they keep 75 cents of every dollar. New chip architectures (like Blackwell) can temporarily compress margins as production ramps. Bears watch this for signs of competition." },
      { id: "nvda-eps", label: "Earnings Per Share", unit: "$", line: 1.78, desc: "Consensus $1.78. Last Q: $1.62 (beat by $0.08)",
        explain: "Net profit divided by shares outstanding. The bottom-line number that tells you how much NVIDIA actually earned per share. They've beaten estimates every quarter for two years straight. The question is always: by how much?" },
    ],
  },
  {
    ticker: "TSLA", name: "Tesla", color: "#cc0000", accent: "#ff4444",
    nextEarnings: "2026-04-22T20:00:00Z", mcap: "$1.1T",
    kpis: [
      { id: "tsla-del", label: "Total Deliveries", unit: "K", line: 450, desc: "Last Q: 418K (-16% seq). Cybercab ramp starting. THE number",
        explain: "How many cars Tesla physically delivered to customers this quarter. This is THE Tesla number — it drops before earnings and sets the tone for everything. More deliveries = more revenue = proof of demand. Last quarter was down 16% sequentially, so the bar isn't high." },
      { id: "tsla-rev", label: "Total Revenue", unit: "$B", line: 26.0, desc: "Last Q: $28.1B (+12% YoY). Auto + Energy + Services",
        explain: "Tesla's total sales from cars, energy storage (Megapack), and services. The energy business is becoming a real second act — nearly $13B/year now. Revenue is driven primarily by how many cars they deliver and at what average price." },
      { id: "tsla-autogm", label: "Auto Gross Margin (ex credits)", unit: "%", line: 18.0, desc: "Last Q: 17.9%. Up from 15.4%. Key profitability signal",
        explain: "How much profit Tesla makes on each car EXCLUDING regulatory credit sales to other automakers. This strips out the 'free money' and shows the real health of the car business. It cratered to 15.4% during price cuts but has been recovering. Bears say it's too low; bulls say it's improving." },
      { id: "tsla-energy", label: "Energy Storage Deployed", unit: "GWh", line: 12.0, desc: "Last Q: 14.2 GWh (record). Growing 29% YoY",
        explain: "Gigawatt-hours of battery storage (mainly Megapack) Tesla shipped to utilities and businesses. This is the sleeper growth story — it's becoming a real business with great margins. Record deployments last quarter. Think of it as Tesla's 'other' business that most retail investors underappreciate." },
    ],
  },
  {
    ticker: "NFLX", name: "Netflix", color: "#e50914", accent: "#ff3333",
    nextEarnings: "2026-04-16T20:00:00Z", mcap: "$430B",
    kpis: [
      { id: "nflx-rev", label: "Revenue", unit: "$B", line: 12.2, desc: "Q1 forecast: ~$12.2B. 2026 full year guided $50.7-51.7B",
        explain: "Netflix's total sales from subscriptions and advertising. They guided full-year 2026 revenue of $50.7-51.7 billion, which implies ~$12.2B for Q1. Revenue growth has been steady at 15-18% — the question is whether ads can accelerate it further." },
      { id: "nflx-opm", label: "Operating Margin", unit: "%", line: 32.0, desc: "2026 target: 31.5%. Expanding consistently every year",
        explain: "What percentage of revenue Netflix keeps as operating profit after paying for content, employees, and everything else. They've been on a steady march upward — from 16% to 29.5% in a few years. Target for 2026 is 31.5%. This tells you if Netflix is becoming a profit machine or overspending on content." },
      { id: "nflx-members", label: "Paid Memberships", unit: "M", line: 332, desc: "Crossed 325M in Q4. Total membership milestone everyone watches",
        explain: "Total number of paying Netflix subscribers worldwide. They stopped reporting quarterly net adds in 2025, but still give the total. Crossing 325 million was a big milestone. Growth here proves the password crackdown and ad tier are working. This is the number that makes headlines." },
      { id: "nflx-adrev", label: "Ad Revenue Run Rate", unit: "$B", line: 0.75, desc: "2025 total >$1.5B. 2026 guided to roughly double to ~$3B",
        explain: "How much Netflix is making from ads on their cheaper subscription tier. This went from zero to $1.5 billion in 2025 and they're guiding it to double to $3B in 2026. It's the fastest-growing part of their business and could be a game changer for margins. Early innings." },
    ],
  },
  {
    ticker: "META", name: "Meta Platforms", color: "#0668E1", accent: "#3b82f6",
    nextEarnings: "2026-04-30T20:00:00Z", mcap: "$1.8T",
    kpis: [
      { id: "meta-rev", label: "Revenue", unit: "$B", line: 55.0, desc: "Q1 guided $53.5-56.5B. Last Q: $59.9B (+24% YoY)",
        explain: "Meta's total sales, almost entirely from advertising on Facebook, Instagram, WhatsApp, and Messenger. They guided Q1 to $53.5-56.5B. The midpoint of guidance is what the market anchors to. Revenue growth has reaccelerated to 20%+ thanks to AI-improved ad targeting." },
      { id: "meta-dap", label: "Family Daily Active People", unit: "B", line: 3.62, desc: "Last Q: 3.58B (+7% YoY). Key engagement metric",
        explain: "How many unique people use at least one Meta app (Facebook, Instagram, WhatsApp, Messenger) every single day. 3.58 BILLION people — nearly half the planet. Growth here proves Meta's apps aren't dying. Even small percentage gains mean hundreds of millions more ad impressions." },
      { id: "meta-adprice", label: "Avg Price Per Ad Change", unit: "% YoY", line: 8.0, desc: "Last Q: +6% YoY. Full year 2025: +9%. Monetization signal",
        explain: "How much more (or less) advertisers are paying per ad compared to last year. When this goes up, it means Meta's AI is getting better at showing the right ads to the right people — advertisers pay more because the ads work better. This is the purest signal of Meta's AI monetization engine." },
      { id: "meta-rloss", label: "Reality Labs Loss", unit: "$B", line: 5.0, desc: "Last Q: $5.07B loss. Watching for any narrowing",
        explain: "How much money Meta's VR/AR division (Quest headsets, metaverse) is losing per quarter. It's been burning ~$5B/quarter — about $20B/year. Investors mostly tolerate it because the core ad business prints money, but any sign of the losses shrinking would be a positive catalyst." },
    ],
  },
];

function getOverUnder(kpi) {
  const s = kpi.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const over = 42 + (s % 22);
  return { over, under: 100 - over };
}

// ─── COUNTDOWN TIMER ───
function Countdown({ targetDate }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(targetDate).getTime() - now;
  if (diff <= 0) return <span style={{ color: "#6ee7b7", fontWeight: 700 }}>REPORTING</span>;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const sec = Math.floor((diff % 60000) / 1000);
  return (
    <div style={{ display: "flex", gap: 4, fontFamily: "monospace", fontSize: 11 }}>
      {[[d, "d"], [h, "h"], [m, "m"], [sec, "s"]].map(([v, l]) => (
        <div key={l} style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{String(v).padStart(2, "0")}</span>
          <span style={{ color: "#555", fontSize: 9 }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ─── BET INPUT (slider + buttons + keyboard) ───
function BetInput({ value, onChange }) {
  const presets = [10, 25, 50, 100, 250, 500, 1000];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: "#6ee7b7", fontFamily: "monospace", textTransform: "uppercase", textAlign: "center", opacity: 0.7 }}>wager amount</div>
      {/* Big number display */}
      <div style={{ textAlign: "center", fontSize: 32, fontWeight: 800, color: "#6ee7b7", fontFamily: "monospace", textShadow: "0 0 12px rgba(110,231,183,0.3)" }}>
        ${value}
      </div>
      {/* +/- buttons with input */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
        <button onClick={() => onChange(Math.max(1, value - (value > 100 ? 50 : value > 25 ? 10 : 5)))} style={{
          width: 36, height: 36, borderRadius: 8, border: "1px solid #f8717130", background: "#f8717110",
          color: "#f87171", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>-</button>
        <input type="number" value={value} onChange={(e) => { const v = parseInt(e.target.value) || 0; onChange(Math.min(10000, Math.max(0, v))); }}
          style={{
            width: 80, textAlign: "center", padding: "8px 4px", background: "#0e0e20", border: "1px solid #ffffff15",
            borderRadius: 8, color: "#6ee7b7", fontSize: 16, fontWeight: 700, fontFamily: "monospace", outline: "none",
            MozAppearance: "textfield",
          }} />
        <button onClick={() => onChange(Math.min(10000, value + (value >= 100 ? 50 : value >= 25 ? 10 : 5)))} style={{
          width: 36, height: 36, borderRadius: 8, border: "1px solid #6ee7b730", background: "#6ee7b710",
          color: "#6ee7b7", fontSize: 18, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>+</button>
      </div>
      {/* Slider */}
      <div style={{ padding: "0 4px" }}>
        <input type="range" min={1} max={1000} value={Math.min(value, 1000)} onChange={(e) => onChange(parseInt(e.target.value))}
          style={{ width: "100%", accentColor: "#6ee7b7", cursor: "pointer" }} />
      </div>
      {/* Presets */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
        {presets.map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            background: value === v ? "#6ee7b718" : "#ffffff05", border: "1px solid " + (value === v ? "#6ee7b7" : "#ffffff10"),
            color: value === v ? "#6ee7b7" : "#555", borderRadius: 5, padding: "3px 8px", fontSize: 10, cursor: "pointer", fontFamily: "monospace",
          }}>${v}</button>
        ))}
      </div>
    </div>
  );
}

// ─── KPI EXPLAINER TOOLTIP ───
function KPIExplainer({ text, isOpen, onToggle }) {
  return (
    <div>
      <button onClick={(e) => { e.stopPropagation(); onToggle(); }} style={{
        background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 4,
        color: "#6b7280", fontSize: 9, padding: "1px 5px", cursor: "pointer", fontFamily: "monospace",
      }}>?</button>
      {isOpen && (
        <div onClick={(e) => e.stopPropagation()} style={{
          marginTop: 8, padding: 12, background: "#141430", border: "1px solid #ffffff15",
          borderRadius: 8, fontSize: 11, color: "#cbd5e1", lineHeight: 1.6,
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ─── LEADERBOARD ───
const FAKE_LEADERS = [
  { name: "wallst_shark", wins: 14, total: 18, pnl: "+$2,340" },
  { name: "kpi_queen", wins: 12, total: 16, pnl: "+$1,890" },
  { name: "earningswhiz", wins: 11, total: 17, pnl: "+$1,420" },
  { name: "data_nerd42", wins: 10, total: 14, pnl: "+$1,100" },
  { name: "bull_rider", wins: 9, total: 15, pnl: "+$870" },
  { name: "margin_call", wins: 9, total: 13, pnl: "+$760" },
  { name: "chip_hunter", wins: 8, total: 12, pnl: "+$590" },
  { name: "rev_watcher", wins: 7, total: 11, pnl: "+$410" },
  { name: "eps_sniper", wins: 7, total: 13, pnl: "+$320" },
  { name: "growth_mode", wins: 6, total: 10, pnl: "+$180" },
];

function Leaderboard() {
  return (
    <div style={{ background: "#0c0c18", border: "1px solid #ffffff08", borderRadius: 13, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace" }}>Top Predictors</div>
        <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Season 1</div>
      </div>
      {FAKE_LEADERS.map((l, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 0", borderBottom: i < FAKE_LEADERS.length - 1 ? "1px solid #ffffff06" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center",
              background: i < 3 ? ["#ffd70020", "#c0c0c020", "#cd7f3220"][i] : "#ffffff06",
              border: "1px solid " + (i < 3 ? ["#ffd700", "#c0c0c0", "#cd7f32"][i] + "40" : "#ffffff08"),
              fontSize: 10, fontWeight: 700, color: i < 3 ? ["#ffd700", "#c0c0c0", "#cd7f32"][i] : "#555",
              fontFamily: "monospace",
            }}>{i + 1}</div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>{l.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{l.wins}/{l.total}</span>
            <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 700, fontFamily: "monospace", minWidth: 60, textAlign: "right" }}>{l.pnl}</span>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12, padding: "10px 0", textAlign: "center" }}>
        <div style={{ fontSize: 11, color: "#6b7280" }}>Your rank: <span style={{ color: "#6ee7b7", fontWeight: 700 }}>Sign up to compete</span></div>
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
      message: "NEW USER SIGNUP\n\nUsername: " + form.username + "\nEmail: " + form.email + "\nAge: " + form.age + "\nGender: " + form.gender + "\nExpertise: " + form.expertise + "\nPortfolio: " + (form.portfolioSize || "N/A") + "\nTrading Freq: " + (form.tradingFreq || "N/A") + "\nVenmo: " + (form.venmo || "N/A") + "\nReferral: " + (form.referral || "N/A"),
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
  const [showExplain, setShowExplain] = useState(false);
  const p = getOverUnder(kpi);
  const isPct = kpi.unit.includes("%");
  return (
    <div onClick={() => onSelect(kpi)} style={{
      background: isActive ? co.color + "0a" : "#0c0c18", border: "1px solid " + (isActive ? co.color + "40" : "#ffffff08"),
      borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3, flex: 1 }}>{kpi.label}</div>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <KPIExplainer text={kpi.explain} isOpen={showExplain} onToggle={() => setShowExplain(!showExplain)} />
          <div style={{ fontSize: 9, padding: "2px 5px", borderRadius: 3, background: "#ffffff08", color: "#888", fontFamily: "monospace", whiteSpace: "nowrap" }}>{kpi.unit}</div>
        </div>
      </div>
      <div style={{ fontSize: 10, color: "#6b7280", lineHeight: 1.5, marginBottom: showExplain ? 0 : 12 }}>{kpi.desc}</div>
      {!showExplain && (
        <>
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
        </>
      )}
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

  const shareText = co.ticker + " " + kpi.label + ": I'm betting " + side.toUpperCase() + " " + kpi.line + (isPct ? "%" : "") + " on betkpi.ai";

  const handleSubmit = async () => {
    if (!user) { onRequireLogin(); return; }
    setLoading(true);
    await sendEmail("[BetKPI] Bet: " + user.username + " | " + co.ticker + " " + kpi.label + " " + side.toUpperCase(), {
      message: "NEW BET\n\nUser: " + user.username + " (" + user.email + ")\nExpertise: " + user.expertise + "\nPortfolio: " + (user.portfolioSize || "N/A") + "\n\nTicker: " + co.ticker + "\nKPI: " + kpi.label + "\nLine: " + kpi.line + (isPct ? "%" : " " + kpi.unit) + "\nSide: " + side.toUpperCase() + "\nPrice: " + price + "c\nWager: $" + wager + "\nContracts: " + contracts + "\nMax Payout: $" + contracts,
      from_name: "BetKPI Bets",
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ background: "linear-gradient(180deg, #111128 0%, #0a0a12 100%)", border: "1px solid #6ee7b730", borderRadius: 14, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 10, color: "#6ee7b7" }}>&#10003;</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#6ee7b7", marginBottom: 6 }}>Bet Placed!</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{co.ticker} - {kpi.label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: side === "over" ? "#6ee7b7" : "#f87171", marginBottom: 4 }}>{side.toUpperCase()} {kpi.line}{isPct ? "%" : ""}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>${wager} wagered - {contracts} contracts</div>
        {/* Share buttons */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText)} target="_blank" rel="noreferrer" style={{
            padding: "8px 16px", borderRadius: 7, background: "#1d9bf010", border: "1px solid #1d9bf040",
            color: "#1d9bf0", fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: "monospace",
          }}>Share on X</a>
          <button onClick={() => { navigator.clipboard.writeText(shareText); }} style={{
            padding: "8px 16px", borderRadius: 7, background: "#ffffff08", border: "1px solid #ffffff15",
            color: "#94a3b8", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "monospace",
          }}>Copy Link</button>
        </div>
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
      <BetInput value={wager} onChange={setWager} />
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

// ─── MAIN ───
export default function BetKPI() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [activeBet, setActiveBet] = useState(null);
  const [activeCo, setActiveCo] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { try { const s = localStorage.getItem("betkpi_user"); if (s) setUser(JSON.parse(s)); } catch(e){} }, []);

  const handleBet = useCallback((kpi) => { setActiveBet(kpi); setActiveCo(COMPANIES.find(c => c.kpis.some(k => k.id === kpi.id))); }, []);
  const handleLogout = () => { localStorage.removeItem("betkpi_user"); setUser(null); };
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
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }\
        input[type=range] { height: 4px; }\
      "}</style>

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onSubmit={(d) => { setUser(d); setShowSignUp(false); }} />}

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
                    <div style={{ fontSize: 8, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 2 }}>Earnings In</div>
                    <Countdown targetDate={co.nextEarnings} />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 9 }}>
                  {co.kpis.map(k => (<KPICard key={k.id} kpi={k} co={co} onSelect={handleBet} isActive={activeBet?.id === k.id} />))}
                </div>
              </div>
            ))}

            {/* Leaderboard after all companies */}
            {activeTab === "ALL" && <Leaderboard />}
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
            {[{ s: "01", t: "Pick a KPI", d: "Choose a metric from an upcoming earnings report. Tap ? to learn what it means." }, { s: "02", t: "Over or Under", d: "Will the actual number beat the line or fall short?" }, { s: "03", t: "Set your wager", d: "Use the slider, buttons, or type your amount." }, { s: "04", t: "Earnings drop", d: "Contracts settle. Right = $1. Wrong = $0. Climb the leaderboard." }].map(x => (
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
