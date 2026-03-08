import { useState, useRef, useCallback } from "react";

const STOCKS = {
  NVDA: {
    name: "NVIDIA", ticker: "NVDA", color: "#76b900",
    nextEarnings: "May 27, 2026", lastEPS: "$1.62",
    kpis: [
      { id: "nvda-rev", label: "Total Revenue", unit: "$B", line: 78.0, desc: "Guided $78B ±2%. Last Q: $68.1B (+73% YoY)" },
      { id: "nvda-dc", label: "Data Center Revenue", unit: "$B", line: 72.0, desc: "91%+ of total rev. Last Q: $62.3B (+75% YoY)" },
      { id: "nvda-eps", label: "Earnings Per Share", unit: "$", line: 1.78, desc: "Consensus est $1.78. Last Q: $1.62 (beat $0.08)" },
      { id: "nvda-gm", label: "Gross Margin", unit: "%", line: 75.0, desc: "Guided 75.0% ±50bps. Last Q: 75.2%" },
    ],
  },
  NFLX: {
    name: "Netflix", ticker: "NFLX", color: "#e50914",
    nextEarnings: "Apr 17, 2026", lastEPS: "$5.81",
    kpis: [
      { id: "nflx-rev", label: "Revenue", unit: "$B", line: 11.0, desc: "Q4 was $12.05B (+17.6% YoY). Tracking ~15% growth" },
      { id: "nflx-opm", label: "Operating Margin", unit: "%", line: 29.0, desc: "Full year 2025 was 29.5%. Expanding yearly" },
      { id: "nflx-adrev", label: "Ad Revenue", unit: "$B", line: 0.6, desc: "2025 full year >$1.5B (2.5x YoY). Ramping fast" },
      { id: "nflx-eps", label: "Earnings Per Share", unit: "$", line: 6.25, desc: "Last Q: $5.81. Growing 30%+ YoY" },
    ],
  },
  META: {
    name: "Meta Platforms", ticker: "META", color: "#0668E1",
    nextEarnings: "Apr 30, 2026", lastEPS: "$8.02",
    kpis: [
      { id: "meta-rev", label: "Revenue", unit: "$B", line: 55.0, desc: "Q1 guided $53.5-56.5B. Last Q: $59.9B (+24% YoY)" },
      { id: "meta-dap", label: "Family Daily Active People", unit: "B", line: 3.62, desc: "Last Q: 3.58B DAP (+7% YoY). Steady climb" },
      { id: "meta-adprice", label: "Avg Price Per Ad", unit: "% YoY", line: 8.0, desc: "Last Q: +6% YoY. Full year 2025: +9% YoY" },
      { id: "meta-rloss", label: "Reality Labs Loss", unit: "$B", line: 5.0, desc: "Last Q: $5.07B loss. Watching for narrowing" },
      { id: "meta-eps", label: "Earnings Per Share", unit: "$", line: 7.20, desc: "Last Q: $8.02. Strong growth trajectory" },
    ],
  },
};

function getMarketPrices(kpi) {
  const seed = kpi.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const over = 42 + (seed % 22);
  return { over, under: 100 - over };
}

function OdometerDial({ value, onChange, min = 1, max = 5000 }) {
  const dragging = useRef(false);
  const lastY = useRef(0);
  const display = String(Math.min(value, 9999)).padStart(4, " ");

  const onDown = (e) => { dragging.current = true; lastY.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!dragging.current) return;
    const diff = lastY.current - e.clientY;
    if (Math.abs(diff) > 3) {
      const step = Math.abs(diff) > 20 ? 10 : 1;
      onChange(Math.min(max, Math.max(min, value + (diff > 0 ? step : -step))));
      lastY.current = e.clientY;
    }
  };
  const onUp = () => { dragging.current = false; };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 3, color: "#6ee7b7", fontFamily: "monospace" }}>drag to set wager</div>
      <div onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} style={{
        display: "flex", gap: 3, cursor: "ns-resize", userSelect: "none", padding: "6px 10px",
        background: "linear-gradient(180deg, #0a0a0a 0%, #141428 50%, #0a0a0a 100%)",
        borderRadius: 10, border: "1px solid #2a2a4a",
        boxShadow: "0 0 24px rgba(110,231,183,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        {display.split("").map((d, i) => (
          <div key={i} style={{
            width: 34, height: 48, display: "flex", alignItems: "center", justifyContent: "center",
            background: d === " " ? "transparent" : "linear-gradient(180deg, #0e0e1e 0%, #1a1a34 45%, #1a1a34 55%, #0e0e1e 100%)",
            borderRadius: 5, fontSize: 28, fontWeight: 700, fontFamily: "monospace",
            color: d === " " ? "transparent" : "#6ee7b7",
            border: d === " " ? "none" : "1px solid #2a2a4a",
            textShadow: "0 0 10px rgba(110,231,183,0.4)", position: "relative", overflow: "hidden",
          }}>
            {d !== " " && <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(110,231,183,0.08)" }} />}
            {d}
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", paddingLeft: 3, fontSize: 14, color: "#6ee7b760", fontFamily: "monospace", fontWeight: 600 }}>$</div>
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[25, 100, 250, 500, 1000].map(v => (
          <button key={v} onClick={() => onChange(v)} style={{
            background: value === v ? "#6ee7b718" : "#ffffff06",
            border: `1px solid ${value === v ? "#6ee7b7" : "#ffffff12"}`,
            color: value === v ? "#6ee7b7" : "#666", borderRadius: 5, padding: "3px 8px",
            fontSize: 10, cursor: "pointer", fontFamily: "monospace",
          }}>${v}</button>
        ))}
      </div>
    </div>
  );
}

function KPICard({ kpi, stockColor, onBet, activeBet }) {
  const prices = getMarketPrices(kpi);
  const isActive = activeBet?.id === kpi.id;
  const isPercent = kpi.unit === "%" || kpi.unit === "% YoY";

  return (
    <div style={{
      background: isActive ? `linear-gradient(135deg, ${stockColor}08 0%, #0d0d1a 100%)` : "#0d0d18",
      border: `1px solid ${isActive ? stockColor + "40" : "#ffffff0a"}`,
      borderRadius: 12, padding: "16px 18px", cursor: "pointer", transition: "all 0.2s",
    }} onClick={() => onBet(kpi)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", lineHeight: 1.3 }}>{kpi.label}</div>
        <div style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "#ffffff08", border: "1px solid #ffffff10", color: "#94a3b8", fontFamily: "monospace" }}>{kpi.unit}</div>
      </div>
      <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, marginBottom: 14 }}>{kpi.desc}</div>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
        padding: "8px 10px", background: "#ffffff04", borderRadius: 8, border: "1px solid #ffffff06",
      }}>
        <div style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>LINE</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "monospace", letterSpacing: -1 }}>
          {kpi.line}{isPercent ? "%" : ""}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, padding: "10px 0", borderRadius: 8, textAlign: "center", background: "#6ee7b70a", border: "1px solid #6ee7b725" }}>
          <div style={{ fontSize: 9, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 2 }}>Over</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#6ee7b7", fontFamily: "monospace" }}>{prices.over}¢</div>
        </div>
        <div style={{ flex: 1, padding: "10px 0", borderRadius: 8, textAlign: "center", background: "#f871710a", border: "1px solid #f8717125" }}>
          <div style={{ fontSize: 9, color: "#f87171", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace", marginBottom: 2 }}>Under</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f87171", fontFamily: "monospace" }}>{prices.under}¢</div>
        </div>
      </div>
    </div>
  );
}

function TradeSlip({ kpi, stock, onClose }) {
  const [side, setSide] = useState("over");
  const [amount, setAmount] = useState(100);
  const prices = getMarketPrices(kpi);
  const price = side === "over" ? prices.over : prices.under;
  const shares = Math.floor((amount / price) * 100);
  const payout = (shares * 1).toFixed(2);
  const isPercent = kpi.unit === "%" || kpi.unit === "% YoY";

  return (
    <div style={{
      background: "linear-gradient(180deg, #111125 0%, #0a0a12 100%)",
      border: "1px solid #ffffff10", borderRadius: 14, padding: 22, position: "relative",
    }}>
      <button onClick={onClose} style={{ position: "absolute", top: 10, right: 12, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18 }}>×</button>
      <div style={{
        display: "inline-block", fontSize: 9, padding: "3px 8px", borderRadius: 4, marginBottom: 10,
        background: stock.color + "15", border: `1px solid ${stock.color}30`, color: stock.color,
        fontFamily: "monospace", fontWeight: 700, letterSpacing: 1.5,
      }}>{stock.ticker}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{kpi.label}</div>
      <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 16 }}>
        Line: <span style={{ color: "#fff", fontWeight: 700, fontFamily: "monospace" }}>{kpi.line}{isPercent ? "%" : ""}</span>
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
        {["over", "under"].map(s => (
          <button key={s} onClick={() => setSide(s)} style={{
            flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid",
            borderColor: side === s ? (s === "over" ? "#6ee7b7" : "#f87171") : "#ffffff12",
            background: side === s ? (s === "over" ? "#6ee7b710" : "#f8717110") : "#ffffff05",
            color: side === s ? (s === "over" ? "#6ee7b7" : "#f87171") : "#555",
            fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase",
            fontFamily: "monospace", letterSpacing: 2, transition: "all 0.15s",
          }}>{s} {s === "over" ? prices.over : prices.under}¢</button>
        ))}
      </div>
      <OdometerDial value={amount} onChange={setAmount} />
      <div style={{ marginTop: 18, padding: 14, background: "#ffffff05", borderRadius: 8, border: "1px solid #ffffff08" }}>
        {[["Avg Price", `${price}¢`], ["Contracts", shares], ["Max Payout", `$${payout}`]].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: i < 2 ? 6 : 0 }}>
            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{k}</span>
            <span style={{ fontSize: 11, color: i === 2 ? "#6ee7b7" : "#e2e8f0", fontWeight: i === 2 ? 700 : 400, fontFamily: "monospace" }}>{v}</span>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", marginTop: 14, padding: "13px 0", borderRadius: 8, border: "none",
        background: side === "over" ? "linear-gradient(135deg, #059669, #6ee7b7)" : "linear-gradient(135deg, #dc2626, #f87171)",
        color: "#000", fontSize: 13, fontWeight: 800, cursor: "pointer",
        fontFamily: "monospace", letterSpacing: 2, textTransform: "uppercase",
        boxShadow: side === "over" ? "0 4px 16px rgba(110,231,183,0.25)" : "0 4px 16px rgba(248,113,113,0.25)",
      }}>Buy {side.toUpperCase()} — ${amount}</button>
    </div>
  );
}

function StockSection({ stock, onBet, activeBet }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, padding: "14px 18px",
        background: `linear-gradient(135deg, ${stock.color}08 0%, #0d0d1a 100%)`,
        border: `1px solid ${stock.color}18`, borderRadius: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            background: stock.color + "20", border: `1px solid ${stock.color}40`,
            fontSize: 12, fontWeight: 800, color: stock.color, fontFamily: "monospace",
          }}>{stock.ticker.slice(0, 2)}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>{stock.ticker}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>{stock.name}</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "monospace" }}>Next Earnings</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: stock.color, fontFamily: "monospace" }}>{stock.nextEarnings}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {stock.kpis.map(kpi => (
          <KPICard key={kpi.id} kpi={kpi} stockColor={stock.color} onBet={onBet} activeBet={activeBet} />
        ))}
      </div>
    </div>
  );
}

export default function BetKPI() {
  const [activeStock, setActiveStock] = useState("ALL");
  const [activeBet, setActiveBet] = useState(null);
  const [activeStockObj, setActiveStockObj] = useState(null);

  const handleBet = useCallback((kpi) => {
    const stock = Object.values(STOCKS).find(s => s.kpis.some(k => k.id === kpi.id));
    setActiveBet(kpi);
    setActiveStockObj(stock);
  }, []);

  const stockList = activeStock === "ALL" ? Object.values(STOCKS) : [STOCKS[activeStock]];

  return (
    <div style={{ minHeight: "100vh", background: "#08080f", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 3px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blink { 0%,100% { opacity: .4; } 50% { opacity: 1; } }
      `}</style>

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 24px", borderBottom: "1px solid #ffffff08",
        position: "sticky", top: 0, zIndex: 50, background: "#08080fee", backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg, #6ee7b7, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#000", fontFamily: "monospace",
            boxShadow: "0 0 16px rgba(110,231,183,0.25)",
          }}>B</div>
          <span style={{ fontSize: 17, fontWeight: 800, fontFamily: "'Sora', sans-serif", letterSpacing: -0.5 }}>
            bet<span style={{ color: "#6ee7b7" }}>kpi</span>
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6ee7b7", animation: "blink 2s infinite" }} />
          <span style={{ fontSize: 10, color: "#6b7280", fontFamily: "monospace", letterSpacing: 1 }}>MARKETS OPEN</span>
          <button style={{
            marginLeft: 12, padding: "7px 16px", borderRadius: 7,
            border: "1px solid #6ee7b750", background: "#6ee7b710",
            color: "#6ee7b7", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>Connect Wallet</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px" }}>
        <div style={{ padding: "40px 0 28px", animation: "fadeUp 0.5s ease" }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: "uppercase", color: "#6ee7b7", fontFamily: "monospace", marginBottom: 8 }}>
            Earnings KPI Markets
          </div>
          <h1 style={{
            fontSize: 36, fontWeight: 800, fontFamily: "'Sora', sans-serif",
            background: "linear-gradient(135deg, #e2e8f0 0%, #6ee7b7 70%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 8,
          }}>Bet the KPIs that move markets.</h1>
          <p style={{ fontSize: 14, color: "#6b7280", maxWidth: 480, lineHeight: 1.5 }}>
            Over/under contracts on the metrics that matter — revenue, margins, DAP, ad pricing. Pick your side before earnings drop.
          </p>
        </div>

        <div style={{
          display: "flex", gap: 6, marginBottom: 24, padding: "10px 0",
          borderBottom: "1px solid #ffffff08", animation: "fadeUp 0.6s ease",
        }}>
          {["ALL", "NVDA", "NFLX", "META"].map(t => {
            const isActive = activeStock === t;
            const col = t === "ALL" ? "#6ee7b7" : STOCKS[t]?.color || "#6ee7b7";
            return (
              <button key={t} onClick={() => setActiveStock(t)} style={{
                padding: "7px 18px", borderRadius: 8, border: "1px solid",
                borderColor: isActive ? col + "60" : "#ffffff10",
                background: isActive ? col + "12" : "transparent",
                color: isActive ? col : "#6b7280",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "monospace", letterSpacing: 1, transition: "all 0.15s",
              }}>{t}</button>
            );
          })}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: activeBet ? "1fr 320px" : "1fr",
          gap: 24, animation: "fadeUp 0.7s ease",
        }}>
          <div>
            {stockList.map(stock => (
              <StockSection key={stock.ticker} stock={stock} onBet={handleBet} activeBet={activeBet} />
            ))}
          </div>
          {activeBet && activeStockObj && (
            <div style={{ position: "sticky", top: 72, alignSelf: "start" }}>
              <TradeSlip kpi={activeBet} stock={activeStockObj} onClose={() => { setActiveBet(null); setActiveStockObj(null); }} />
            </div>
          )}
        </div>

        <div style={{
          margin: "48px 0 32px", padding: "24px 28px",
          background: "#0d0d18", border: "1px solid #ffffff08", borderRadius: 14,
        }}>
          <div style={{ fontSize: 10, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: 3, fontFamily: "monospace", marginBottom: 12 }}>How it works</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {[
              { s: "01", t: "Pick a KPI", d: "Choose a metric from an upcoming earnings report — revenue, EPS, margins, DAP." },
              { s: "02", t: "Set your side", d: "Buy OVER or UNDER at the posted line. Prices reflect the market's implied probability." },
              { s: "03", t: "Earnings drop", d: "When the company reports, contracts settle at $1 (correct) or $0 (wrong). Collect your payout." },
            ].map(x => (
              <div key={x.s}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#6ee7b730", fontFamily: "monospace", marginBottom: 4 }}>{x.s}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{x.t}</div>
                <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5 }}>{x.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: "24px 0", borderTop: "1px solid #ffffff06",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "'Sora', sans-serif" }}>
            bet<span style={{ color: "#6ee7b7" }}>kpi</span>
          </span>
          <span style={{ fontSize: 10, color: "#4b5563", fontFamily: "monospace" }}>© 2026 betkpi — Earnings KPI Markets</span>
        </div>
      </div>
    </div>
  );
}
