import { useState, useRef, useCallback, useEffect } from "react";

const WEB3FORMS_KEY = "a570a1cd-cdaa-4330-83a9-b8dbaccf8748";

async function sendEmail(subject, data) {
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, subject, ...data }),
    });
  } catch (e) { console.error(e); }
}

const COMPANIES = [
  {
    ticker: "TSLA", name: "Tesla", color: "#cc0000", accent: "#ff4444",
    nextEarnings: "2026-04-22T20:00:00Z", mcap: "$1.1T",
    kpis: [
      { id: "tsla-del", label: "Total Deliveries", unit: "K", consensus: 450,
        explain: "How many cars Tesla delivered this quarter. This number drops before earnings and sets the tone for everything. More deliveries = more revenue = proof of demand. It's THE Tesla number that makes headlines and moves the stock.",
        thresholds: [350, 390, 420, 450, 480, 510, 550] },
      { id: "tsla-autogm", label: "Auto Gross Margin (ex credits)", unit: "%", consensus: 18.0,
        explain: "Profit per car excluding regulatory credit sales to other automakers. This strips out the 'free money' and shows how healthy the actual car business is. It cratered during price cuts but has been recovering. Bulls and bears fight over this number more than any other.",
        thresholds: [14, 15.5, 17, 18, 19, 20.5, 22] },
    ],
  },
  {
    ticker: "NFLX", name: "Netflix", color: "#e50914", accent: "#ff3333",
    nextEarnings: "2026-04-16T20:00:00Z", mcap: "$430B",
    kpis: [
      { id: "nflx-members", label: "Paid Memberships", unit: "M", consensus: 332,
        explain: "Total paying Netflix subscribers worldwide. They crossed 325 million last quarter. Growth here proves the password crackdown and ad tier are working. This is the number that makes headlines and the one everyone has an opinion on.",
        thresholds: [318, 324, 328, 332, 336, 340, 348] },
      { id: "nflx-rev", label: "Revenue", unit: "$B", consensus: 12.2,
        explain: "Total sales from subscriptions and advertising combined. Netflix guided full-year 2026 revenue of $50.7-51.7 billion, which implies about $12.2B for Q1. Revenue growth has been steady at 15-18% — the question is whether ads can accelerate it.",
        thresholds: [10.8, 11.4, 11.8, 12.2, 12.6, 13.0, 13.6] },
    ],
  },
  {
    ticker: "NVDA", name: "NVIDIA", color: "#76b900", accent: "#76b900",
    nextEarnings: "2026-05-27T20:00:00Z", mcap: "$4.3T",
    kpis: [
      { id: "nvda-dc", label: "Data Center Revenue", unit: "$B", consensus: 72.0,
        explain: "Revenue from selling AI chips (GPUs) to Microsoft, Google, Meta, Amazon, and others. This is 91% of NVIDIA's entire business. If this number disappoints even slightly, the stock tanks. It's THE number that tells you if the AI boom is still accelerating.",
        thresholds: [62, 66, 69, 72, 75, 79, 84] },
      { id: "nvda-gm", label: "Gross Margin", unit: "%", consensus: 75.0,
        explain: "How much profit NVIDIA keeps per chip after manufacturing costs. 75% is extraordinary — they keep 75 cents of every dollar. New chip architectures (like Blackwell) can temporarily compress this as production ramps. Bears watch it for signs of competition eating into pricing power.",
        thresholds: [71, 73, 74, 75, 76, 77, 79] },
    ],
  },
];

function getThresholdPrices(kpi) {
  const c = kpi.consensus;
  return kpi.thresholds.map(t => {
    const dist = (t - c) / (c * 0.08);
    let prob = 1 / (1 + Math.exp(dist * 1.2));
    prob = Math.max(0.04, Math.min(0.96, prob));
    return { threshold: t, price: Math.round(prob * 100) };
  });
}

function getExpectedValue(kpi) {
  const prices = getThresholdPrices(kpi);
  let ev = prices[0].threshold;
  for (let i = 1; i < prices.length; i++) {
    ev += (prices[i].threshold - prices[i - 1].threshold) * (prices[i].price / 100);
  }
  return ev;
}

function Countdown({ targetDate }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const diff = new Date(targetDate).getTime() - now;
  if (diff <= 0) return <span style={{ color: "#6ee7b7", fontWeight: 700, fontSize: 11 }}>REPORTING</span>;
  const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
  return (
    <div style={{ display: "flex", gap: 3, fontFamily: "monospace", fontSize: 11 }}>
      {[[d,"d"],[h,"h"],[m,"m"],[s,"s"]].map(([v,l]) => (
        <span key={l}><span style={{ color: "#fff", fontWeight: 700 }}>{String(v).padStart(2,"0")}</span><span style={{ color: "#555", fontSize: 9 }}>{l}</span></span>
      ))}
    </div>
  );
}

function ProbCurve({ kpi }) {
  const prices = getThresholdPrices(kpi);
  const w = 280, h = 54, pad = 4;
  const barW = (w - pad * 2) / prices.length - 2;
  const isPct = kpi.unit.includes("%");
  return (
    <div style={{ padding: "6px 0" }}>
      <svg width={w} height={h + 18} style={{ display: "block" }}>
        {prices.map((p, i) => {
          const x = pad + i * ((w - pad * 2) / prices.length) + 1;
          const barH = (p.price / 100) * h;
          const isCon = p.threshold === kpi.consensus;
          return (
            <g key={i}>
              <rect x={x} y={h - barH} width={barW} height={barH} rx={2} fill={isCon ? "#6ee7b750" : "#6ee7b720"} />
              <text x={x + barW / 2} y={h + 12} textAnchor="middle" fill={isCon ? "#fff" : "#555"} fontSize={8} fontFamily="monospace" fontWeight={isCon ? 700 : 400}>
                {p.threshold}{isPct ? "%" : ""}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#444", fontFamily: "monospace", padding: "0 4px" }}>
        <span>more likely</span><span>less likely</span>
      </div>
    </div>
  );
}

function BetInput({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: "#6ee7b7", fontFamily: "monospace", textTransform: "uppercase", textAlign: "center", opacity: 0.7 }}>wager</div>
      <div style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#6ee7b7", fontFamily: "monospace", textShadow: "0 0 10px rgba(110,231,183,0.25)" }}>${value}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
        <button onClick={() => onChange(Math.max(1, value - (value > 100 ? 50 : value > 25 ? 10 : 5)))} style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #f8717130", background: "#f8717108", color: "#f87171", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>-</button>
        <input type="number" value={value} onChange={(e) => onChange(Math.min(10000, Math.max(0, parseInt(e.target.value) || 0)))}
          style={{ width: 72, textAlign: "center", padding: "6px", background: "#0e0e20", border: "1px solid #ffffff15", borderRadius: 7, color: "#6ee7b7", fontSize: 15, fontWeight: 700, fontFamily: "monospace", outline: "none", MozAppearance: "textfield" }} />
        <button onClick={() => onChange(Math.min(10000, value + (value >= 100 ? 50 : value >= 25 ? 10 : 5)))} style={{ width: 32, height: 32, borderRadius: 7, border: "1px solid #6ee7b730", background: "#6ee7b708", color: "#6ee7b7", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
      </div>
      <input type="range" min={1} max={1000} value={Math.min(value, 1000)} onChange={(e) => onChange(parseInt(e.target.value))} style={{ width: "100%", accentColor: "#6ee7b7", cursor: "pointer" }} />
      <div style={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
        {[10, 25, 50, 100, 250, 500].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{ background: value === v ? "#6ee7b715" : "#ffffff05", border: "1px solid " + (value === v ? "#6ee7b7" : "#ffffff10"), color: value === v ? "#6ee7b7" : "#555", borderRadius: 4, padding: "2px 7px", fontSize: 9, cursor: "pointer", fontFamily: "monospace" }}>${v}</button>
        ))}
      </div>
    </div>
  );
}

function SignUpModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ username:"", email:"", age:"", gender:"", expertise:"", portfolioSize:"", tradingFreq:"", venmo:"", referral:"" });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const ss = { width:"100%", padding:"10px 12px", background:"#0e0e20", border:"1px solid #ffffff15", borderRadius:8, color:"#e2e8f0", fontSize:13, fontFamily:"inherit", outline:"none", appearance:"none", WebkitAppearance:"none" };
  const ls = { fontSize:11, color:"#94a3b8", marginBottom:4, display:"block", fontFamily:"monospace", letterSpacing:0.5 };
  const ok = form.username && form.email && form.age && form.gender && form.expertise;
  const go = async () => {
    if (!ok) return; setLoading(true);
    await sendEmail("[BetKPI] Signup: " + form.username, { message: "SIGNUP\n\nUser: " + form.username + "\nEmail: " + form.email + "\nAge: " + form.age + "\nGender: " + form.gender + "\nExpertise: " + form.expertise + "\nPortfolio: " + (form.portfolioSize||"N/A") + "\nTrading: " + (form.tradingFreq||"N/A") + "\nVenmo: " + (form.venmo||"N/A") + "\nRef: " + (form.referral||"N/A"), from_name: "BetKPI" });
    localStorage.setItem("betkpi_user", JSON.stringify(form)); setLoading(false); onSubmit(form);
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)" }}>
      <div style={{ width:"100%", maxWidth:440, maxHeight:"90vh", overflowY:"auto", background:"linear-gradient(180deg, #111128, #0a0a14)", border:"1px solid #ffffff12", borderRadius:16, padding:28 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
          <div><div style={{ fontSize:18, fontWeight:800 }}>Join <span style={{ color:"#6ee7b7" }}>betkpi</span></div><div style={{ fontSize:11, color:"#6b7280", marginTop:2 }}>Predict earnings KPIs. Compete on the leaderboard.</div></div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", fontSize:20 }}>x</button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><label style={ls}>Username *</label><input placeholder="kpi_trader" value={form.username} onChange={set("username")} style={ss} /></div>
          <div><label style={ls}>Email *</label><input placeholder="you@email.com" type="email" value={form.email} onChange={set("email")} style={ss} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={ls}>Age *</label><select value={form.age} onChange={set("age")} style={ss}><option value="">Select</option><option>18-24</option><option>25-34</option><option>35-44</option><option>45-54</option><option>55-64</option><option>65+</option></select></div>
            <div><label style={ls}>Gender *</label><select value={form.gender} onChange={set("gender")} style={ss}><option value="">Select</option><option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option></select></div>
          </div>
          <div><label style={ls}>Investment Expertise *</label><select value={form.expertise} onChange={set("expertise")} style={ss}><option value="">Select</option><option>Beginner - new to investing</option><option>Casual - follow markets occasionally</option><option>Active - trade regularly</option><option>Advanced - options/derivatives</option><option>Professional - finance career</option></select></div>
          <div><label style={ls}>Portfolio Size (optional)</label><select value={form.portfolioSize} onChange={set("portfolioSize")} style={ss}><option value="">Prefer not to say</option><option>Under $1K</option><option>$1K-$10K</option><option>$10K-$50K</option><option>$50K-$250K</option><option>$250K-$1M</option><option>$1M+</option></select></div>
          <div><label style={ls}>How often do you trade?</label><select value={form.tradingFreq} onChange={set("tradingFreq")} style={ss}><option value="">Select</option><option>Daily</option><option>Weekly</option><option>Monthly</option><option>A few times a year</option><option>Buy and hold</option></select></div>
          <div><label style={ls}>Venmo (optional - prizes)</label><input placeholder="@handle" value={form.venmo} onChange={set("venmo")} style={ss} /></div>
          <div><label style={ls}>How'd you find us?</label><select value={form.referral} onChange={set("referral")} style={ss}><option value="">Select</option><option>Twitter / X</option><option>Reddit</option><option>TikTok</option><option>Friend</option><option>News</option><option>Search</option><option>Other</option></select></div>
        </div>
        <button disabled={!ok||loading} onClick={go} style={{ width:"100%", marginTop:20, padding:"14px 0", borderRadius:10, border:"none", background:ok?"linear-gradient(135deg, #059669, #6ee7b7)":"#333", color:ok?"#000":"#666", fontSize:14, fontWeight:800, cursor:ok?"pointer":"not-allowed", fontFamily:"monospace", letterSpacing:2, textTransform:"uppercase" }}>{loading?"Creating...":"Create Account"}</button>
      </div>
    </div>
  );
}

function KPIMarketCard({ kpi, co, onBuy }) {
  const [showExplain, setShowExplain] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const prices = getThresholdPrices(kpi);
  const ev = getExpectedValue(kpi);
  const isPct = kpi.unit.includes("%");

  return (
    <div style={{ background: "#0c0c18", border: "1px solid #ffffff0a", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{kpi.label}</span>
            <button onClick={e => { e.stopPropagation(); setShowExplain(!showExplain); }} style={{ background: "#ffffff08", border: "1px solid #ffffff12", borderRadius: 4, color: "#6b7280", fontSize: 9, padding: "1px 5px", cursor: "pointer", fontFamily: "monospace" }}>?</button>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 8, color: "#6b7280", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>Market Expects</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#6ee7b7", fontFamily: "monospace" }}>{ev.toFixed(isPct ? 1 : kpi.consensus < 10 ? 2 : 1)}<span style={{ fontSize: 10, color: "#555", marginLeft: 2 }}>{kpi.unit}</span></div>
          </div>
        </div>
        {showExplain && <div onClick={e => e.stopPropagation()} style={{ padding: 12, background: "#141430", border: "1px solid #ffffff15", borderRadius: 8, fontSize: 12, color: "#cbd5e1", lineHeight: 1.7, marginBottom: 8 }}>{kpi.explain}</div>}
        <ProbCurve kpi={kpi} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>Consensus: <span style={{ color: "#fff", fontWeight: 600 }}>{kpi.consensus}{isPct ? "%" : ""}</span></div>
          <div style={{ fontSize: 10, color: "#6ee7b7", fontFamily: "monospace", fontWeight: 600 }}>{expanded ? "Hide ▲" : prices.length + " markets ▼"}</div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #ffffff08" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 55px 55px", padding: "6px 12px", gap: 6, fontSize: 9, color: "#555", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1 }}>
            <div>Threshold</div><div style={{ textAlign: "center" }}>Yes</div><div style={{ textAlign: "center" }}>No</div><div></div><div></div>
          </div>
          {prices.map(p => (
            <div key={p.threshold} style={{ display: "grid", gridTemplateColumns: "1fr 55px 55px 55px 55px", alignItems: "center", padding: "7px 12px", gap: 6, borderBottom: "1px solid #ffffff06", fontSize: 12 }}>
              <div style={{ fontFamily: "monospace", fontWeight: p.threshold === kpi.consensus ? 700 : 500, color: p.threshold === kpi.consensus ? "#fff" : "#94a3b8" }}>
                &gt; {p.threshold}{isPct ? "%" : ""}
                {p.threshold === kpi.consensus && <span style={{ fontSize: 8, color: "#6ee7b7", marginLeft: 6, letterSpacing: 1 }}>CONSENSUS</span>}
              </div>
              <div style={{ textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#6ee7b7", fontSize: 13 }}>{p.price}c</div>
              <div style={{ textAlign: "center", fontFamily: "monospace", fontWeight: 700, color: "#f87171", fontSize: 13 }}>{100 - p.price}c</div>
              <button onClick={() => onBuy("yes", p.threshold, p.price)} style={{ padding: "5px 0", borderRadius: 5, border: "1px solid #6ee7b730", background: "#6ee7b70a", color: "#6ee7b7", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>YES</button>
              <button onClick={() => onBuy("no", p.threshold, 100 - p.price)} style={{ padding: "5px 0", borderRadius: 5, border: "1px solid #f8717130", background: "#f871710a", color: "#f87171", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>NO</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TradeSlip({ co, kpi, side, threshold, price, onClose, user, onRequireLogin }) {
  const [wager, setWager] = useState(100);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const contracts = Math.floor((wager / price) * 100);
  const isPct = kpi.unit.includes("%");
  const shareText = co.ticker + " " + kpi.label + ": I'm betting " + side.toUpperCase() + " >" + threshold + (isPct?"%":"") + " on betkpi.ai";

  const go = async () => {
    if (!user) { onRequireLogin(); return; }
    setLoading(true);
    await sendEmail("[BetKPI] " + user.username + " | " + co.ticker + " " + kpi.label + " " + side.toUpperCase() + " >" + threshold, {
      message: "BET\n\nUser: " + user.username + " (" + user.email + ")\nExpertise: " + user.expertise + "\nPortfolio: " + (user.portfolioSize||"N/A") + "\n\n" + co.ticker + " " + kpi.label + "\nContract: >" + threshold + (isPct?"%":" "+kpi.unit) + "\nSide: " + side.toUpperCase() + "\nPrice: " + price + "c\nWager: $" + wager + "\nContracts: " + contracts + "\nPayout: $" + contracts,
      from_name: "BetKPI",
    });
    setLoading(false); setSubmitted(true);
  };

  if (submitted) return (
    <div style={{ background: "linear-gradient(180deg, #111128, #0a0a12)", border: "1px solid #6ee7b730", borderRadius: 14, padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 36, color: "#6ee7b7", marginBottom: 8 }}>&#10003;</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#6ee7b7", marginBottom: 6 }}>Bet Placed!</div>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{co.ticker} — {kpi.label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: side === "yes" ? "#6ee7b7" : "#f87171", marginBottom: 4 }}>{side.toUpperCase()} &gt; {threshold}{isPct?"%":""}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>${wager} wagered — {contracts} contracts</div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14 }}>
        <a href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText)} target="_blank" rel="noreferrer" style={{ padding: "8px 14px", borderRadius: 7, background: "#1d9bf010", border: "1px solid #1d9bf040", color: "#1d9bf0", fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: "monospace" }}>Share on X</a>
        <button onClick={() => navigator.clipboard.writeText(shareText)} style={{ padding: "8px 14px", borderRadius: 7, background: "#ffffff08", border: "1px solid #ffffff15", color: "#94a3b8", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "monospace" }}>Copy</button>
      </div>
      <button onClick={() => { setSubmitted(false); onClose(); }} style={{ padding: "8px 20px", borderRadius: 7, border: "1px solid #ffffff15", background: "#ffffff08", color: "#e2e8f0", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>Another Bet</button>
    </div>
  );

  return (
    <div style={{ background: "linear-gradient(180deg, #111128, #0a0a12)", border: "1px solid #ffffff10", borderRadius: 14, padding: 20, position: "relative" }}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>x</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, background: co.color + "15", border: "1px solid " + co.color + "30", color: co.accent, fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.5 }}>{co.ticker}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{kpi.label}</div>
      </div>
      <div style={{ padding: "10px 14px", marginBottom: 14, borderRadius: 8, background: side === "yes" ? "#6ee7b708" : "#f8717108", border: "1px solid " + (side === "yes" ? "#6ee7b725" : "#f8717125") }}>
        <div style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", marginBottom: 2 }}>Your position</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: side === "yes" ? "#6ee7b7" : "#f87171", fontFamily: "monospace" }}>{side.toUpperCase()} &gt; {threshold}{isPct?"%":""}</div>
        <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", marginTop: 2 }}>{side === "yes" ? "Pays $1 if actual exceeds " + threshold : "Pays $1 if actual is " + threshold + " or below"}</div>
      </div>
      <BetInput value={wager} onChange={setWager} />
      <div style={{ marginTop: 14, padding: 12, background: "#ffffff04", borderRadius: 8, border: "1px solid #ffffff06" }}>
        {[["Price", price + "c"], ["Contracts", contracts], ["Potential Payout", "$" + contracts + ".00"]].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 2 ? 5 : 0 }}>
            <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace" }}>{k}</span>
            <span style={{ fontSize: 10, color: i === 2 ? "#6ee7b7" : "#ddd", fontWeight: i === 2 ? 700 : 400, fontFamily: "monospace" }}>{v}</span>
          </div>
        ))}
      </div>
      <button disabled={loading} onClick={go} style={{
        width: "100%", marginTop: 12, padding: "12px 0", borderRadius: 8, border: "none",
        background: !user ? "linear-gradient(135deg, #059669, #6ee7b7)" : side === "yes" ? "linear-gradient(135deg, #059669, #6ee7b7)" : "linear-gradient(135deg, #dc2626, #f87171)",
        color: "#000", fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase",
      }}>{loading ? "..." : !user ? "Sign Up to Bet" : "Buy " + side.toUpperCase() + " — $" + wager}</button>
    </div>
  );
}

const LEADERS = [
  { name:"wallst_shark", w:14, t:18, pnl:"+$2,340" },
  { name:"kpi_queen", w:12, t:16, pnl:"+$1,890" },
  { name:"earningswhiz", w:11, t:17, pnl:"+$1,420" },
  { name:"data_nerd42", w:10, t:14, pnl:"+$1,100" },
  { name:"bull_rider", w:9, t:15, pnl:"+$870" },
];

function HeroExample() {
  const rows = [
    { t: "318M", p: 94 }, { t: "324M", p: 82 }, { t: "328M", p: 68 },
    { t: "332M", p: 51 }, { t: "336M", p: 33 }, { t: "340M", p: 18 }, { t: "348M", p: 6 },
  ];
  return (
    <div style={{ background: "#0c0c18", border: "1px solid #ffffff0a", borderRadius: 14, padding: "16px 18px", maxWidth: 340 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ fontSize: 9, padding: "3px 7px", borderRadius: 4, background: "#e5091415", border: "1px solid #e5091430", color: "#ff3333", fontFamily: "monospace", fontWeight: 700 }}>NFLX</div>
        <span style={{ fontSize: 13, fontWeight: 700 }}>Paid Memberships</span>
        <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace", marginLeft: "auto" }}>Q1 '26</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "55px 1fr 36px", alignItems: "center", gap: 8, padding: "3px 0" }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: r.t === "332M" ? "#fff" : "#777", fontWeight: r.t === "332M" ? 700 : 400 }}>&gt;{r.t}</span>
          <div style={{ height: 5, borderRadius: 3, background: "#ffffff08", overflow: "hidden" }}>
            <div style={{ width: r.p + "%", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, #6ee7b7, #059669)", opacity: 0.5 + r.p / 200 }} />
          </div>
          <span style={{ fontSize: 10, fontFamily: "monospace", color: "#6ee7b7", textAlign: "right" }}>{r.p}c</span>
        </div>
      ))}
      <div style={{ marginTop: 8, fontSize: 10, color: "#6b7280", fontFamily: "monospace", textAlign: "center" }}>Market expects: <span style={{ color: "#6ee7b7", fontWeight: 700 }}>~332M subs</span></div>
    </div>
  );
}

export default function BetKPI() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [trade, setTrade] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => { try { const s = localStorage.getItem("betkpi_user"); if (s) setUser(JSON.parse(s)); } catch(e){} }, []);

  const handleBuy = useCallback((co, kpi, side, threshold, price) => { setTrade({ co, kpi, side, threshold, price }); }, []);
  const companies = activeTab === "ALL" ? COMPANIES : COMPANIES.filter(c => c.ticker === activeTab);

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{"\
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');\
        * { box-sizing: border-box; margin: 0; padding: 0; }\
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }\
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }\
        @keyframes blink { 0%,100%{opacity:.4} 50%{opacity:1} }\
        select option { background: #0e0e20; color: #e2e8f0; }\
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }\
      "}</style>

      {showSignUp && <SignUpModal onClose={() => setShowSignUp(false)} onSubmit={d => { setUser(d); setShowSignUp(false); }} />}

      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 22px", borderBottom: "1px solid #ffffff08", position: "sticky", top: 0, zIndex: 50, background: "#08080fee", backdropFilter: "blur(16px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg, #6ee7b7, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#000", fontFamily: "monospace" }}>B</div>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: -0.5 }}>bet<span style={{ color: "#6ee7b7" }}>kpi</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#6ee7b7", animation: "blink 2s infinite" }} />
          <span style={{ fontSize: 9, color: "#6b7280", fontFamily: "monospace", letterSpacing: 1 }}>LIVE</span>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 10 }}>
              <div style={{ padding: "6px 14px", borderRadius: 6, background: "#6ee7b715", border: "1px solid #6ee7b740", color: "#6ee7b7", fontSize: 11, fontWeight: 600, fontFamily: "monospace" }}>{user.username}</div>
              <button onClick={() => { localStorage.removeItem("betkpi_user"); setUser(null); }} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 10, fontFamily: "monospace" }}>logout</button>
            </div>
          ) : (
            <button onClick={() => setShowSignUp(true)} style={{ marginLeft: 10, padding: "6px 14px", borderRadius: 6, border: "1px solid #6ee7b750", background: "#6ee7b710", color: "#6ee7b7", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Sign Up</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 18px" }}>
        {/* HERO */}
        <div style={{ padding: "40px 0 32px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 36, alignItems: "center" }}>
            <div style={{ flex: "1 1 320px" }}>
              <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#6ee7b7", fontFamily: "monospace", marginBottom: 10 }}>Earnings KPI Markets</div>
              <h1 style={{ fontSize: 34, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 12, color: "#fff" }}>
                Trade the KPI,<br /><span style={{ color: "#6ee7b7" }}>not the noise.</span>
              </h1>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 8 }}>
                Stocks move on 50 things at once. BetKPI lets you bet on the one number you actually have a view on — deliveries, subscribers, revenue, margins.
              </p>
              <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
                Multiple price thresholds per KPI. See where the crowd thinks the number lands. Find where they're wrong.
              </p>
              {!user && <button onClick={() => setShowSignUp(true)} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #059669, #6ee7b7)", color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1 }}>Start Predicting</button>}
            </div>
            <div style={{ flex: "0 0 auto" }}><HeroExample /></div>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 5, marginBottom: 22, padding: "8px 0", borderBottom: "1px solid #ffffff08", animation: "fadeUp 0.6s ease" }}>
          {["ALL", ...COMPANIES.map(c => c.ticker)].map(t => {
            const isA = activeTab === t;
            const col = t === "ALL" ? "#6ee7b7" : COMPANIES.find(c => c.ticker === t)?.accent || "#6ee7b7";
            return (<button key={t} onClick={() => setActiveTab(t)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid " + (isA ? col + "50" : "#ffffff0d"), background: isA ? col + "10" : "transparent", color: isA ? col : "#6b7280", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1, whiteSpace: "nowrap" }}>{t}</button>);
          })}
        </div>

        {/* MAIN */}
        <div style={{ display: "grid", gridTemplateColumns: trade ? "1fr 310px" : "1fr", gap: 22, animation: "fadeUp 0.7s ease" }}>
          <div>
            {companies.map(co => (
              <div key={co.ticker} style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "12px 16px", background: co.color + "06", border: "1px solid " + co.color + "15", borderRadius: 11 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: co.color + "18", border: "1px solid " + co.color + "35", fontSize: 10, fontWeight: 800, color: co.accent, fontFamily: "monospace" }}>{co.ticker.slice(0,2)}</div>
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
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {co.kpis.map(kpi => (
                    <KPIMarketCard key={kpi.id} kpi={kpi} co={co} onBuy={(side, threshold, price) => handleBuy(co, kpi, side, threshold, price)} />
                  ))}
                </div>
              </div>
            ))}

            {/* Leaderboard */}
            <div style={{ background: "#0c0c18", border: "1px solid #ffffff08", borderRadius: 13, padding: "18px 20px", marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace" }}>Top Predictors</span>
                <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>Season 1</span>
              </div>
              {LEADERS.map((l,i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: i < LEADERS.length-1 ? "1px solid #ffffff06" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", background: i<3?["#ffd70020","#c0c0c020","#cd7f3220"][i]:"#ffffff06", fontSize: 9, fontWeight: 700, color: i<3?["#ffd700","#c0c0c0","#cd7f32"][i]:"#555", fontFamily: "monospace" }}>{i+1}</div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{l.name}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>{l.w}/{l.t}</span>
                    <span style={{ fontSize: 11, color: "#6ee7b7", fontWeight: 700, fontFamily: "monospace", minWidth: 55, textAlign: "right" }}>{l.pnl}</span>
                  </div>
                </div>
              ))}
              {!user && <div style={{ marginTop: 10, textAlign: "center", fontSize: 11, color: "#6b7280" }}>
                <button onClick={() => setShowSignUp(true)} style={{ background: "none", border: "none", color: "#6ee7b7", cursor: "pointer", fontWeight: 700, fontSize: 11 }}>Sign up to compete</button>
              </div>}
            </div>
          </div>

          {trade && (
            <div style={{ position: "sticky", top: 68, alignSelf: "start" }}>
              <TradeSlip co={trade.co} kpi={trade.kpi} side={trade.side} threshold={trade.threshold} price={trade.price} onClose={() => setTrade(null)} user={user} onRequireLogin={() => setShowSignUp(true)} />
            </div>
          )}
        </div>

        {/* HOW IT WORKS */}
        <div style={{ margin: "24px 0", padding: "22px 24px", background: "#0c0c18", border: "1px solid #ffffff08", borderRadius: 13 }}>
          <div style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace", marginBottom: 14 }}>How it works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { s:"01", t:"Pick a KPI", d:"Choose an earnings metric. Tap the ? to learn what it means in plain English." },
              { s:"02", t:"Choose a threshold", d:"Each KPI has 7 price levels. Buy YES if you think the number beats it, NO if it won't." },
              { s:"03", t:"Set your wager", d:"Contracts cost 4-96 cents. Lower price = higher payout if you're right." },
              { s:"04", t:"Earnings drop", d:"When the company reports, contracts settle at $1 or $0. Climb the leaderboard." },
            ].map(x => (
              <div key={x.s}><div style={{ fontSize: 22, fontWeight: 800, color: "#6ee7b720", fontFamily: "monospace", marginBottom: 4 }}>{x.s}</div><div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{x.t}</div><div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>{x.d}</div></div>
            ))}
          </div>
        </div>

        {/* WHY */}
        <div style={{ margin: "0 0 40px", padding: "22px 24px", background: "#0c0c18", border: "1px solid #ffffff08", borderRadius: 13 }}>
          <div style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace", marginBottom: 14 }}>Why trade KPIs?</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { t:"Purer than stocks", d:"A stock moves on 50 things at once. A KPI market moves on one number. Trade what you actually know." },
              { t:"See the crowd's expectations", d:"7 thresholds show the full probability curve — not just one consensus number. Spot where the market is wrong." },
              { t:"Asymmetric upside", d:"A contract at 15c pays 6.7x if you're right. Find mispriced thresholds and the math works in your favor." },
            ].map((x,i) => (
              <div key={i}><div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{x.t}</div><div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.6 }}>{x.d}</div></div>
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
