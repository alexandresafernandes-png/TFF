// ---------- Shared components for VILLAIN.OS ----------

// Geometric glyph icons (strokes only, no fills, 16px)
const Glyph = ({ name, size = 16, className = "" }) => {
  const s = size;
  const stroke = "currentColor";
  const sw = 1.25;
  const common = { width: s, height: s, viewBox: "0 0 16 16", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round", className };
  switch (name) {
    case "dashboard":
      return (<svg {...common}><rect x="2" y="2" width="5" height="5"/><rect x="9" y="2" width="5" height="3"/><rect x="9" y="7" width="5" height="7"/><rect x="2" y="9" width="5" height="5"/></svg>);
    case "search":
      return (<svg {...common}><circle cx="7" cy="7" r="4.2"/><path d="M10.3 10.3 L13.5 13.5"/></svg>);
    case "check":
      return (<svg {...common}><path d="M3 8.5l3 3 7-7"/></svg>);
    case "protocol":
      return (<svg {...common}><path d="M3 3h6l3 3v7H3z"/><path d="M9 3v3h3"/><path d="M5 8h5M5 10.5h4"/></svg>);
    case "leaf": // nutrition
      return (<svg {...common}><path d="M3 13c2-7 6-10 10-10 0 5-2 10-9 11-1 0-1.4-.4-1-1z"/><path d="M3.5 12.5 8 8"/></svg>);
    case "pill":
      return (<svg {...common}><rect x="2" y="6" width="12" height="4" rx="2" transform="rotate(-30 8 8)"/><path d="M5.8 5 10.2 11" /></svg>);
    case "drop":
      return (<svg {...common}><path d="M8 2c2 3 4 5 4 8a4 4 0 1 1-8 0c0-3 2-5 4-8z"/></svg>);
    case "cart":
      return (<svg {...common}><path d="M2 3h2l1.2 7.2a1 1 0 0 0 1 .8h5.6a1 1 0 0 0 1-.8L14 5H4.5"/><circle cx="6" cy="13" r="1"/><circle cx="12" cy="13" r="1"/></svg>);
    case "flask":
      return (<svg {...common}><path d="M6 2v4L3 12a1.5 1.5 0 0 0 1.4 2h7.2A1.5 1.5 0 0 0 13 12L10 6V2"/><path d="M5 2h6"/></svg>);
    case "note":
      return (<svg {...common}><rect x="3" y="2" width="10" height="12"/><path d="M5.5 5h5M5.5 7.5h5M5.5 10h3"/></svg>);
    case "plus": return (<svg {...common}><path d="M8 3v10M3 8h10"/></svg>);
    case "arrowUp": return (<svg {...common}><path d="M8 13V3M4 7l4-4 4 4"/></svg>);
    case "arrowDown": return (<svg {...common}><path d="M8 3v10M4 9l4 4 4-4"/></svg>);
    case "arrowRight": return (<svg {...common}><path d="M3 8h10M9 4l4 4-4 4"/></svg>);
    case "minus": return (<svg {...common}><path d="M3 8h10"/></svg>);
    case "chev": return (<svg {...common}><path d="M6 4l4 4-4 4"/></svg>);
    case "chevDown": return (<svg {...common}><path d="M4 6l4 4 4-4"/></svg>);
    case "dots": return (<svg {...common}><circle cx="3" cy="8" r="1"/><circle cx="8" cy="8" r="1"/><circle cx="13" cy="8" r="1"/></svg>);
    case "lock": return (<svg {...common}><rect x="3" y="7" width="10" height="7"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>);
    case "moon": return (<svg {...common}><path d="M13 9.5A5.5 5.5 0 1 1 6.5 3 4.5 4.5 0 0 0 13 9.5z"/></svg>);
    case "fire": return (<svg {...common}><path d="M8 2c1 3 4 4 4 7a4 4 0 1 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3 0-5 0-6z"/></svg>);
    case "target": return (<svg {...common}><circle cx="8" cy="8" r="5.5"/><circle cx="8" cy="8" r="2.5"/><circle cx="8" cy="8" r="0.6" fill="currentColor"/></svg>);
    case "spark": return (<svg {...common}><path d="M8 2v4M8 10v4M2 8h4M10 8h4"/></svg>);
    case "filter": return (<svg {...common}><path d="M2 4h12M4 8h8M6 12h4"/></svg>);
    case "x": return (<svg {...common}><path d="M3 3l10 10M13 3 3 13"/></svg>);
    case "command": return (<svg {...common}><rect x="3" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/><rect x="3" y="10" width="3" height="3"/><rect x="10" y="10" width="3" height="3"/><path d="M6 4.5h4M6 11.5h4M4.5 6v4M11.5 6v4"/></svg>);
    case "external": return (<svg {...common}><path d="M6 3H3v10h10v-3M9 3h4v4M13 3 8 8"/></svg>);
    case "calendar": return (<svg {...common}><rect x="2" y="3" width="12" height="11"/><path d="M2 6h12M5 2v3M11 2v3"/></svg>);
    case "tag": return (<svg {...common}><path d="M2 8V2h6l6 6-6 6z"/><circle cx="5" cy="5" r="1"/></svg>);
    case "book": return (<svg {...common}><path d="M3 2h7a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2z"/><path d="M3 12a2 2 0 0 1 2-2h7"/></svg>);
    case "clock": return (<svg {...common}><circle cx="8" cy="8" r="5.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>);
    case "warning": return (<svg {...common}><path d="M8 2 14 13H2z"/><path d="M8 6.5v3M8 11.5v.1"/></svg>);
    case "play": return (<svg {...common}><path d="M5 3v10l8-5z"/></svg>);
    case "bookmark": return (<svg {...common}><path d="M4 2h8v12l-4-3-4 3z"/></svg>);
    case "scale": return (<svg {...common}><path d="M2 4h12M8 4v9M5 13h6M5 4l-2.5 5a2.5 2 0 0 0 5 0z"/><path d="M11 4l-2.5 5a2.5 2 0 0 0 5 0z"/></svg>);
    default: return (<svg {...common}><circle cx="8" cy="8" r="5"/></svg>);
  }
};

// Status badge
const Badge = ({ kind = "na", children, dot = false }) => {
  const cls = { core: "badge-core", avoid: "badge-avoid", warn: "badge-warn", depends: "badge-depends", prep: "badge-prep", na: "badge-na" }[kind] || "badge-na";
  return (
    <span className={`badge ${cls}`}>
      {dot && <span className="dot" />}
      {children}
    </span>
  );
};

// Card frame — header strip now uses a softer body label, padding tokens unified
const Card = ({ children, className = "", title, action, label, hoverable = false, flush = false }) => (
  <div className={`card ${className} ${hoverable ? "hover:border-[#33333c] transition-colors" : ""}`}>
    {(title || label || action) && (
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b divider-soft min-h-[52px]">
        <div className="flex items-baseline gap-3 min-w-0">
          {label && <span className="label">{label}</span>}
          {title && <span className="text-[14px] text-[var(--text)] font-medium truncate">{title}</span>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={flush ? "" : ""}>{children}</div>
  </div>
);

// Stat block — big mono value with label
const Stat = ({ label, value, unit, sub, accent = false, trend }) => (
  <div className="px-5 py-4">
    <div className="label mb-2.5">{label}</div>
    <div className="flex items-baseline gap-1.5">
      <div className={`mono text-[28px] leading-none ${accent ? "text-[var(--accent)]" : "text-[var(--text)]"}`} style={{ fontWeight: 500 }}>{value}</div>
      {unit && <div className="mono text-[12px] text-[var(--text-3)]">{unit}</div>}
      {trend && (
        <div className={`mono text-[11px] ml-1 flex items-center gap-0.5 ${trend.dir === 'up' ? 'text-[var(--accent)]' : trend.dir === 'down' ? 'text-[var(--danger)]' : 'text-[var(--text-3)]'}`}>
          <Glyph name={trend.dir === 'up' ? 'arrowUp' : trend.dir === 'down' ? 'arrowDown' : 'minus'} size={11} />
          {trend.value}
        </div>
      )}
    </div>
    {sub && <div className="text-[12.5px] text-[var(--text-3)] mt-2 leading-relaxed">{sub}</div>}
  </div>
);

// Progress bar with label
const Progress = ({ value, max = 100, label, valueLabel }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      {(label || valueLabel) && (
        <div className="flex items-baseline justify-between mb-2">
          {label && <span className="label">{label}</span>}
          {valueLabel && <span className="mono text-[12px] text-[var(--text-2)]">{valueLabel}</span>}
        </div>
      )}
      <div className="bar-track">
        <div className="bar-fill" style={{ width: pct + "%" }} />
      </div>
    </div>
  );
};

// Tick / checkbox
const Tick = ({ on, onClick }) => (
  <button onClick={onClick} className="tick" data-on={on ? "true" : "false"} aria-pressed={on}>
    {on && <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5l2 2 4-4"/></svg>}
  </button>
);

// Sidebar
const NAV = [
  { key: "dashboard",  label: "Dashboard",           glyph: "dashboard", kbd: "1" },
  { key: "search",     label: "Knowledge Search",    glyph: "search",    kbd: "2" },
  { key: "checklist",  label: "Daily Checklist",     glyph: "check",     kbd: "3" },
  { key: "protocols",  label: "Protocols",           glyph: "protocol",  kbd: "4" },
  { key: "nutrition",  label: "Nutrition & Cooking", glyph: "leaf",      kbd: "5" },
  { key: "supplements",label: "Supplements",         glyph: "pill",      kbd: "6" },
  { key: "bloodwork",  label: "Bloodwork",           glyph: "drop",      kbd: "7" },
  { key: "shopping",   label: "Shopping List",       glyph: "cart",      kbd: "8" },
  { key: "experiments",label: "Experiments",         glyph: "flask",     kbd: "9" },
  { key: "notes",      label: "Notes",               glyph: "note",      kbd: "0" },
];

const Sidebar = ({ active, onNav }) => {
  return (
    <aside className="hidden md:flex flex-col w-[252px] shrink-0 panel border-r divider scan h-screen sticky top-0">
      {/* Brand */}
      <div className="px-6 pt-6 pb-5 border-b divider">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 relative flex items-center justify-center shrink-0">
            <div className="w-6 h-6 border" style={{ borderColor: "var(--accent)", transform: "rotate(45deg)" }} />
            <div className="w-2 h-2 absolute" style={{ background: "var(--accent)" }} />
          </div>
          <div className="leading-tight">
            <div className="mono text-[12px] tracking-[0.2em] text-[var(--text)]" style={{ fontWeight: 500 }}>VILLAIN.OS</div>
            <div className="mono text-[9.5px] tracking-[0.22em] text-[var(--text-4)] mt-1">v0.7 — PRIVATE BUILD</div>
          </div>
        </div>
      </div>

      {/* Operator */}
      <div className="px-6 py-4 border-b divider">
        <div className="label mb-2.5">Operator</div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm hairline flex items-center justify-center mono text-[12px] text-[var(--text)] shrink-0">K</div>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] text-[var(--text)] truncate" style={{ fontWeight: 500 }}>K. Vance</div>
            <div className="mono text-[10.5px] text-[var(--text-3)] tracking-wider mt-1">Cycle 047 · Day 12</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <div className="label px-6 mb-2 mt-1">Index</div>
        {NAV.map((n) => (
          <button
            key={n.key}
            data-active={active === n.key}
            onClick={() => onNav(n.key)}
            className="nav-item w-full flex items-center gap-3 pl-[22px] pr-5 text-[13px]"
            style={{ fontWeight: 450 }}
          >
            <span className="nav-glyph text-[var(--text-3)] shrink-0"><Glyph name={n.glyph} size={15} /></span>
            <span className="flex-1 text-left truncate">{n.label}</span>
            <span className="kbd shrink-0">{n.kbd}</span>
          </button>
        ))}

        <div className="label px-6 mb-2 mt-5">Flows</div>
        {[
          { key: 'flow-search',    label: 'Search Detail',    glyph: 'search' },
          { key: 'flow-bloodwork', label: 'Bloodwork Input',  glyph: 'drop' },
          { key: 'mobile',         label: 'Mobile Dashboard', glyph: 'command' },
          { key: 'onboarding',     label: 'Onboarding',       glyph: 'spark' },
          { key: 'states',         label: 'States Gallery',   glyph: 'filter' },
        ].map(n => (
          <button
            key={n.key}
            data-active={active === n.key}
            onClick={() => onNav(n.key)}
            className="nav-item w-full flex items-center gap-3 pl-[22px] pr-5 text-[13px]"
            style={{ fontWeight: 450 }}
          >
            <span className="nav-glyph text-[var(--text-3)] shrink-0"><Glyph name={n.glyph} size={15} /></span>
            <span className="flex-1 text-left truncate">{n.label}</span>
          </button>
        ))}

        <div className="label px-6 mb-2 mt-5">System</div>
        <button
          data-active={active === 'system'}
          onClick={() => onNav('system')}
          className="nav-item w-full flex items-center gap-3 pl-[22px] pr-5 text-[13px]"
          style={{ fontWeight: 450 }}
        >
          <span className="nav-glyph text-[var(--text-3)] shrink-0"><Glyph name="command" size={15} /></span>
          <span className="flex-1 text-left">Design System</span>
        </button>
      </nav>

      {/* Footer status */}
      <div className="border-t divider px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)", boxShadow: "0 0 0 3px rgba(155,211,74,0.12)" }} />
            <span className="mono text-[10px] tracking-[0.18em] text-[var(--text-2)]">SYSTEM ARMED</span>
          </div>
          <span className="mono text-[10px] text-[var(--text-3)]">04:21</span>
        </div>
        <div className="mt-2 mono text-[10px] text-[var(--text-4)] tracking-wider">Local only · No telemetry</div>
      </div>
    </aside>
  );
};

// Topbar
const Topbar = ({ title, crumb, right }) => (
  <header className="sticky top-0 z-10 panel border-b divider backdrop-blur-sm">
    <div className="flex items-center justify-between gap-4 px-8 py-4">
      <div className="min-w-0">
        <div className="label whitespace-nowrap overflow-hidden text-ellipsis">{crumb}</div>
        <h1 className="text-[20px] text-[var(--text)] tracking-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontWeight: 500 }}>{title}</h1>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        {right}
        <div className="mono text-[11px] text-[var(--text-2)] px-3 py-1.5 hairline sharp hidden xl:flex items-center gap-2 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span>BIOFEEDBACK · SYNCED</span>
        </div>
      </div>
    </div>
  </header>
);

// Section heading
const SectionHead = ({ kicker, title, action, sub }) => (
  <div className="flex items-end justify-between mb-5">
    <div>
      {kicker && <div className="label mb-2">{kicker}</div>}
      <div className="flex items-baseline gap-3">
        <h2 className="text-[16px] text-[var(--text)]" style={{ fontWeight: 500 }}>{title}</h2>
        {sub && <span className="mono text-[11px] text-[var(--text-3)]">{sub}</span>}
      </div>
    </div>
    {action}
  </div>
);

// Small KV row — NO uppercase, normal label
const KV = ({ k, v, mono = true, tone }) => (
  <div className="flex items-baseline justify-between gap-3 py-2 border-b divider-soft last:border-0">
    <span className="kv-label whitespace-nowrap">{k}</span>
    <span className={`${mono ? "mono " : ""}text-[13px] whitespace-nowrap font-medium ${tone === 'accent' ? 'text-[var(--accent)]' : tone === 'warn' ? 'text-[var(--warn)]' : tone === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--text)]'}`}>{v}</span>
  </div>
);

// Sparkline (12 points, hand-rolled)
const Spark = ({ points, height = 32, width = 120, color }) => {
  const c = color || "var(--accent)";
  const min = Math.min(...points), max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i * step).toFixed(1)} ${(height - ((p - min) / span) * height).toFixed(1)}`).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <path d={d} fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(points.length - 1) * step} cy={height - ((points[points.length - 1] - min) / span) * height} r="2.2" fill={c} />
    </svg>
  );
};

// Empty state
const Empty = ({ title, sub, action, glyph = "search" }) => (
  <div className="flex flex-col items-center justify-center text-center py-14 px-6">
    <div className="w-12 h-12 hairline sharp mb-4 flex items-center justify-center text-[var(--text-3)]">
      <Glyph name={glyph} size={20} />
    </div>
    <div className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>{title}</div>
    {sub && <div className="text-[13px] text-[var(--text-3)] mt-1.5 max-w-xs leading-relaxed">{sub}</div>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

// Loading skeleton
const Skeleton = ({ w = "100%", h = 14, className = "" }) => (
  <div className={`hairline-soft ${className}`} style={{ width: w, height: h, background: 'linear-gradient(90deg, #161619 0%, #1c1c20 50%, #161619 100%)', backgroundSize: '200% 100%', animation: 'skel 1.4s ease-in-out infinite' }} />
);

// Drawer — right-side slide-over
const Drawer = ({ open, onClose, title, label, children, footer, width = 480 }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Scrim */}
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      {/* Panel */}
      <div
        className="absolute top-0 right-0 bottom-0 panel border-l divider flex flex-col transition-transform duration-200 ease-out"
        style={{
          width,
          maxWidth: '100vw',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b divider gap-4">
          <div className="min-w-0">
            {label && <div className="label mb-1.5">{label}</div>}
            {title && <h2 className="text-[18px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{title}</h2>}
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text)] shrink-0 mt-1" aria-label="Close">
            <Glyph name="x" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t divider px-6 py-4 panel">{footer}</div>}
      </div>
    </div>
  );
};

// Modal — centered, smaller than drawer
const Modal = ({ open, onClose, title, label, children, footer, width = 560 }) => {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && open) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div onClick={onClose} className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} />
      <div className="relative card flex flex-col" style={{ width, maxWidth: '100%', maxHeight: '88vh' }}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b divider gap-4">
          <div className="min-w-0">
            {label && <div className="label mb-1.5">{label}</div>}
            {title && <h2 className="text-[18px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{title}</h2>}
          </div>
          <button onClick={onClose} className="text-[var(--text-3)] hover:text-[var(--text)] shrink-0 mt-1" aria-label="Close">
            <Glyph name="x" size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t divider px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
};

// Form input
const Field = ({ label, hint, children, error }) => (
  <div>
    <div className="flex items-baseline justify-between mb-2">
      <label className="text-[12.5px] text-[var(--text-2)]" style={{ fontWeight: 500 }}>{label}</label>
      {hint && <span className="mono text-[11px] text-[var(--text-3)]">{hint}</span>}
    </div>
    {children}
    {error && <div className="text-[11.5px] text-[var(--danger)] mt-1.5">{error}</div>}
  </div>
);

const Input = React.forwardRef(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    {...props}
    className={`w-full bg-[var(--card-2)] hairline-soft sharp px-3.5 py-2.5 text-[13.5px] text-[var(--text)] placeholder:text-[var(--text-4)] focus:border-[var(--accent-line)] transition-colors ${className}`}
  />
));

const Select = ({ value, onChange, options, className = "" }) => (
  <div className={`relative ${className}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none bg-[var(--card-2)] hairline-soft sharp px-3.5 py-2.5 text-[13.5px] text-[var(--text)] cursor-pointer"
    >
      {options.map(o => {
        const v = typeof o === 'object' ? o.value : o;
        const l = typeof o === 'object' ? o.label : o;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
    <Glyph name="chevDown" size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)] pointer-events-none" />
  </div>
);

const Textarea = ({ rows = 3, ...props }) => (
  <textarea
    {...props}
    rows={rows}
    className="w-full bg-[var(--card-2)] hairline-soft sharp px-3.5 py-2.5 text-[13.5px] text-[var(--text)] placeholder:text-[var(--text-4)] resize-none focus:border-[var(--accent-line)] transition-colors leading-relaxed"
  />
);

Object.assign(window, { Glyph, Badge, Card, Stat, Progress, Tick, Sidebar, Topbar, SectionHead, KV, Spark, Empty, Skeleton, Drawer, Modal, Field, Input, Select, Textarea, NAV });
