import { useState } from "react";

// ─── SVG Helpers ─────────────────────────────────────────────────────────────

function pt(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

// Annular sector with rounded corners using Q bezier at each corner
function roundedSector(
  cx: number, cy: number,
  r1: number, r2: number,
  a1: number, a2: number,
  cr = 8
) {
  const ao1 = (cr / r1) * (180 / Math.PI); // angle offset at inner radius
  const ao2 = (cr / r2) * (180 / Math.PI); // angle offset at outer radius
  const f = (n: number) => n.toFixed(2);

  // Outer arc: from a1+ao2 to a2-ao2
  const Po1 = pt(cx, cy, r2, a1 + ao2);
  const Po2 = pt(cx, cy, r2, a2 - ao2);
  // Corners
  const Co_end = pt(cx, cy, r2, a2);
  const Pr_eo = pt(cx, cy, r2 - cr, a2);
  const Pr_ei = pt(cx, cy, r1 + cr, a2);
  const Ci_end = pt(cx, cy, r1, a2);
  const Pi2 = pt(cx, cy, r1, a2 - ao1);
  const Pi1 = pt(cx, cy, r1, a1 + ao1);
  const Ci_st = pt(cx, cy, r1, a1);
  const Pr_si = pt(cx, cy, r1 + cr, a1);
  const Pr_so = pt(cx, cy, r2 - cr, a1);
  const Co_st = pt(cx, cy, r2, a1);

  return [
    `M${f(Po1.x)} ${f(Po1.y)}`,
    `A${r2} ${r2} 0 0 1 ${f(Po2.x)} ${f(Po2.y)}`,
    `Q${f(Co_end.x)} ${f(Co_end.y)} ${f(Pr_eo.x)} ${f(Pr_eo.y)}`,
    `L${f(Pr_ei.x)} ${f(Pr_ei.y)}`,
    `Q${f(Ci_end.x)} ${f(Ci_end.y)} ${f(Pi2.x)} ${f(Pi2.y)}`,
    `A${r1} ${r1} 0 0 0 ${f(Pi1.x)} ${f(Pi1.y)}`,
    `Q${f(Ci_st.x)} ${f(Ci_st.y)} ${f(Pr_si.x)} ${f(Pr_si.y)}`,
    `L${f(Pr_so.x)} ${f(Pr_so.y)}`,
    `Q${f(Co_st.x)} ${f(Co_st.y)} ${f(Po1.x)} ${f(Po1.y)}`,
    "Z",
  ].join(" ");
}

// ─── Segment data ─────────────────────────────────────────────────────────────

const SA = 360 / 7;
const CX = 250, CY = 250, R1 = 96, R2 = 210;

const SEGS = [
  { name: "EraFarm Pro™",               desc: "Farm data & producer\nintelligence",                color: "#3db860", start: -SA/2,     end: SA/2,     icon: "🌿", mid: 0 },
  { name: "EraSupply Pro™",             desc: "Procurement & supply\nchain coordination",          color: "#16b8d0", start: SA/2,      end: SA*1.5,   icon: "🚚", mid: SA },
  { name: "EraFood Pro™",               desc: "Food innovation &\nnutrition intelligence",         color: "#f5821f", start: SA*1.5,    end: SA*2.5,   icon: "🍲", mid: SA*2 },
  { name: "EraMarket Pro™",             desc: "Market intelligence &\ndemand analytics",           color: "#c040a8", start: SA*2.5,    end: SA*3.5,   icon: "📊", mid: SA*3 },
  { name: "EraMart™",                   desc: "Marketplace &\ntransactions",                       color: "#5840c8", start: SA*3.5,    end: SA*4.5,   icon: "🛒", mid: SA*4 },
  { name: "EraWellness\nAcademy Pro™",  desc: "Training & knowledge\nplatform",                    color: "#88b020", start: SA*4.5,    end: SA*5.5,   icon: "🎓", mid: SA*5 },
  { name: "EraWellness\nEngineering Pro™", desc: "Technology, AI &\nplatform services",            color: "#2868c8", start: SA*5.5,    end: SA*6.5,   icon: "⚙️", mid: SA*6 },
];

// Callout data — positioned at segment boundaries
const CALLOUTS = [
  { label: "More Data",             sub: "(usage, market,\nconsumer, impact)",         angle: -SA/2  },
  { label: "Better Decisions",      sub: "(for farmers, businesses,\ncommunities)",    angle: SA/2   },
  { label: "More\nTransactions",    sub: "(through EraM...™\nand supply chains)",      angle: SA*1.5 },
  { label: "Revenue Growth",        sub: "(healthy, diversified,\nrecurring streams)", angle: SA*2.5 },
  { label: "Stronger\nEcosystem",   sub: "(more producers,\npartners, markets)",       angle: SA*3.5 },
  { label: "Improved Products\n& Services", sub: "(quality, nutrition,\ninnovation)", angle: SA*4.5 },
];

// ─── Ecosystem Wheel (SVG, fully self-contained) ──────────────────────────────

function EcosystemWheel() {
  const R_CALLOUT = 270; // radius to center of callout boxes

  return (
    <svg
      viewBox="-90 -90 680 680"
      width="100%"
      style={{ display: "block", overflow: "visible" }}
    >
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
          <path d="M0,0 L0,7 L7,3.5 Z" fill="#1a5c2e" />
        </marker>
        <filter id="seg-shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <filter id="center-shadow">
          <feDropShadow dx="0" dy="3" stdDeviation="8" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Outer ring dots at segment boundaries */}
      {CALLOUTS.map((c, i) => {
        const p = pt(CX, CY, R2 + 8, c.angle);
        return <circle key={i} cx={p.x} cy={p.y} r={7} fill="#1a5c2e" />;
      })}

      {/* Concentric arc arrows between callout boundary points */}
      {CALLOUTS.map((c, i) => {
        const nextAngle = CALLOUTS[(i + 1) % CALLOUTS.length].angle;
        let na = nextAngle;
        // Handle wrap-around for the last arc (from 231.43° back to ~334.3°)
        if (i === CALLOUTS.length - 1) na = (360 - SA / 2);

        const fromAngle = c.angle + 6;
        const toAngle = na - 6;
        const R_arc = R2 + 24;
        const p1 = pt(CX, CY, R_arc, fromAngle);
        const p2 = pt(CX, CY, R_arc, toAngle);
        const span = toAngle - fromAngle;
        const la = span > 180 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A${R_arc} ${R_arc} 0 ${la} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`}
            fill="none"
            stroke="#1a5c2e"
            strokeWidth="2"
            markerEnd="url(#arr)"
          />
        );
      })}

      {/* Connector lines from boundary dots to callout boxes */}
      {CALLOUTS.map((c, i) => {
        const outerPt = pt(CX, CY, R2 + 16, c.angle);
        const boxPt = pt(CX, CY, R_CALLOUT, c.angle);
        return (
          <line
            key={i}
            x1={outerPt.x.toFixed(2)} y1={outerPt.y.toFixed(2)}
            x2={boxPt.x.toFixed(2)} y2={boxPt.y.toFixed(2)}
            stroke="#1a5c2e" strokeWidth="1.5" strokeDasharray="3 2"
          />
        );
      })}

      {/* Callout boxes */}
      {CALLOUTS.map((c, i) => {
        const pos = pt(CX, CY, R_CALLOUT, c.angle);
        const bw = 138, bh = 55;
        const bx = pos.x - bw / 2;
        const by = pos.y - bh / 2;
        const lines1 = c.label.split("\n");
        const lines2 = c.sub.split("\n");
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} rx={8} ry={8}
              fill="white" stroke="#d0d0d0" strokeWidth="1"
              style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.10))" }} />
            {lines1.map((l, j) => (
              <text key={j} x={pos.x} y={by + 15 + j * 13}
                textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#222"
                style={{ fontFamily: "Poppins,sans-serif" }}>{l}</text>
            ))}
            {lines2.map((l, j) => (
              <text key={j} x={pos.x} y={by + 15 + lines1.length * 13 + j * 11}
                textAnchor="middle" fontSize="9" fill="#666"
                style={{ fontFamily: "Inter,sans-serif" }}>{l}</text>
            ))}
          </g>
        );
      })}

      {/* Segments */}
      {SEGS.map((seg) => {
        const mid = seg.mid;
        const iconR = 186;
        const nameR = 160;
        const descR = 135;
        const ip = pt(CX, CY, iconR, mid);
        const np = pt(CX, CY, nameR, mid);
        const dp = pt(CX, CY, descR, mid);
        // Flip text for bottom-half segments so it's never upside-down
        const rotate = mid > 91 && mid < 269 ? mid + 180 : mid;
        const nameLines = seg.name.split("\n");
        const descLines = seg.desc.split("\n");

        return (
          <g key={seg.name} filter="url(#seg-shadow)">
            <path d={roundedSector(CX, CY, R1, R2, seg.start, seg.end, 9)} fill={seg.color} />
            {/* Icon circle */}
            <circle cx={ip.x} cy={ip.y} r={14} fill="rgba(255,255,255,0.28)" />
            <text x={ip.x} y={ip.y} textAnchor="middle" dominantBaseline="central"
              fontSize="13" style={{ userSelect: "none" }}>{seg.icon}</text>
            {/* Platform name — each line rotated around its own centre */}
            {nameLines.map((line, li) => {
              const offset = (li - (nameLines.length - 1) / 2) * 13;
              return (
                <text key={li}
                  x={np.x} y={np.y + offset}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="10.5" fontWeight="700" fill="white"
                  style={{ fontFamily: "Poppins,sans-serif", userSelect: "none" }}
                  transform={`rotate(${rotate},${np.x.toFixed(2)},${np.y.toFixed(2)})`}
                >
                  {line}
                </text>
              );
            })}
            {/* Description */}
            {descLines.map((line, li) => {
              const offset = (li - (descLines.length - 1) / 2) * 10;
              return (
                <text key={li}
                  x={dp.x} y={dp.y + offset}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="8" fill="rgba(255,255,255,0.85)"
                  style={{ fontFamily: "Inter,sans-serif", userSelect: "none" }}
                  transform={`rotate(${rotate},${dp.x.toFixed(2)},${dp.y.toFixed(2)})`}
                >
                  {line}
                </text>
              );
            })}
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={CX} cy={CY} r={90} fill="white" filter="url(#center-shadow)" />
      <circle cx={CX} cy={CY} r={88} fill="white" stroke="#e8e8e8" strokeWidth="1" />

      {/* Center content */}
      <text x={CX} y={213} textAnchor="middle" fontSize="18">🌿</text>
      <text x={CX} y={232} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1a5c2e"
        style={{ fontFamily: "Poppins,sans-serif" }}>EraWellness</text>
      <text x={CX} y={244} textAnchor="middle" fontSize="8" fill="#555"
        style={{ fontFamily: "Poppins,sans-serif", letterSpacing: "0.07em" }}>SOLUTIONS UGANDA</text>
      <line x1={CX - 32} y1={252} x2={CX + 32} y2={252} stroke="#e0e0e0" strokeWidth="1" />
      <text x={CX} y={263} textAnchor="middle" fontSize="7.5" fontWeight="800" fill="#1a5c2e"
        style={{ fontFamily: "Poppins,sans-serif", letterSpacing: "0.1em" }}>ONE ECOSYSTEM</text>
      <text x={CX} y={274} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#2a7a45"
        style={{ fontFamily: "Poppins,sans-serif", letterSpacing: "0.07em" }}>MULTIPLE ENGINES</text>
      <text x={CX} y={285} textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#f07920"
        style={{ fontFamily: "Poppins,sans-serif", letterSpacing: "0.07em" }}>LASTING IMPACT</text>
    </svg>
  );
}

// ─── Nav Panel ────────────────────────────────────────────────────────────────

interface NavPanelProps {
  headerColor: string;
  icon: string;
  title: string;
  subtitle: string;
  links: string[];
  flexGrow?: number;
}

function NavPanel({ headerColor, icon, title, subtitle, links, flexGrow = 1 }: NavPanelProps) {
  return (
    <div
      className="border border-gray-200 rounded-sm overflow-hidden flex flex-col"
      style={{ flex: `${flexGrow} 1 0`, minHeight: 0 }}
    >
      <div className="flex items-start gap-2 px-3 py-2 flex-shrink-0" style={{ background: headerColor }}>
        <span className="text-xl leading-none mt-0.5 flex-shrink-0">{icon}</span>
        <div>
          <div className="font-extrabold text-xs tracking-wider text-white" style={{ fontFamily: "Poppins,sans-serif" }}>
            {title}
          </div>
          <div className="text-xs mt-0.5 leading-snug text-white opacity-85">{subtitle}</div>
        </div>
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        {links.map((link) => (
          <a
            key={link}
            href="#"
            onClick={(e) => e.preventDefault()}
            className="flex items-center justify-between px-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-green-800 transition-colors flex-1 border-b border-gray-100 last:border-0"
            style={{ minHeight: 0 }}
          >
            <span className="leading-tight py-1">{link}</span>
            <span className="text-gray-400 flex-shrink-0 ml-1">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ─── Value Chain ──────────────────────────────────────────────────────────────

const VC_NODES = [
  { icon: "🌿", label: "Natural Resources\n& Indigenous Crops",                    accent: "#2a7a45" },
  { icon: "👨‍👩‍👧‍👦", label: "Producers &\nCommunities",                                    accent: "#2a7a45" },
  { icon: "🏭", label: "Processing &\nValue Addition",                             accent: "#f07920" },
  { icon: "📦", label: "Products &\nServices",                                     accent: "#c0392b" },
  { icon: "🛒", label: "Markets &\nConsumers",                                     accent: "#8040b0" },
  { icon: "👥", label: "Healthier People,\nStronger Livelihoods,\nThriving Economies", accent: "#1a45a0" },
  { icon: "🌍", label: "A More\nResilient Africa",                                 accent: "#1a5c2e" },
];

function ValueChain() {
  return (
    <section className="w-full bg-white border-t border-gray-200 py-4 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="font-extrabold text-sm text-gray-800" style={{ fontFamily: "Poppins,sans-serif" }}>
            THE VALUE CHAIN
          </span>
          <span className="text-xs text-gray-400 italic">From resources to lasting impact ✦</span>
        </div>
        <div className="flex items-stretch gap-0">
          {VC_NODES.map((node, i) => (
            <div key={i} className="flex items-center gap-0 flex-1">
              <div
                className="flex-1 flex items-center gap-2 rounded border-2 px-3 py-2"
                style={{ borderColor: node.accent }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: node.accent }}
                >
                  <span className="text-white text-sm">{node.icon}</span>
                </div>
                <div
                  className="font-semibold leading-tight"
                  style={{ color: node.accent, fontFamily: "Poppins,sans-serif", fontSize: 10 }}
                >
                  {node.label.split("\n").map((l, j) => <span key={j}>{l}<br /></span>)}
                </div>
              </div>
              {i < VC_NODES.length - 1 && (
                <div className="flex-shrink-0 px-1 text-gray-400 font-light text-lg">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Impact Section ───────────────────────────────────────────────────────────

const IMPACT_ITEMS = [
  { icon: "❤️",  label: "Health &\nWellbeing" },
  { icon: "🌾",  label: "Food-System\nTransformation" },
  { icon: "👨‍🌾", label: "Producer\nLivelihoods" },
  { icon: "💹",  label: "Economic\nResilience" },
  { icon: "🔬",  label: "Science &\nInnovation" },
  { icon: "💻",  label: "Digital\nImpact" },
  { icon: "🏘️",  label: "Community\nImpact" },
  { icon: "🌱",  label: "Environmental\nResilience" },
  { icon: "🤝",  label: "Partnerships" },
  { icon: "📈",  label: "Impact\nMeasurement" },
];

function ImpactSection() {
  return (
    <section className="w-full bg-white py-4 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Inner green rounded card — not full width */}
        <div
          className="flex items-center gap-6 px-6 py-4 rounded-2xl"
          style={{ background: "#1a5c2e" }}
        >
          {/* Left: OUR IMPACT blurb */}
          <div className="flex-shrink-0 w-40">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🌿</span>
              <span className="font-extrabold text-sm text-white" style={{ fontFamily: "Poppins,sans-serif" }}>
                OUR IMPACT
              </span>
            </div>
            <p className="text-xs text-green-200 leading-relaxed">
              Better food systems. Better nutrition. Better health. Stronger livelihoods. Stronger local economies. Greater resilience.
            </p>
          </div>

          {/* Divider */}
          <div className="w-px self-stretch bg-green-700 flex-shrink-0" />

          {/* Icons grid */}
          <div className="flex flex-1 justify-between gap-1">
            {IMPACT_ITEMS.map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center gap-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.30)" }}
                >
                  {item.icon}
                </div>
                <div className="text-green-100 leading-tight" style={{ fontSize: 9.5, fontFamily: "Inter,sans-serif" }}>
                  {item.label.split("\n").map((l, j) => <span key={j}>{l}<br /></span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer tagline ───────────────────────────────────────────────────────────

function FooterTagline() {
  return (
    <div className="w-full border-t border-gray-200 bg-gray-50 py-3 px-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <span className="text-green-800">🌿</span>
        <div
          className="flex items-center gap-4 text-xs font-semibold tracking-wider text-gray-500"
          style={{ fontFamily: "Poppins,sans-serif" }}
        >
          <span>LOCAL RESOURCES</span>
          <span className="text-gray-300">→</span>
          <span>INNOVATIVE SOLUTIONS</span>
          <span className="text-gray-300">→</span>
          <span>CONNECTED SYSTEMS</span>
          <span className="text-gray-300">→</span>
          <span>MEASURABLE IMPACT</span>
        </div>
        <span className="text-green-800">🌿</span>
      </div>
    </div>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────

function ComingSoon({ page, onBack }: { page: string; onBack: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-green-800 mb-2" style={{ fontFamily: "Poppins,sans-serif" }}>
          {page}
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          This section is coming soon. We&apos;re building something great.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-2 rounded text-white text-sm font-semibold"
          style={{ background: "#1a5c2e", fontFamily: "Poppins,sans-serif" }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("Home");
  const navLinks = ["Home", "About", "Ecosystem", "Solutions", "EraWellness Pro™", "Impact", "Contact"];

  if (page !== "Home") return <ComingSoon page={page} onBack={() => setPage("Home")} />;

  return (
    <div className="min-h-screen bg-white flex flex-col text-gray-900">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1400px] mx-auto flex items-center gap-4 px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex">
              <span className="text-2xl">🌿</span>
              <span className="text-2xl -ml-1">🌿</span>
            </div>
            <div>
              <div className="font-extrabold text-green-800 text-lg leading-none"
                style={{ fontFamily: "Poppins,sans-serif" }}>EraWellness</div>
              <div className="text-xs text-green-700 tracking-widest"
                style={{ fontFamily: "Poppins,sans-serif" }}>SOLUTIONS UGANDA</div>
            </div>
          </div>

          {/* Tagline */}
          <div className="border-l border-gray-200 pl-4 ml-2 hidden lg:block">
            <div className="text-sm font-semibold italic text-gray-800"
              style={{ fontFamily: "Poppins,sans-serif" }}>
              One Ecosystem. Multiple Engines.
            </div>
            <div className="text-xs italic text-gray-500">Greater Health, Prosperity and Resilience.</div>
          </div>

          {/* Nav */}
          <nav className="ml-auto flex items-center">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => setPage(link)}
                className={`px-3 py-2 text-xs font-medium transition-colors flex items-center gap-0.5 ${
                  page === link
                    ? "text-green-800 font-bold border-b-2 border-green-700"
                    : "text-gray-600 hover:text-green-800 hover:bg-gray-50"
                }`}
                style={{ fontFamily: "Poppins,sans-serif" }}
              >
                {link}{link !== "Home" && <span className="text-gray-400 text-[9px]">▾</span>}
              </button>
            ))}
          </nav>

          {/* Investors CTA */}
          <button
            onClick={() => setPage("Investors")}
            className="ml-2 flex-shrink-0 px-4 py-2 rounded text-white text-xs font-bold flex items-center gap-1"
            style={{ background: "#1a5c2e", fontFamily: "Poppins,sans-serif" }}
          >
            Investors <span className="text-sm">↗</span>
          </button>
        </div>
      </header>

      {/* ── Main content — fixed height, all columns stretch ── */}
      <main className="max-w-[1400px] mx-auto w-full px-3 py-3">
        {/* 4-column row, fixed height so all panels fill equally */}
        <div className="flex gap-2" style={{ height: 600 }}>

          {/* ── Left column: ABOUT / ECOSYSTEM / SOLUTIONS ── */}
          <div className="flex flex-col gap-1.5" style={{ width: 202, flexShrink: 0 }}>
            <NavPanel
              headerColor="#1a5c2e"
              icon="👥"
              title="ABOUT"
              subtitle="Our identity, credibility and purpose."
              links={["Who We Are", "Our Story", "Vision & Mission", "Our Approach", "Founder & Team", "Our Values", "Why Uganda & Africa"]}
              flexGrow={1}
            />
            <NavPanel
              headerColor="#2a7a45"
              icon="🌿"
              title="ECOSYSTEM"
              subtitle="The real-world system we build and operate."
              links={["Indigenous Resources", "Producers & Communities", "Food & Nutrition", "Science & Quality", "Preventive Health", "Markets & Livelihoods", "Processing & Value Addition", "Partners"]}
              flexGrow={1}
            />
            <NavPanel
              headerColor="#f07920"
              icon="💡"
              title="SOLUTIONS"
              subtitle="Products, services and innovations for a healthier, more prosperous Africa."
              links={["Food Products & Ingredients", "Nutrition & Wellness Services", "B2B & Institutional Solutions", "Digital & AI Services", "Enterprise Solutions"]}
              flexGrow={1}
            />
          </div>

          {/* ── Center: heading + wheel ── */}
          <div className="flex-1 flex flex-col items-center min-w-0">
            <div className="text-center mb-1">
              <h1
                className="font-extrabold text-gray-800 text-xl leading-tight"
                style={{ fontFamily: "Poppins,sans-serif" }}
              >
                The EraWellness Integrated Ecosystem
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                From local resources to lasting impact — powered by people, science and technology.
              </p>
            </div>
            <div className="flex-1 w-full flex items-center justify-center" style={{ minHeight: 0 }}>
              <EcosystemWheel />
            </div>
          </div>

          {/* ── Right sub-columns ── */}
          <div className="flex gap-1.5" style={{ flexShrink: 0 }}>

            {/* EraWellness Pro / Impact / Contact */}
            <div className="flex flex-col gap-1.5" style={{ width: 192 }}>
              <NavPanel
                headerColor="#1a45a0"
                icon="⚙️"
                title="ERAWELLNESS PRO™"
                subtitle="The intelligence layer that connects, learns and scales the ecosystem."
                links={["Platform Overview", "AI & Data Intelligence", "Seven Platform Components", "Technology Roadmap", "Security & Trust", "Scalability"]}
                flexGrow={0.85}
              />
              <NavPanel
                headerColor="#2a68a8"
                icon="🎯"
                title="IMPACT"
                subtitle="Measurable outcomes for healthier people, stronger livelihoods and a resilient Africa."
                links={["Health & Wellbeing", "Food-System Transformation", "Producer Livelihoods", "Economic Resilience", "Science & Innovation", "Digital Impact", "Community Impact", "Environmental Resilience", "Partnerships", "Impact Measurement"]}
                flexGrow={1.3}
              />
              <NavPanel
                headerColor="#1a8a90"
                icon="✉️"
                title="CONTACT"
                subtitle="Get in touch, partner, invest or work with us."
                links={["Get in Touch", "Partner With Us", "Invest in Us", "Work With Us", "Products & Commercial", "Research & Innovation", "Media & Communications", "Location & Company Info"]}
                flexGrow={1.0}
              />
            </div>

            {/* Investors — single tall panel */}
            <div style={{ width: 188, flexShrink: 0, display: "flex", flexDirection: "column" }}>
              <div
                className="border border-gray-200 rounded-sm overflow-hidden flex flex-col"
                style={{ flex: "1 1 0", minHeight: 0 }}
              >
                {/* Header */}
                <div className="flex items-start gap-2 px-3 py-2 flex-shrink-0" style={{ background: "#1a5c2e" }}>
                  <span className="text-xl leading-none mt-0.5 flex-shrink-0">📈</span>
                  <div>
                    <div className="font-extrabold text-xs tracking-wider text-white"
                      style={{ fontFamily: "Poppins,sans-serif" }}>INVESTORS</div>
                    <div className="text-xs text-green-200 mt-0.5 leading-snug">
                      A scalable business with multiple revenue streams and measurable impact.
                    </div>
                  </div>
                </div>
                {/* Links */}
                <div className="flex flex-col flex-1 overflow-hidden">
                  {[
                    "Investment Overview", "The Company", "EraWellness Pro™", "Market Opportunity",
                    "Traction & Validation", "Business Model", "Competitive Advantage", "Growth & Scale",
                    "Impact & Measurement", "Investment Opportunity", "Investor Materials",
                    "Strategic Investors & Partners", "Founder & Leadership", "Investor Enquiries",
                  ].map((link) => (
                    <a
                      key={link}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="flex items-center justify-between px-3 text-xs text-gray-700 hover:bg-gray-50 hover:text-green-800 transition-colors flex-1 border-b border-gray-100 last:border-0"
                      style={{ minHeight: 0 }}
                    >
                      <span className="leading-tight py-0.5">{link}</span>
                      <span className="text-gray-400 flex-shrink-0 ml-1">›</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Value Chain ── */}
      <ValueChain />

      {/* ── Impact ── */}
      <ImpactSection />

      {/* ── Footer Tagline ── */}
      <FooterTagline />
    </div>
  );
}
