import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// ─── Inline styles for animations and scrollbar (Tailwind can't do these) ───
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ── Custom Scrollbar ── */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #fff7ed; border-radius: 99px; }
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #f97316, #16a34a);
    border-radius: 99px;
    border: 2px solid #fff7ed;
  }
  ::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, #ea580c, #15803d); }

  /* ── Animated Background ── */
  @keyframes meshShift {
    0%   { background-position: 0% 0%; }
    50%  { background-position: 100% 100%; }
    100% { background-position: 0% 0%; }
  }

  @keyframes blobFloat {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(40px,-40px) scale(1.08); }
    66%     { transform: translate(-25px,25px) scale(0.93); }
  }

  @keyframes blobFloat2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%     { transform: translate(-35px,30px) scale(1.06); }
    70%     { transform: translate(20px,-20px) scale(0.96); }
  }

  @keyframes gridPulse {
    0%,100% { opacity: 0.4; }
    50%     { opacity: 0.9; }
  }

  @keyframes cardEntrance {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0%   { transform: translateX(-100%); }
    100% { transform: translateX(200%); }
  }

  @keyframes countUp {
    from { opacity: 0; transform: scale(0.7); }
    to   { opacity: 1; transform: scale(1); }
  }

  @keyframes spin-slow {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse-ring {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(1.6); opacity: 0; }
  }

  /* ── Background mesh ── */
  .bg-mesh {
    position: fixed; inset: 0; z-index: -10;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.18) 0%, transparent 55%),
      radial-gradient(ellipse at 80% 20%, rgba(22,163,74,0.15) 0%, transparent 55%),
      radial-gradient(ellipse at 60% 80%, rgba(255,255,255,0.9) 0%, transparent 55%),
      #fff7ed;
    background-size: 300% 300%;
    animation: meshShift 18s ease infinite;
  }

  .bg-grid-pattern {
    position: fixed; inset: 0; z-index: -9;
    background-image:
      linear-gradient(rgba(249,115,22,0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(22,163,74,0.07) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: gridPulse 6s ease-in-out infinite;
  }

  .blob-orange {
    position: fixed; top: 10%; right: 8%;
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(249,115,22,0.22) 0%, transparent 70%);
    border-radius: 50%; filter: blur(50px);
    animation: blobFloat 18s ease-in-out infinite;
    z-index: -8;
  }

  .blob-green {
    position: fixed; bottom: 8%; left: 5%;
    width: 460px; height: 460px;
    background: radial-gradient(circle, rgba(22,163,74,0.18) 0%, transparent 70%);
    border-radius: 50%; filter: blur(60px);
    animation: blobFloat2 22s ease-in-out infinite;
    z-index: -8;
  }

  .blob-white {
    position: fixed; top: 55%; right: 30%;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%);
    border-radius: 50%; filter: blur(40px);
    animation: blobFloat 14s ease-in-out infinite reverse;
    z-index: -8;
  }

  /* ── Cards ── */
  .stat-card {
    animation: cardEntrance 0.5s ease forwards;
    opacity: 0;
  }
  .stat-card:nth-child(1) { animation-delay: 0.05s; }
  .stat-card:nth-child(2) { animation-delay: 0.15s; }
  .stat-card:nth-child(3) { animation-delay: 0.25s; }
  .stat-card:nth-child(4) { animation-delay: 0.35s; }

  .shimmer-line {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
    transform: translateX(-100%);
  }
  .stat-card:hover .shimmer-line { animation: shimmer 0.75s ease forwards; }

  /* ── Chart cards ── */
  .chart-card {
    animation: cardEntrance 0.6s ease forwards;
    opacity: 0;
  }
  .chart-card:nth-child(1) { animation-delay: 0.45s; }
  .chart-card:nth-child(2) { animation-delay: 0.55s; }

  /* ── Donut ring ── */
  .donut-segment {
    transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);
  }

  /* ── Bar chart bars ── */
  @keyframes barGrow {
    from { transform: scaleY(0); transform-origin: bottom; }
    to   { transform: scaleY(1); transform-origin: bottom; }
  }
  .bar { animation: barGrow 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* ── Line chart ── */
  @keyframes drawLine {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  .line-path { animation: drawLine 1.5s ease forwards; stroke-dasharray: 1000; }

  /* Pulse badge */
  .pulse-dot::after {
    content: '';
    position: absolute; inset: -4px;
    border-radius: 50%;
    background: rgba(249,115,22,0.4);
    animation: pulse-ring 1.4s ease-out infinite;
  }

  /* font */
  body { font-family: 'DM Sans', sans-serif; }
  .font-display { font-family: 'Syne', sans-serif; }
`;

// ─── Mini Pure-CSS / SVG Charts (no external lib needed for preview) ─────────

const LineChart = () => {
  const points = [30, 55, 40, 70, 60, 90, 80].map((v, i) => `${i * 55 + 10},${110 - v}`).join(" ");
  const area = `10,110 ${points} ${6 * 55 + 10},110`;
  return (
    <svg viewBox="0 0 340 120" className="w-full">
      {/* grid lines */}
      {[25, 50, 75, 100].map(y => (
        <line key={y} x1="10" y1={120 - y} x2="330" y2={120 - y}
          stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
      ))}
      {/* area */}
      <polygon points={area} fill="url(#areaGrad)" opacity="0.3" />
      {/* line */}
      <polyline points={points} fill="none"
        stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round"
        className="line-path" />
      {/* dots */}
      {[30, 55, 40, 70, 60, 90, 80].map((v, i) => (
        <circle key={i} cx={i * 55 + 10} cy={110 - v} r="4"
          fill="white" stroke="#f97316" strokeWidth="2" />
      ))}
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0.05" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const DonutChart = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);
  const r = 54, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const segments = [
    { pct: 0.55, color: "#16a34a", label: "Positive", val: "55%" },
    { pct: 0.25, color: "#f97316", label: "Neutral", val: "25%" },
    { pct: 0.20, color: "#fbbf24", label: "Negative", val: "20%" },
  ];
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 128 128" className="w-36 h-36 shrink-0">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {segments.map((s, i) => {
          const dash = s.pct * circ;
          const gap = circ - dash;
          const rotate = offset * 360 - 90;
          offset += s.pct;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={s.color} strokeWidth="14"
              strokeDasharray={mounted ? `${dash} ${gap}` : `0 ${circ}`}
              strokeDashoffset="0"
              style={{ transform: `rotate(${rotate}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: `stroke-dasharray 1s ${i * 0.2}s ease` }}
            />
          );
        })}
        <text x={cx} y={cy} textAnchor="middle" dy="0.35em"
          style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, fill: '#1c1917' }}>
          Feedback
        </text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-stone-600">{s.label}</span>
            <span className="font-bold ml-auto" style={{ color: s.color }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BarChart = () => {
  const data = [
    { label: "Jan", a: 60, b: 40 },
    { label: "Feb", a: 80, b: 55 },
    { label: "Mar", a: 50, b: 70 },
    { label: "Apr", a: 90, b: 60 },
    { label: "May", a: 70, b: 85 },
    { label: "Jun", a: 75, b: 50 },
  ];
  return (
    <div className="flex items-end gap-3 h-36 mt-2">
      {data.map((d, i) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex gap-1 items-end h-28">
            <div className="bar flex-1 rounded-t-md"
              style={{ height: `${d.a}%`, background: 'linear-gradient(to top,#f97316,#fdba74)', animationDelay: `${i * 0.08}s` }} />
            <div className="bar flex-1 rounded-t-md"
              style={{ height: `${d.b}%`, background: 'linear-gradient(to top,#16a34a,#86efac)', animationDelay: `${i * 0.08 + 0.04}s` }} />
          </div>
          <span className="text-xs text-stone-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, accentColor, delay }) => (
  <div className="stat-card relative bg-white/70 backdrop-blur-sm border border-white/80 p-6 rounded-2xl shadow-lg overflow-hidden cursor-default group"
    style={{ animationDelay: delay }}>
    {/* Shimmer */}
    <div className="shimmer-line" />
    {/* Top accent bar */}
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
      style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }} />
    {/* Icon */}
    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
      style={{ background: `${accentColor}18` }}>
      {icon}
    </div>
    <p className="text-stone-500 text-sm font-medium">{title}</p>
    <p className="font-display text-3xl font-bold text-stone-800 mt-1" style={{ animation: 'countUp 0.5s ease forwards' }}>
      {value}
    </p>
    {/* Hover border glow */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ boxShadow: `inset 0 0 0 1.5px ${accentColor}40` }} />
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const ProfessionalInsightsDashboard = () => {
  const location = useLocation ? useLocation() : { pathname: "/insights" };

  const cards = [
    { title: "Total Users",      value: "12,480", icon: "👥", accentColor: "#f97316" },
    { title: "Conversion Rate",  value: "4.7%",   icon: "📈", accentColor: "#16a34a" },
    { title: "Active Reports",   value: "38",      icon: "📋", accentColor: "#f97316" },
    { title: "Avg. Sentiment",   value: "87/100",  icon: "💬", accentColor: "#16a34a" },
  ];

  const renderContent = () => {
    switch (location.pathname) {

      case "/insights/reports":
        return (
          <div className="bg-white/70 backdrop-blur-sm border border-white/80 p-8 rounded-2xl shadow-lg chart-card">
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">Reports</h2>
            <p className="text-stone-400">No data available yet.</p>
          </div>
        );

      case "/insights/trend-analysis":
        return (
          <div className="bg-white/70 backdrop-blur-sm border border-white/80 p-8 rounded-2xl shadow-lg chart-card">
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-1">Trend Analysis</h2>
            <p className="text-stone-400 text-sm mb-4">Feature A (orange) vs Feature B (green)</p>
            <BarChart />
            <div className="flex gap-4 mt-4">
              {[["Feature A","#f97316"],["Feature B","#16a34a"]].map(([l,c])=>(
                <div key={l} className="flex items-center gap-1 text-sm text-stone-500">
                  <span className="w-3 h-3 rounded-sm" style={{background:c}} />{l}
                </div>
              ))}
            </div>
          </div>
        );

      case "/insights/feedback":
        return (
          <div className="bg-white/70 backdrop-blur-sm border border-white/80 p-8 rounded-2xl shadow-lg chart-card">
            <h2 className="font-display text-2xl font-bold text-stone-800 mb-4">User Feedback</h2>
            <DonutChart />
          </div>
        );

      default:
        return (
          <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="relative">
                  <span className="pulse-dot relative inline-flex w-3 h-3 rounded-full bg-orange-500" />
                </div>
                <span className="text-sm text-stone-400 font-medium tracking-widest uppercase">Live</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-extrabold text-stone-800 leading-tight">
                Dashboard&nbsp;
                <span style={{ background: 'linear-gradient(90deg,#f97316,#16a34a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Overview
                </span>
              </h1>
              <p className="text-stone-400 mt-2">Real-time summary of key operational metrics.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {cards.map((c, i) => <StatCard key={c.title} {...c} delay={`${i * 0.1}s`} />)}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Line */}
              <div className="chart-card lg:col-span-2 bg-white/70 backdrop-blur-sm border border-white/80 p-6 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-bold text-stone-800">Monthly User Growth</h3>
                  <div className="flex gap-2 text-xs">
                    {[["2024","#f97316"],["2025","#16a34a"]].map(([y,c])=>(
                      <span key={y} className="px-2 py-0.5 rounded-full text-white text-xs font-medium"
                        style={{background:c}}>{y}</span>
                    ))}
                  </div>
                </div>
                <LineChart />
                <div className="flex justify-between text-xs text-stone-300 mt-1 px-1">
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map(m=><span key={m}>{m}</span>)}
                </div>
              </div>

              {/* Donut */}
              <div className="chart-card bg-white/70 backdrop-blur-sm border border-white/80 p-6 rounded-2xl shadow-lg">
                <h3 className="font-display font-bold text-stone-800 mb-4">Sentiment Breakdown</h3>
                <DonutChart />
              </div>
            </div>

            {/* Bar chart row */}
            <div className="chart-card mt-5 bg-white/70 backdrop-blur-sm border border-white/80 p-6 rounded-2xl shadow-lg"
              style={{ animationDelay: '0.6s' }}>
              <h3 className="font-display font-bold text-stone-800 mb-1">Feature Adoption</h3>
              <p className="text-stone-400 text-xs mb-2">Feature A vs Feature B — monthly comparison</p>
              <BarChart />
            </div>
          </>
        );
    }
  };

  return (
    <>
      <style>{globalStyles}</style>

      {/* Animated background layers */}
      <div className="bg-mesh" />
      <div className="bg-grid-pattern" />
      <div className="blob-orange" />
      <div className="blob-green" />
      <div className="blob-white" />

      {/* Scrollable main */}
      <main className="relative z-10 min-h-screen overflow-y-auto p-5 md:p-10">
        {renderContent()}
      </main>
    </>
  );
};

export default ProfessionalInsightsDashboard;
