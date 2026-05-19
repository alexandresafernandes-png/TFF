// ============================================================
//  VILLAIN.OS — SCREENS v2
//  Refinement pass: bigger type, looser padding, uppercase only
//  for section headers/badges, uniform row heights for tables.
// ============================================================

/* ------------------------------------------------------------
   DASHBOARD
   ------------------------------------------------------------ */
const DashboardScreen = ({ goto }) => {
  return (
    <div className="px-8 py-7 stack-lg">

      {/* Quick search bar */}
      <div className="card">
        <div className="flex items-center gap-3 px-5 py-3.5">
          <Glyph name="search" size={15} className="text-[var(--text-3)]" />
          <input
            placeholder="Search food, supplement, protocol, marker…"
            className="flex-1 bg-transparent text-[14px] text-[var(--text)] placeholder:text-[var(--text-4)]"
          />
          <span className="kbd">⌘ K</span>
          <button onClick={() => goto('search')} className="btn btn-sm">Open Index</button>
        </div>
      </div>

      {/* Row 1 — score + checklist + focus stack */}
      <div className="grid grid-cols-12 gap-6">
        {/* Protocol Score */}
        <Card className="col-span-12 lg:col-span-5" label="Protocol Score · Today">
          <div className="px-6 py-6 flex items-center gap-6">
            <div className="relative shrink-0">
              <svg width="124" height="124" viewBox="0 0 124 124">
                <circle cx="62" cy="62" r="52" stroke="#1e1e24" strokeWidth="6" fill="none" />
                <circle cx="62" cy="62" r="52" stroke="var(--accent)" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  strokeDashoffset={`${2 * Math.PI * 52 * (1 - 0.78)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 62 62)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mono text-[36px] leading-none text-[var(--text)]" style={{ fontWeight: 500 }}>78</div>
                <div className="mono text-[11px] tracking-[0.18em] text-[var(--text-3)] mt-1.5">/ 100</div>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <KV k="Sleep adherence"   v="92%" tone="accent" />
              <KV k="Training load"     v="71%" />
              <KV k="Nutrition window"  v="84%" tone="accent" />
              <KV k="Supplement stack"  v="64%" tone="warn" />
              <KV k="Cognitive output"  v="80%" />
            </div>
          </div>
          <div className="px-6 py-3.5 border-t divider-soft flex items-center justify-between">
            <span className="text-[12.5px] text-[var(--text-3)]">7-day mean · <span className="mono text-[var(--text-2)]">73.4</span></span>
            <Spark points={[68, 72, 70, 74, 71, 75, 78]} width={120} height={28} />
          </div>
        </Card>

        {/* Daily Checklist */}
        <Card
          className="col-span-12 md:col-span-6 lg:col-span-4"
          label="Daily Checklist"
          action={
            <button onClick={() => goto('checklist')} className="text-[12.5px] text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1.5">
              Open <Glyph name="arrowRight" size={11} />
            </button>
          }
        >
          <div className="px-5 py-5 space-y-4">
            {[
              { k: "Morning",  done: 4, total: 4 },
              { k: "Training", done: 2, total: 3 },
              { k: "Evening",  done: 1, total: 4 },
              { k: "Sleep",    done: 0, total: 2 },
            ].map(r => (
              <div key={r.k}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-[13px] text-[var(--text)]" style={{ fontWeight: 500 }}>{r.k}</span>
                  <span className="mono text-[12px] text-[var(--text-2)]">{r.done}/{r.total}</span>
                </div>
                <Progress value={r.done} max={r.total} />
              </div>
            ))}
          </div>
        </Card>

        {/* Focus + Sleep target stack */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <Card label="Current Focus">
            <div className="px-5 py-5">
              <div className="text-[14px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>
                Reverse androgen suppression from cycle 046.
              </div>
              <div className="text-[12.5px] text-[var(--text-2)] mt-3 leading-relaxed">
                14-day testosterone recovery block. Zinc, boron, sleep priority, caffeine cap 200mg.
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Badge kind="core" dot>Core Block</Badge>
                <span className="mono text-[11px] text-[var(--text-3)]">D12 / D14</span>
              </div>
            </div>
          </Card>
          <Card label="Sleep Target">
            <div className="px-5 py-5 flex items-center gap-4">
              <Glyph name="moon" size={22} className="text-[var(--text-2)] shrink-0" />
              <div className="min-w-0">
                <div className="mono text-[18px] text-[var(--text)] leading-tight">22:30 → 06:15</div>
                <div className="text-[12px] text-[var(--text-3)] mt-1.5 leading-snug">7h 45m · Room &lt; 18°C · No blue</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Row 2 — next action / bloodwork / shopping */}
      <div className="grid grid-cols-12 gap-6">
        {/* Next Action */}
        <Card
          className="col-span-12 lg:col-span-4"
          label="Next Action"
          action={<Badge kind="warn" dot>In 14m</Badge>}
        >
          <div className="px-5 py-5">
            <div className="flex items-baseline gap-3">
              <div className="mono text-[24px] text-[var(--text)]" style={{ fontWeight: 500 }}>16:45</div>
              <div className="text-[14px] text-[var(--text-2)]">Pre-training stack</div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {[
                ['L-Citrulline', '6g'],
                ['Sodium', '1g'],
                ['Beta-Alanine', '3g'],
              ].map(([n, d]) => (
                <div key={n} className="hairline-soft sharp px-3 py-2.5">
                  <div className="text-[12.5px] text-[var(--text)]">{n}</div>
                  <div className="mono text-[11px] text-[var(--text-3)] mt-1">{d}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn btn-primary flex-1 justify-center">Mark Taken</button>
              <button className="btn">Skip</button>
            </div>
          </div>
        </Card>

        {/* Bloodwork */}
        <Card
          className="col-span-12 md:col-span-6 lg:col-span-4"
          label="Bloodwork"
          action={
            <button onClick={() => goto('bloodwork')} className="text-[12.5px] text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1.5">
              Panel <Glyph name="arrowRight" size={11} />
            </button>
          }
        >
          <div className="px-5 py-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--text-2)]">Next draw</span>
              <span className="mono text-[13px] text-[var(--text)]" style={{ fontWeight: 500 }}>D+9 · May 27</span>
            </div>
            {[
              { name: 'Total Testosterone', val: '486', unit: 'ng/dL · 300–1000', kind: 'warn', label: 'Low-normal' },
              { name: 'SHBG',               val: '32',  unit: 'nmol/L · 16–55',    kind: 'core', label: 'Optimal' },
            ].map(m => (
              <div key={m.name} className="hairline-soft sharp px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] text-[var(--text)]">{m.name}</span>
                  <Badge kind={m.kind}>{m.label}</Badge>
                </div>
                <div className="flex items-baseline gap-2 mt-2.5">
                  <span className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>{m.val}</span>
                  <span className="text-[12px] text-[var(--text-3)]">{m.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shopping priority */}
        <Card
          className="col-span-12 md:col-span-6 lg:col-span-4"
          label="Shopping · Priority"
          action={
            <button onClick={() => goto('shopping')} className="text-[12.5px] text-[var(--text-2)] hover:text-[var(--text)] flex items-center gap-1.5">
              List <Glyph name="arrowRight" size={11} />
            </button>
          }
        >
          <div className="divide-y divider-soft">
            {[
              { name: 'Grass-fed beef liver', tag: 'Core',  price: '$14', avail: 'Local butcher' },
              { name: 'Magnesium glycinate',  tag: 'Stack', price: '$28', avail: 'Pure Encaps' },
              { name: 'Pasture eggs (×30)',   tag: 'Core',  price: '$18', avail: 'Farm box' },
            ].map((r, i) => (
              <div key={i} className="row flex items-center gap-3 px-5 py-3.5 hover:bg-white/[.015]">
                <Tick on={false} />
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-[13px] text-[var(--text)] truncate">{r.name}</div>
                  <div className="text-[12px] text-[var(--text-3)] mt-1 truncate">{r.tag} · {r.avail}</div>
                </div>
                <div className="mono text-[13px] text-[var(--text-2)] shrink-0" style={{ fontWeight: 500 }}>{r.price}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3 — MED + Recently Indexed */}
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7 relative overflow-hidden" label="Minimum Effective Day">
          <div className="absolute inset-0 grid-faint pointer-events-none opacity-40" />
          <div className="px-6 py-6 relative">
            <div className="flex items-start justify-between gap-4 mb-5">
              <h3 className="text-[16px] text-[var(--text)] leading-snug max-w-md" style={{ fontWeight: 500 }}>
                If today goes sideways — do <span className="text-[var(--accent)]">only these five</span>.
              </h3>
              <Badge kind="depends">Fallback Mode</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              {[
                { n: '01', t: 'Sunlight',         s: '10 min · skin exposed' },
                { n: '02', t: 'Protein 1g/lb',    s: 'split across 3 meals' },
                { n: '03', t: 'Walk 30 min',      s: 'fasted or post-dinner' },
                { n: '04', t: 'Compound lift',    s: '20 working minutes' },
                { n: '05', t: 'Sleep 7h+',        s: 'cold, dark, dry' },
              ].map(b => (
                <div key={b.n} className="hairline sharp p-4 bg-[var(--card-2)]">
                  <div className="mono text-[10.5px] text-[var(--accent)] tracking-[0.2em]">{b.n}</div>
                  <div className="text-[13.5px] text-[var(--text)] mt-2" style={{ fontWeight: 500 }}>{b.t}</div>
                  <div className="text-[12px] text-[var(--text-3)] mt-1.5 leading-snug">{b.s}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card
          className="col-span-12 lg:col-span-5"
          label="Recently Indexed"
          action={<span className="text-[12px] text-[var(--text-3)]">14 sources</span>}
        >
          <div className="divide-y divider-soft">
            {[
              { title: 'The Hormone Manifesto',          kind: 'Ebook',       size: '312 pp', date: 'D-1' },
              { title: 'Wired Cold — Protocol Notes',    kind: 'Note',        size: '8 pp',   date: 'D-3' },
              { title: 'Carnivore Reset (D. Mero)',      kind: 'Ebook',       size: '187 pp', date: 'D-6' },
              { title: 'Sleep Architecture — Lectures',  kind: 'Transcript',  size: '42 pp',  date: 'D-9' },
            ].map((r, i) => (
              <div key={i} className="row flex items-center gap-3 px-5 py-3 hover:bg-white/[.015]">
                <Glyph name="book" size={15} className="text-[var(--text-3)] shrink-0" />
                <div className="flex-1 min-w-0 leading-tight">
                  <div className="text-[13px] text-[var(--text)] truncate">{r.title}</div>
                  <div className="text-[12px] text-[var(--text-3)] mt-1">{r.kind} · {r.size}</div>
                </div>
                <div className="mono text-[11px] text-[var(--text-3)] shrink-0">{r.date}</div>
                <Glyph name="chev" size={13} className="text-[var(--text-4)] shrink-0" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};


/* ------------------------------------------------------------
   KNOWLEDGE SEARCH
   ------------------------------------------------------------ */
const SEARCH_RESULTS = [
  {
    name: "Pasture-raised egg yolks", kind: "Food",
    status: "core", statusLabel: "Approved · Core",
    why: "Whole-food matrix of choline, retinol, B12, and the cholesterol substrate for hormone synthesis. Mero (ch.7) frames yolks as the single most underrated androgen support food.",
    sources: [{ title: "Carnivore Reset", page: "p.118–124" }, { title: "Hormone Manifesto", page: "p.61" }],
    tags: ["choline", "retinol", "androgen-substrate"],
  },
  {
    name: "Seed oils (canola, soy, sunflower)", kind: "Food",
    status: "avoid", statusLabel: "Avoid",
    why: "Linoleic acid load disrupts mitochondrial cardiolipin and suppresses thyroid output. Hard-zero outside accidental restaurant exposure.",
    sources: [{ title: "Metabolic Sabotage", page: "p.44" }],
    tags: ["pufa", "inflammation"],
  },
  {
    name: "Cold exposure", kind: "Protocol",
    status: "depends", statusLabel: "Depends",
    why: "Brown fat activation is real, but blunts hypertrophy if applied within 4h of resistance training. Stack on rest days or AM only.",
    sources: [{ title: "Wired Cold", page: "p.12" }],
    tags: ["thermogenesis", "context-sensitive"],
  },
  {
    name: "Liver (beef, weekly)", kind: "Food",
    status: "core", statusLabel: "Approved · Core",
    why: "100g per week covers retinol, copper, B12, riboflavin, and heme iron in food form. Soak in milk 4h to soften flavor.",
    sources: [{ title: "Carnivore Reset", page: "p.140" }],
    tags: ["organ-meat", "retinol", "copper"],
  },
  {
    name: "Ashwagandha (KSM-66)", kind: "Supplement",
    status: "prep", statusLabel: "Prep Required",
    why: "Cortisol-suppressing adaptogen with mixed effects on motivation in some operators. Cycle 6 weeks on / 2 weeks off. Hold during stimulant blocks.",
    sources: [{ title: "Adaptogen Protocols", page: "p.31" }],
    tags: ["cortisol", "cycling"],
  },
  {
    name: "Infrared sauna", kind: "Protocol",
    status: "warn", statusLabel: "Dose-Sensitive",
    why: "Heat shock proteins and growth hormone bumps, but EMF concerns with cheap units. 4× per week × 20min minimum effective.",
    sources: [{ title: "Heat Stress Index", page: "p.9" }],
    tags: ["hsp", "gh"],
  },
];

const SearchScreen = ({ goto }) => {
  const [q, setQ] = React.useState("egg yolks");
  const [filter, setFilter] = React.useState("all");
  const filtered = SEARCH_RESULTS.filter(r => filter === "all" || r.status === filter);

  return (
    <div className="px-8 py-7 stack-md">
      {/* Search bar */}
      <div className="card">
        <div className="flex items-center gap-3 px-6 py-5 border-b divider-soft">
          <Glyph name="search" size={18} className="text-[var(--accent)]" />
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Query the archive — food, supplement, protocol, marker, mechanism…"
            className="flex-1 bg-transparent text-[16px] text-[var(--text)] placeholder:text-[var(--text-4)]"
          />
          <span className="kbd">ESC</span>
        </div>
        <div className="px-6 py-3.5 flex items-center gap-2 flex-wrap">
          <span className="label mr-2">Filter</span>
          {[['all','All'],['core','Core'],['avoid','Avoid'],['depends','Depends'],['warn','Warn'],['prep','Prep']].map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} className={`badge ${filter === k ? 'badge-core' : ''}`}>
              {v}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-[12px] text-[var(--text-3)]">{filtered.length} of {SEARCH_RESULTS.length} matches · 14 sources scanned</span>
        </div>
      </div>

      {/* Synthesis card */}
      <Card label="Synthesis · From 3 sources">
        <div className="px-6 py-5">
          <p className="text-[14px] text-[var(--text)] leading-relaxed max-w-3xl">
            On <span className="text-[var(--accent)]">egg yolks</span>: corpus consensus is <strong className="text-[var(--text)]" style={{ fontWeight: 600 }}>approved core food</strong>. Mero positions them as the keystone of any androgen-recovery block. Manifesto specifies pasture-raised, 4–6 per day, soft yolks. Metabolic Sabotage adds the caveat that egg <em>whites</em> in excess bind biotin — eat the whole egg.
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="label mr-1">Cited</span>
            <Badge>Carnivore Reset · p.118</Badge>
            <Badge>Hormone Manifesto · p.61</Badge>
            <Badge>Metabolic Sabotage · p.77</Badge>
          </div>
        </div>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <Card><Empty title="No matches in archive" sub="Try a broader term, or check the filter row above." /></Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((r, i) => (
            <Card key={i} hoverable>
              <div className="px-6 py-5 border-b divider-soft">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <span className="label">{r.kind}</span>
                  <Badge kind={r.status} dot>{r.statusLabel}</Badge>
                </div>
                <h3 className="text-[17px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{r.name}</h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed">{r.why}</p>
                <div className="flex items-center gap-1.5 mt-4 flex-wrap">
                  {r.tags.map(t => (
                    <span key={t} className="mono text-[10.5px] text-[var(--text-3)] hairline-soft sharp px-2 py-1">#{t}</span>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t divider-soft">
                  <div className="label mb-2.5">Source</div>
                  <div className="space-y-1">
                    {r.sources.map((s, j) => (
                      <div key={j} className="flex items-center justify-between py-1">
                        <span className="text-[13px] text-[var(--text)]">{s.title}</span>
                        <span className="mono text-[12px] text-[var(--text-3)]">{s.page}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t divider-soft flex items-center gap-2">
                <button className="btn btn-ghost btn-sm"><Glyph name="check" size={12} /> Checklist</button>
                <button className="btn btn-ghost btn-sm"><Glyph name="cart" size={12} /> Shopping</button>
                <div className="flex-1" />
                <button onClick={() => goto('protocols')} className="btn btn-sm">Protocol <Glyph name="arrowRight" size={11} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};


/* ------------------------------------------------------------
   PROTOCOL DETAIL
   ------------------------------------------------------------ */
const ProtocolScreen = ({ goto }) => {
  const [tab, setTab] = React.useState("steps");
  const [active, setActive] = React.useState(true);

  const protocols = [
    { name: 'Androgen Recovery · 14D', cat: 'Hormonal',  prio: 'CORE', adv: true,  active: true  },
    { name: 'Deep Sleep Reset',        cat: 'Sleep',     prio: 'CORE', adv: false, active: false },
    { name: 'Cold Stack — AM',         cat: 'Thermal',   prio: 'OPT',  adv: false, active: false },
    { name: 'Carnivore Reset 30D',     cat: 'Nutrition', prio: 'CORE', adv: true,  active: false },
    { name: 'Mitochondrial Bath',      cat: 'Metabolic', prio: 'ADV',  adv: true,  active: false },
  ];

  return (
    <div className="px-8 py-7 grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-3 space-y-5">
        <Card label="Library" action={<span className="text-[12px] text-[var(--text-3)]">23 protocols</span>}>
          <div className="px-4 py-3 border-b divider-soft flex items-center gap-2">
            <Glyph name="search" size={13} className="text-[var(--text-3)]" />
            <input placeholder="Filter…" className="flex-1 bg-transparent text-[13px] text-[var(--text)] placeholder:text-[var(--text-4)]" />
          </div>
          <div className="divide-y divider-soft">
            {protocols.map((p, i) => (
              <button key={i} className={`w-full text-left px-5 py-3.5 hover:bg-white/[.015] ${p.active ? 'bg-white/[.018]' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.active ? 'bg-[var(--accent)]' : 'bg-[var(--text-4)]'}`} />
                  <span className="text-[11.5px] text-[var(--text-3)]">{p.cat}</span>
                  <div className="flex-1" />
                  {p.adv && <Badge kind="warn">ADV</Badge>}
                </div>
                <div className="text-[13px] text-[var(--text)] mt-2" style={{ fontWeight: 500 }}>{p.name}</div>
              </button>
            ))}
          </div>
        </Card>
      </aside>

      <main className="col-span-12 lg:col-span-9 space-y-6">
        <Card>
          <div className="px-7 pt-6 pb-5 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none grid-faint" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge kind="core" dot>Core</Badge>
                <Badge kind="warn">Advanced</Badge>
                <span className="text-[12px] text-[var(--text-3)]">Category · Hormonal</span>
                <div className="flex-1" />
                <span className="mono text-[11px] text-[var(--text-3)]">PROTO-014</span>
              </div>
              <h2 className="text-[28px] text-[var(--text)] tracking-tight leading-tight" style={{ fontWeight: 600 }}>
                Androgen Recovery — 14-Day Block
              </h2>
              <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-3xl leading-relaxed">
                Two-week reset for operators emerging from a cut, heavy training cycle, or sleep debt. Re-establishes baseline testosterone, SHBG, and free-T ratio. Built from Manifesto ch.6 and Mero ch.11. No exogenous compounds.
              </p>
              <div className="flex items-center gap-2 mt-5 flex-wrap">
                <button onClick={() => setActive(!active)} className={`btn ${active ? 'btn-danger' : 'btn-primary'}`}>
                  <Glyph name={active ? 'x' : 'play'} size={12} />
                  {active ? 'Abort Protocol' : 'Start Protocol'}
                </button>
                <button className="btn"><Glyph name="bookmark" size={12} /> Bookmark</button>
                <button className="btn btn-ghost"><Glyph name="external" size={12} /> Sources</button>
                <div className="flex-1" />
                {active && (
                  <div className="flex items-center gap-3">
                    <span className="text-[12.5px] text-[var(--text-3)]">Day 12 of 14</span>
                    <div style={{ width: 140 }}><Progress value={12} max={14} /></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-7 border-t divider flex items-center gap-7">
            {[['steps','Protocol'],['inputs','Inputs'],['signals','Signals'],['warn','Warnings']].map(([k, v]) => (
              <button key={k} className="tab" data-on={tab === k} onClick={() => setTab(k)}>{v}</button>
            ))}
          </div>
        </Card>

        {tab === 'steps' && (
          <div className="grid grid-cols-12 gap-6">
            <Card className="col-span-12 lg:col-span-8" label="Sequence · 14 days">
              <div className="divide-y divider-soft">
                {[
                  { d: 'D1–D3',  t: 'Cortisol drawdown',  items: ['Caffeine cap 150mg before 10:00', 'Walk 45min outdoors A.M.', 'Sleep window 22:00 → 06:00', 'Drop all stimulants after 12:00'] },
                  { d: 'D4–D7',  t: 'Substrate loading',  items: ['4 pasture egg yolks daily', '100g beef liver D5', 'Zinc 25mg with dinner', 'Boron 6mg with dinner', 'Sodium 4g, potassium 4g'] },
                  { d: 'D8–D11', t: 'Compound stimulus',  items: ['Heavy compound lift 3×/wk', 'Sprint 1×/wk', 'Sauna 4×/wk × 20min', 'Carb refeed D10 evening'] },
                  { d: 'D12–D14',t: 'Recovery + draw',    items: ['Sleep priority over training', 'Bloodwork draw A.M. D14', 'No alcohol, no THC', 'Journal subjective metrics'] },
                ].map((block, i) => (
                  <div key={i} className="px-6 py-5">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="mono text-[12px] text-[var(--accent)] tracking-[0.18em]">{block.d}</span>
                      <span className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>{block.t}</span>
                    </div>
                    <ul className="space-y-2">
                      {block.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-3 text-[13.5px] text-[var(--text-2)] leading-relaxed">
                          <span className="mono text-[11px] text-[var(--text-4)] mt-0.5 shrink-0">{String(j + 1).padStart(2, '0')}</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <div className="col-span-12 lg:col-span-4 space-y-5">
              <Card label="Required inputs">
                <div className="px-5 py-4 space-y-2.5">
                  {[
                    ['Pasture egg yolks',  '56 · 4/day'],
                    ['Beef liver',         '200g · 2×/wk'],
                    ['Zinc (picolinate)',  '14 × 25mg'],
                    ['Boron',              '14 × 6mg'],
                    ['Magnesium glycinate','14 × 400mg'],
                  ].map(([n, q]) => (
                    <div key={n} className="flex items-baseline justify-between gap-3 hairline-soft sharp px-3.5 py-2.5">
                      <span className="text-[13px] text-[var(--text)]">{n}</span>
                      <span className="mono text-[12px] text-[var(--text-3)]">{q}</span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t divider-soft">
                  <button className="btn w-full justify-center"><Glyph name="cart" size={12} /> Add all to shopping</button>
                </div>
              </Card>
              <Card label="Source">
                <div className="px-5 py-4 space-y-2.5">
                  {[
                    { t: 'Hormone Manifesto', p: 'Ch.6 · p.142–168' },
                    { t: 'Carnivore Reset (Mero)', p: 'Ch.11 · p.214–229' },
                  ].map(s => (
                    <div key={s.t} className="hairline-soft sharp px-3.5 py-3 hover:border-[var(--border)] cursor-pointer">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] text-[var(--text)]">{s.t}</span>
                        <Glyph name="external" size={12} className="text-[var(--text-3)]" />
                      </div>
                      <div className="mono text-[11.5px] text-[var(--text-3)] mt-1.5">{s.p}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {tab === 'inputs' && (
          <Card label="Operator inputs · Day 12">
            <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Sleep last night',     '7h 41m'],
                ['Resting HR',           '54 bpm'],
                ['HRV (rMSSD)',          '67 ms'],
                ['Body temp A.M.',       '36.7°C'],
                ['Bodyweight',           '83.4 kg'],
                ['Mood / drive',         '8 / 10'],
                ['Libido (subjective)',  '7 / 10'],
                ['Training RPE',         '7.5'],
              ].map(([k, v]) => (
                <div key={k} className="hairline-soft sharp px-4 py-3.5">
                  <div className="text-[12.5px] text-[var(--text-3)]">{k}</div>
                  <div className="mono text-[18px] text-[var(--text)] mt-2" style={{ fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'signals' && (
          <Card label="Signals · D1 → D12">
            <div className="px-6 py-5 space-y-3">
              {[
                { k: 'Morning erection frequency', v: '+260%', dir: 'up',   pts: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6] },
                { k: 'Subjective drive',           v: '+38%',  dir: 'up',   pts: [5, 5, 5, 6, 6, 6, 7, 7, 7, 7, 8, 8] },
                { k: 'Mid-day fatigue',            v: '−54%',  dir: 'down', pts: [7, 7, 6, 6, 5, 5, 4, 4, 4, 3, 3, 3] },
                { k: 'Sleep onset latency',        v: '−42%',  dir: 'down', pts: [22, 20, 19, 17, 15, 14, 12, 12, 11, 10, 10, 9] },
              ].map((row, i) => (
                <div key={i} className="flex items-center gap-4 hairline-soft sharp px-4 py-3">
                  <div className="flex-1 text-[13.5px] text-[var(--text)]">{row.k}</div>
                  <Spark points={row.pts} width={150} height={32} />
                  <div className={`mono text-[13.5px] w-16 text-right ${row.dir === 'up' || row.dir === 'down' ? 'text-[var(--accent)]' : 'text-[var(--text-2)]'}`} style={{ fontWeight: 500 }}>{row.v}</div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'warn' && (
          <Card label="Warnings · Read before starting">
            <div className="px-6 py-5 space-y-3">
              {[
                'Do not stack with ashwagandha — cortisol pathway conflict.',
                'Skip if febrile illness within last 72 hours.',
                'Bloodwork D14 must be drawn fasted, before 09:00.',
                'Halt protocol if RHR rises more than 8 bpm above 7-day mean.',
              ].map((w, i) => (
                <div key={i} className="flex items-start gap-3 hairline-soft sharp px-4 py-3" style={{ borderColor: 'rgba(232,177,74,0.25)' }}>
                  <Glyph name="warning" size={15} className="text-[var(--warn)] mt-0.5 shrink-0" />
                  <span className="text-[13.5px] text-[var(--text)]">{w}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};


/* ------------------------------------------------------------
   DAILY CHECKLIST
   ------------------------------------------------------------ */
const ChecklistScreen = () => {
  const [items, setItems] = React.useState({
    morning: [
      { t: 'Sunlight 10min · skin exposed',        prio: 'CORE',     done: true,  tag: 'Circadian' },
      { t: 'Hydrate 500ml + 1g sodium',            prio: 'CORE',     done: true,  tag: 'Hydration' },
      { t: 'Zinc + boron + magnesium',             prio: 'STACK',    done: true,  tag: 'Stack A' },
      { t: '4 egg yolks + sardines',               prio: 'CORE',     done: true,  tag: 'Nutrition' },
      { t: 'Cold finish · 90s',                    prio: 'OPT',      done: false, tag: 'Thermal' },
    ],
    training: [
      { t: 'Mobility 10min',                       prio: 'PREP',     done: true,  tag: 'Primer' },
      { t: 'Pre-stack: citrulline + sodium',       prio: 'STACK',    done: true,  tag: 'Stack B' },
      { t: 'Compound lift · 5×5 squat',            prio: 'CORE',     done: false, tag: 'Stimulus' },
      { t: 'Sauna 20min',                          prio: 'ADV',      done: false, tag: 'Post' },
    ],
    evening: [
      { t: 'Beef + organs · 800kcal',              prio: 'CORE',     done: true,  tag: 'Nutrition' },
      { t: 'Walk 30min post-meal',                 prio: 'CORE',     done: false, tag: 'Glycemic' },
      { t: 'Journal — D12 signals',                prio: 'PROTOCOL', done: false, tag: 'Log' },
      { t: 'No screens after 21:00',               prio: 'CORE',     done: false, tag: 'Circadian' },
    ],
    sleep: [
      { t: 'Room < 18°C, blackout',                prio: 'CORE',     done: false, tag: 'Environment' },
      { t: 'Apnea strap + mouth tape',             prio: 'CORE',     done: false, tag: 'Airway' },
    ],
  });

  const toggle = (group, idx) => {
    setItems(prev => ({
      ...prev,
      [group]: prev[group].map((it, i) => i === idx ? { ...it, done: !it.done } : it),
    }));
  };

  const groups = [
    { k: 'morning',  label: 'Morning',  time: '05:30 — 09:00' },
    { k: 'training', label: 'Training', time: '15:00 — 17:30' },
    { k: 'evening',  label: 'Evening',  time: '18:00 — 21:30' },
    { k: 'sleep',    label: 'Sleep',    time: '22:00 — 06:00' },
  ];

  const totalDone = Object.values(items).flat().filter(i => i.done).length;
  const total = Object.values(items).flat().length;
  const pct = Math.round((totalDone / total) * 100);

  return (
    <div className="px-8 py-7 stack-md">
      {/* Overall adherence */}
      <Card>
        <div className="px-6 py-5 flex items-center gap-8 flex-wrap">
          <div className="shrink-0">
            <div className="label mb-2">Total adherence</div>
            <div className="flex items-baseline gap-2">
              <span className="mono text-[32px] text-[var(--text)]" style={{ fontWeight: 500 }}>{pct}<span className="text-[16px] text-[var(--text-3)]">%</span></span>
              <span className="text-[12.5px] text-[var(--text-3)]">{totalDone}/{total} tasks</span>
            </div>
          </div>
          <div className="flex-1 min-w-[240px]">
            <Progress value={totalDone} max={total} />
            <div className="mt-3 flex items-center gap-5 flex-wrap">
              {groups.map(g => {
                const done = items[g.k].filter(i => i.done).length;
                return (
                  <div key={g.k} className="text-[12.5px] text-[var(--text-3)]">
                    <span className="text-[var(--text)]" style={{ fontWeight: 500 }}>{g.label}</span>
                    <span className="mono ml-2">{done}/{items[g.k].length}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="btn"><Glyph name="calendar" size={12} /> May 18</button>
            <button className="btn"><Glyph name="filter" size={12} /> Core only</button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {groups.map(g => (
          <Card
            key={g.k}
            label={g.label}
            action={<span className="mono text-[11.5px] text-[var(--text-3)]">{g.time}</span>}
          >
            <div className="divide-y divider-soft">
              {items[g.k].map((it, idx) => (
                <div key={idx} className={`row flex items-center gap-3.5 px-5 py-3 hover:bg-white/[.015] ${it.done ? 'opacity-55' : ''}`}>
                  <Tick on={it.done} onClick={() => toggle(g.k, idx)} />
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className={`text-[13.5px] ${it.done ? 'line-through decoration-1 text-[var(--text-2)]' : 'text-[var(--text)]'}`}>{it.t}</div>
                    <div className="text-[12px] text-[var(--text-3)] mt-1">{it.tag}</div>
                  </div>
                  <Badge kind={it.prio === 'CORE' ? 'core' : it.prio === 'ADV' ? 'warn' : 'na'}>{it.prio}</Badge>
                  <button className="text-[var(--text-4)] hover:text-[var(--text-2)] shrink-0"><Glyph name="dots" size={13} /></button>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 border-t divider-soft">
              <button className="text-[12.5px] text-[var(--text-3)] hover:text-[var(--text)] flex items-center gap-2">
                <Glyph name="plus" size={12} /> Add task
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};


/* ------------------------------------------------------------
   BLOODWORK
   ------------------------------------------------------------ */
const MARKERS = [
  { name: 'Total Testosterone', val: 486,  unit: 'ng/dL',  low: 300,  high: 1000, opt: [700, 950], trend: 'down', delta: '−42',  notes: 'Rebound expected post-cycle 046',                          pts: [610, 590, 560, 540, 510, 486] },
  { name: 'Free Testosterone',  val: 14.2, unit: 'pg/mL',  low: 8.7,  high: 25.1, opt: [18, 24],   trend: 'down', delta: '−2.1', notes: 'Tracks total T closely',                                    pts: [18, 17, 16.5, 15, 14.6, 14.2] },
  { name: 'SHBG',               val: 32,   unit: 'nmol/L', low: 16.5, high: 55.9, opt: [20, 35],   trend: 'flat', delta: '0',    notes: '',                                                          pts: [33, 32, 31, 32, 32, 32] },
  { name: 'Estradiol (E2)',     val: 28,   unit: 'pg/mL',  low: 7.6,  high: 42.6, opt: [20, 30],   trend: 'up',   delta: '+4',   notes: '',                                                          pts: [22, 23, 24, 25, 26, 28] },
  { name: 'LH',                 val: 4.1,  unit: 'IU/L',   low: 1.7,  high: 8.6,  opt: [4, 7],     trend: 'flat', delta: '+0.1', notes: '',                                                          pts: [4.2, 4.0, 4.1, 4.0, 4.0, 4.1] },
  { name: 'Cortisol (A.M.)',    val: 18.4, unit: 'µg/dL',  low: 6.2,  high: 19.4, opt: [10, 15],   trend: 'up',   delta: '+3.2', notes: 'High end — sleep deficit suspected',                        pts: [13, 14, 15, 16, 17, 18.4] },
  { name: 'Vitamin D, 25-OH',   val: 58,   unit: 'ng/mL',  low: 30,   high: 100,  opt: [50, 80],   trend: 'up',   delta: '+12',  notes: 'Sun exposure block working',                                pts: [38, 42, 46, 50, 54, 58] },
  { name: 'Ferritin',           val: 142,  unit: 'ng/mL',  low: 30,   high: 400,  opt: [80, 150],  trend: 'flat', delta: '+2',   notes: '',                                                          pts: [140, 141, 142, 141, 140, 142] },
  { name: 'hsCRP',              val: 0.6,  unit: 'mg/L',   low: 0,    high: 3.0,  opt: [0, 1],     trend: 'down', delta: '−0.2', notes: '',                                                          pts: [0.9, 0.8, 0.8, 0.7, 0.7, 0.6] },
  { name: 'HbA1c',              val: 5.2,  unit: '%',      low: 4,    high: 5.6,  opt: [4.5, 5.2], trend: 'flat', delta: '0',    notes: '',                                                          pts: [5.2, 5.2, 5.2, 5.2, 5.2, 5.2] },
];

const statusOf = (m) => {
  if (m.val < m.low || m.val > m.high) return 'avoid';
  if (m.val >= m.opt[0] && m.val <= m.opt[1]) return 'core';
  return 'warn';
};
const labelOf = (m) => ({ core: 'Optimal', avoid: 'Out of range', warn: 'Low-normal' }[statusOf(m)]);

const RangeBar = ({ m }) => {
  const range = m.high - m.low;
  const optStart = ((m.opt[0] - m.low) / range) * 100;
  const optEnd = ((m.opt[1] - m.low) / range) * 100;
  const pos = Math.max(0, Math.min(100, ((m.val - m.low) / range) * 100));
  return (
    <div className="relative h-2 bg-[#171719] hairline-soft sharp">
      <div className="absolute top-0 bottom-0"
           style={{ left: `${optStart}%`, width: `${optEnd - optStart}%`, background: 'var(--accent-soft)', borderLeft: '1px solid var(--accent-line)', borderRight: '1px solid var(--accent-line)' }} />
      <div className="absolute top-[-3px] bottom-[-3px] w-[2px]"
           style={{ left: `calc(${pos}% - 1px)`, background: statusOf(m) === 'core' ? 'var(--accent)' : statusOf(m) === 'avoid' ? 'var(--danger)' : 'var(--warn)' }} />
    </div>
  );
};

const BloodworkScreen = () => {
  const [selected, setSelected] = React.useState(0);
  const m = MARKERS[selected];

  return (
    <div className="px-8 py-7 stack-md">
      {/* Panel header */}
      <Card>
        <div className="px-6 py-5 flex items-center gap-6 flex-wrap">
          <div className="shrink-0">
            <div className="label mb-2">Latest panel</div>
            <div className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>May 04, 2026</div>
            <div className="text-[12px] text-[var(--text-3)] mt-1">Panel #14 · Quest · fasted 07:42</div>
          </div>
          <div className="h-14 w-px bg-[var(--border)]" />
          <div className="flex-1 grid grid-cols-4 gap-6 min-w-[280px]">
            <div>
              <div className="label mb-1.5">Markers</div>
              <div className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>{MARKERS.length} <span className="text-[11px] text-[var(--text-3)]">tracked</span></div>
            </div>
            <div>
              <div className="label mb-1.5">Optimal</div>
              <div className="mono text-[20px] text-[var(--accent)]" style={{ fontWeight: 500 }}>{MARKERS.filter(m => statusOf(m) === 'core').length}</div>
            </div>
            <div>
              <div className="label mb-1.5">Suboptimal</div>
              <div className="mono text-[20px] text-[var(--warn)]" style={{ fontWeight: 500 }}>{MARKERS.filter(m => statusOf(m) === 'warn').length}</div>
            </div>
            <div>
              <div className="label mb-1.5">Out of range</div>
              <div className="mono text-[20px] text-[var(--danger)]" style={{ fontWeight: 500 }}>{MARKERS.filter(m => statusOf(m) === 'avoid').length}</div>
            </div>
          </div>
          <button className="btn"><Glyph name="plus" size={12} /> Log panel</button>
        </div>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Markers table */}
        <Card
          className="col-span-12 xl:col-span-8"
          label="Markers"
          action={
            <button className="flex items-center gap-2 text-[12px] text-[var(--text-3)] hover:text-[var(--text)]">
              Sort · Status <Glyph name="chevDown" size={11} />
            </button>
          }
        >
          {/* Column headers — fixed grid */}
          <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4 label">Marker</div>
            <div className="col-span-2 label">Value</div>
            <div className="col-span-3 label">Range</div>
            <div className="col-span-1 label text-right">Trend</div>
            <div className="col-span-2 label text-right">Status</div>
          </div>
          <div>
            {MARKERS.map((m, i) => {
              const s = statusOf(m);
              return (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-full text-left grid grid-cols-12 gap-4 px-5 py-3.5 items-center border-b divider-soft last:border-0 hover:bg-white/[.015] ${selected === i ? 'bg-white/[.02]' : ''}`}
                  style={{ minHeight: 58 }}
                >
                  <div className="col-span-4 min-w-0">
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{m.name}</div>
                    <div className="mono text-[11px] text-[var(--text-3)] mt-1">{m.unit}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="mono text-[16px] text-[var(--text)]" style={{ fontWeight: 500 }}>{m.val}</span>
                  </div>
                  <div className="col-span-3"><RangeBar m={m} /></div>
                  <div className="col-span-1 flex items-center justify-end gap-1.5">
                    <Glyph name={m.trend === 'up' ? 'arrowUp' : m.trend === 'down' ? 'arrowDown' : 'minus'} size={12}
                           className={m.trend === 'up' ? 'text-[var(--accent)]' : m.trend === 'down' ? 'text-[var(--danger)]' : 'text-[var(--text-3)]'} />
                    <span className="mono text-[11.5px] text-[var(--text-2)]">{m.delta}</span>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Badge kind={s} dot>{labelOf(m)}</Badge>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Detail */}
        <Card className="col-span-12 xl:col-span-4" label="Marker · Detail">
          <div className="px-5 py-5">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="text-[16px] text-[var(--text)] leading-snug min-w-0 truncate" style={{ fontWeight: 500 }}>{m.name}</h3>
              <Badge kind={statusOf(m)} dot>{labelOf(m)}</Badge>
            </div>
            <div className="flex items-baseline gap-2 mt-3.5">
              <span className="mono text-[36px] text-[var(--text)] leading-none" style={{ fontWeight: 500 }}>{m.val}</span>
              <span className="mono text-[13px] text-[var(--text-3)]">{m.unit}</span>
              <span className={`mono text-[12px] ml-auto ${m.trend === 'up' ? 'text-[var(--accent)]' : m.trend === 'down' ? 'text-[var(--danger)]' : 'text-[var(--text-3)]'}`}>{m.delta} vs prior</span>
            </div>
            <div className="mt-4">
              <RangeBar m={m} />
              <div className="flex justify-between mt-2 mono text-[11px] text-[var(--text-3)]">
                <span>{m.low}</span>
                <span className="text-[var(--accent)]">{m.opt[0]} — {m.opt[1]}</span>
                <span>{m.high}</span>
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t divider-soft">
            <div className="label mb-3">6-panel history</div>
            <Spark points={m.pts} width={280} height={60} color="var(--accent)" />
            <div className="mt-2 mono text-[11px] text-[var(--text-3)] flex justify-between">
              <span>P14 · 6 mo</span>
              <span>P19 · now</span>
            </div>
          </div>
          {m.notes && (
            <div className="px-5 py-4 border-t divider-soft">
              <div className="label mb-2">Operator note</div>
              <div className="text-[13px] text-[var(--text-2)] leading-relaxed">{m.notes}</div>
            </div>
          )}
          <div className="px-5 py-3.5 border-t divider-soft flex gap-2">
            <button className="btn flex-1 justify-center"><Glyph name="protocol" size={12} /> Link protocol</button>
            <button className="btn"><Glyph name="note" size={12} /></button>
          </div>
        </Card>
      </div>
    </div>
  );
};


/* ------------------------------------------------------------
   NUTRITION / COOKING
   ------------------------------------------------------------ */
const MEALS = [
  { name: 'Bone marrow + sourdough',  tags: ['Core', 'Breakfast'], time: '12 min', cal: 640,  p: 28,  f: 48, c: 22, status: 'core',    why: 'Glycine + fat-soluble vitamins in a saturated matrix.' },
  { name: 'Beef heart, pan-seared',   tags: ['Core', 'Training'],  time: '14 min', cal: 580,  p: 62,  f: 28, c: 0,  status: 'core',    why: 'CoQ10-dense organ meat — pre-training fuel.' },
  { name: 'Sardines on rye',          tags: ['Quick'],             time: '4 min',  cal: 420,  p: 36,  f: 22, c: 18, status: 'core',    why: 'Omega-3, calcium, low-mercury small fish.' },
  { name: 'Liver + egg scramble',     tags: ['Core', 'Breakfast'], time: '11 min', cal: 510,  p: 38,  f: 32, c: 6,  status: 'core',    why: 'Retinol + choline keystone meal.' },
  { name: 'Lamb shoulder, slow',      tags: ['Evening'],           time: '4 hr',   cal: 920,  p: 78,  f: 64, c: 0,  status: 'depends', why: 'Heavy meal — reserve for D-9 onward recovery.' },
  { name: 'Carnivore loaded plate',   tags: ['MED'],               time: '18 min', cal: 1100, p: 102, f: 72, c: 0,  status: 'core',    why: 'Maximum effective single meal.' },
];

const NutritionScreen = () => {
  const [view, setView] = React.useState('grid');
  return (
    <div className="px-8 py-7 stack-md">
      {/* Macros + window */}
      <div className="grid grid-cols-12 gap-6">
        <Card
          className="col-span-12 xl:col-span-7"
          label="Today · Macros"
          action={
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-[var(--text-3)]">2 of 3 meals logged</span>
              <button className="btn btn-sm"><Glyph name="plus" size={12} /> Log meal</button>
            </div>
          }
        >
          <div className="px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { k: 'Calories', v: 1620, tgt: 2800, suffix: 'kcal' },
              { k: 'Protein',  v: 142,  tgt: 200,  suffix: 'g' },
              { k: 'Fat',      v: 88,   tgt: 160,  suffix: 'g' },
              { k: 'Carbs',    v: 42,   tgt: 80,   suffix: 'g' },
            ].map(s => (
              <div key={s.k} className="hairline-soft sharp px-4 py-4">
                <div className="text-[12.5px] text-[var(--text-3)] mb-2.5">{s.k}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="mono text-[24px] text-[var(--text)]" style={{ fontWeight: 500 }}>{s.v}</span>
                  <span className="mono text-[11.5px] text-[var(--text-3)]">/ {s.tgt} {s.suffix}</span>
                </div>
                <div className="mt-3"><Progress value={s.v} max={s.tgt} /></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="col-span-12 xl:col-span-5" label="Eating window">
          <div className="px-6 py-5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="mono text-[24px] text-[var(--text)]" style={{ fontWeight: 500 }}>10:00 — 18:00</span>
              <Badge kind="core" dot>In window</Badge>
            </div>
            <div className="mt-5 relative h-9 hairline-soft sharp overflow-hidden">
              <div className="absolute top-0 bottom-0 bg-[var(--accent-soft)]"
                   style={{ left: '41.6%', width: '33.3%', borderLeft: '1px solid var(--accent-line)', borderRight: '1px solid var(--accent-line)' }} />
              <div className="absolute top-0 bottom-0 w-px bg-[var(--accent)]" style={{ left: '58%' }} />
              {[0, 6, 12, 18, 24].map(h => (
                <div key={h} className="absolute top-0 bottom-0 mono text-[10px] text-[var(--text-4)] px-1.5 flex items-center"
                     style={{ left: `${(h / 24) * 100}%` }}>{String(h).padStart(2, '0')}</div>
              ))}
            </div>
            <div className="mt-4 text-[12.5px] text-[var(--text-3)]">Fasted 16h · last meal 17:48 prior day</div>
          </div>
        </Card>
      </div>

      {/* View tabs */}
      <div className="flex items-center gap-6 border-b divider px-1">
        {[['grid','Recipes'],['plan','Week Plan'],['library','Ingredient Library']].map(([k, v]) => (
          <button key={k} className="tab" data-on={view === k} onClick={() => setView(k)}>{v}</button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 pb-2">
          <button className="btn btn-ghost btn-sm"><Glyph name="filter" size={12} /> Filter</button>
          <button className="btn btn-ghost btn-sm"><Glyph name="search" size={12} /> Find</button>
        </div>
      </div>

      {view === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MEALS.map((m, i) => (
            <Card key={i} hoverable>
              <div className="relative h-36 overflow-hidden border-b divider-soft"
                   style={{ backgroundImage: 'repeating-linear-gradient(45deg, #18181c 0 6px, #141417 6px 12px)' }}>
                <div className="absolute inset-0 flex items-end p-3.5">
                  <span className="mono text-[10.5px] text-[var(--text-4)] tracking-[0.18em]">[ MEAL · 800×500 ]</span>
                </div>
                <div className="absolute top-3 right-3 flex gap-1.5">
                  {m.tags.map(t => <Badge key={t} kind={t === 'Core' ? 'core' : 'na'}>{t}</Badge>)}
                </div>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[14.5px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{m.name}</h3>
                  <span className="mono text-[11.5px] text-[var(--text-3)] shrink-0">{m.time}</span>
                </div>
                <p className="text-[12.5px] text-[var(--text-2)] mt-2 leading-relaxed">{m.why}</p>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[['kcal', m.cal], ['P', m.p + 'g'], ['F', m.f + 'g'], ['C', m.c + 'g']].map(([k, v]) => (
                    <div key={k} className="hairline-soft sharp px-2 py-2 text-center">
                      <div className="text-[10.5px] text-[var(--text-3)] uppercase tracking-wider">{k}</div>
                      <div className="mono text-[13px] text-[var(--text)] mt-1" style={{ fontWeight: 500 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-ghost btn-sm flex-1 justify-center"><Glyph name="cart" size={12} /> Shop</button>
                  <button className="btn btn-sm flex-1 justify-center"><Glyph name="play" size={12} /> Cook</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === 'plan' && (
        <Card label="7-Day Plan · Week 19">
          <div className="grid grid-cols-7 divide-x divider-soft">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
              <div key={d} className="px-4 py-4">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[12.5px] text-[var(--text-2)]" style={{ fontWeight: 500 }}>{d}</span>
                  <span className="mono text-[11px] text-[var(--text-3)]">{18 + i}</span>
                </div>
                <div className="space-y-2">
                  {(i % 2 === 0 ? ['Liver + egg', 'Beef heart', 'Bone marrow'] : ['Sardines', 'Lamb shoulder', 'Carnivore plate']).map((meal, j) => (
                    <div key={j} className="hairline-soft sharp px-2.5 py-2">
                      <div className="text-[10px] text-[var(--text-3)] uppercase tracking-wider">M{j+1}</div>
                      <div className="text-[12px] text-[var(--text)] mt-1 leading-tight">{meal}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 mono text-[11px] text-[var(--text-3)]">{2400 + (i*100)} kcal</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {view === 'library' && (
        <Card label="Ingredient Index" action={<span className="text-[12px] text-[var(--text-3)]">86 items</span>}>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-px bg-[var(--border-soft)]">
            {['Pasture eggs', 'Beef liver', 'Bone marrow', 'Sardines', 'Wild salmon', 'Lamb shoulder', 'Grass-fed beef', 'Raw milk', 'Sourdough rye', 'Sea salt', 'Honey, raw', 'Beef tallow'].map((n, i) => (
              <div key={i} className="bg-[var(--card)] px-4 py-4 hover:bg-white/[.018] cursor-pointer">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] text-[var(--text)]" style={{ fontWeight: 500 }}>{n}</span>
                  <Badge kind={i % 4 === 0 ? 'warn' : 'core'}>{i % 4 === 0 ? 'Depends' : 'Core'}</Badge>
                </div>
                <div className="text-[12px] text-[var(--text-3)] mt-2">{(i % 3) + 1} citations</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};


/* ------------------------------------------------------------
   SUPPLEMENTS
   ------------------------------------------------------------ */
const SupplementsScreen = () => (
  <div className="px-8 py-7 stack-md">
    <Card label="Active stacks">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--border-soft)]">
        {[
          { name: 'Stack A · Morning',         items: ['Zinc 25mg', 'Boron 6mg', 'Magnesium 400mg', 'Vitamin D3 5000IU + K2'], active: false },
          { name: 'Stack B · Pre-training',    items: ['L-Citrulline 6g', 'Beta-Alanine 3g', 'Sodium 1g', 'Caffeine 150mg'], active: false },
          { name: 'Stack C · Evening',         items: ['L-Theanine 200mg', 'Glycine 3g', 'Magnesium glycinate'], active: false },
          { name: 'Stack D · Cycle (active)',  items: ['Tongkat Ali 400mg', 'Boron extra 6mg', 'Liver 100g 2×/wk'], active: true },
        ].map((s, i) => (
          <div key={i} className="bg-[var(--card)] px-6 py-5">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <span className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>{s.name}</span>
              <Badge kind={s.active ? 'core' : 'na'} dot={s.active}>{s.active ? 'Active' : 'Standby'}</Badge>
            </div>
            <div className="space-y-2">
              {s.items.map(it => (
                <div key={it} className="flex items-center justify-between hairline-soft sharp px-3.5 py-2.5 hover:border-[var(--border)] cursor-pointer">
                  <span className="text-[13px] text-[var(--text)]">{it}</span>
                  <Glyph name="chev" size={11} className="text-[var(--text-4)]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);


/* ------------------------------------------------------------
   SHOPPING LIST
   ------------------------------------------------------------ */
const ShoppingScreen = () => {
  const [items, setItems] = React.useState([
    { n: 'Grass-fed beef liver', q: '500g',     p: 14, src: 'Local butcher', prio: 'Core',  got: false },
    { n: 'Pasture eggs',         q: '×30',      p: 18, src: 'Farm box',      prio: 'Core',  got: false },
    { n: 'Magnesium glycinate',  q: '120 caps', p: 28, src: 'Pure Encaps',   prio: 'Stack', got: true  },
    { n: 'Bone marrow',          q: '1kg',      p: 22, src: 'Local butcher', prio: 'Core',  got: false },
    { n: 'Sardines, wild',       q: '×6 tins',  p: 24, src: 'Pantry',        prio: 'Core',  got: false },
    { n: 'Tongkat Ali 200mg',    q: '60 caps',  p: 45, src: 'Kingsherb',     prio: 'Cycle', got: false },
    { n: 'Sea salt, coarse',     q: '500g',     p: 6,  src: 'Pantry',        prio: 'Core',  got: true  },
    { n: 'Pastured butter',      q: '500g',     p: 12, src: 'Farm box',      prio: 'Core',  got: false },
  ]);
  const toggle = (i) => setItems(prev => prev.map((it, j) => i === j ? { ...it, got: !it.got } : it));
  const pending = items.filter(i => !i.got);
  const got = items.filter(i => i.got);
  const total = items.reduce((s, i) => s + i.p, 0);

  return (
    <div className="px-8 py-7 stack-md">
      <Card>
        <div className="px-6 py-5 flex items-center gap-8 flex-wrap">
          <div>
            <div className="label mb-1.5">List total</div>
            <div className="mono text-[24px] text-[var(--text)]" style={{ fontWeight: 500 }}>${total}</div>
          </div>
          <div className="h-10 w-px bg-[var(--border)]" />
          <div>
            <div className="label mb-1.5">Items</div>
            <div className="flex items-baseline gap-2">
              <span className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>{pending.length}</span>
              <span className="text-[12.5px] text-[var(--text-3)]">pending · {got.length} bought</span>
            </div>
          </div>
          <div className="flex-1" />
          <button className="btn"><Glyph name="plus" size={12} /> Add item</button>
          <button className="btn btn-primary"><Glyph name="check" size={12} /> Mark all</button>
        </div>
      </Card>

      <Card label="Shopping · Cycle 047">
        {/* Column headers */}
        <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-4 items-center">
          <div className="col-span-1"></div>
          <div className="col-span-4 label">Item</div>
          <div className="col-span-2 label">Priority</div>
          <div className="col-span-3 label">Source</div>
          <div className="col-span-1 label text-right">Price</div>
          <div className="col-span-1"></div>
        </div>
        <div>
          {items.map((it, i) => (
            <div
              key={i}
              className={`grid grid-cols-12 gap-4 px-5 items-center border-b divider-soft last:border-0 hover:bg-white/[.015] ${it.got ? 'opacity-55' : ''}`}
              style={{ minHeight: 60 }}
            >
              <div className="col-span-1"><Tick on={it.got} onClick={() => toggle(i)} /></div>
              <div className="col-span-4 min-w-0 leading-tight">
                <div className={`text-[13.5px] truncate ${it.got ? 'line-through text-[var(--text-2)]' : 'text-[var(--text)]'}`} style={{ fontWeight: 500 }}>{it.n}</div>
                <div className="text-[12px] text-[var(--text-3)] mt-1">{it.q}</div>
              </div>
              <div className="col-span-2"><Badge kind={it.prio === 'Core' ? 'core' : 'na'}>{it.prio}</Badge></div>
              <div className="col-span-3 text-[13px] text-[var(--text-2)] truncate">{it.src}</div>
              <div className="col-span-1 mono text-[13.5px] text-[var(--text)] text-right" style={{ fontWeight: 500 }}>${it.p}</div>
              <div className="col-span-1 flex justify-end gap-2">
                <button className="text-[var(--text-4)] hover:text-[var(--text)]"><Glyph name="external" size={13} /></button>
                <button className="text-[var(--text-4)] hover:text-[var(--text)]"><Glyph name="dots" size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};


/* ------------------------------------------------------------
   EXPERIMENTS / NOTES
   ------------------------------------------------------------ */
const ExperimentsScreen = () => (
  <div className="px-8 py-7 stack-md">
    <Card label="Self-experiments · 5 active">
      <div className="divide-y divider-soft">
        {[
          { n: 'Boron 6→12mg titration',  day: 'D8 / D14',  metric: 'Free T',          hypo: 'Higher boron lowers SHBG without raising estradiol.',  status: 'core' },
          { n: 'Mouth-tape compliance',   day: 'D22 / D30', metric: 'HRV A.M.',        hypo: 'Nasal-only sleep raises HRV by ≥8%.',                  status: 'core' },
          { n: 'Zero-PUFA 30 days',       day: 'D12 / D30', metric: 'hsCRP',           hypo: 'CRP drops below 0.5 mg/L by D30.',                     status: 'warn' },
          { n: 'No-caffeine after 10:00', day: 'D4 / D14',  metric: 'Sleep latency',   hypo: 'Onset under 10 min consistently.',                     status: 'core' },
        ].map((e, i) => (
          <div key={i} className="px-6 py-5 hover:bg-white/[.015]">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <Badge kind={e.status} dot>{e.status === 'core' ? 'On track' : 'At risk'}</Badge>
              <span className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>{e.n}</span>
              <div className="flex-1" />
              <span className="mono text-[12px] text-[var(--text-3)]">{e.day}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="hairline-soft sharp px-4 py-3">
                <div className="label mb-2">Hypothesis</div>
                <div className="text-[13px] text-[var(--text-2)] leading-relaxed">{e.hypo}</div>
              </div>
              <div className="hairline-soft sharp px-4 py-3">
                <div className="label mb-2">Primary metric</div>
                <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{e.metric}</div>
              </div>
              <div className="hairline-soft sharp px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <div className="label mb-2">Trajectory</div>
                  <span className="mono text-[12px] text-[var(--accent)]">trending +</span>
                </div>
                <Spark points={[3, 4, 4, 5, 6, 6, 7]} width={90} height={28} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const NotesScreen = () => (
  <div className="px-8 py-7">
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 lg:col-span-3">
        <Card label="Notebooks">
          <div className="divide-y divider-soft">
            {['Cycle 047 Journal', 'Source · Hormone Manifesto', 'Source · Carnivore Reset', 'Operator log', 'Loose ideas'].map((n, i) => (
              <button key={i} className="row w-full text-left px-5 py-3 hover:bg-white/[.015] flex items-center gap-3">
                <Glyph name="book" size={14} className="text-[var(--text-3)] shrink-0" />
                <span className="flex-1 text-[13px] text-[var(--text)] truncate">{n}</span>
                <span className="mono text-[11px] text-[var(--text-3)] shrink-0">{i * 3 + 4}</span>
              </button>
            ))}
          </div>
        </Card>
      </aside>
      <Card className="col-span-12 lg:col-span-9" label="Cycle 047 · Day 12 — Subjective log">
        <div className="px-7 py-6">
          <div className="text-[14.5px] text-[var(--text)] leading-[1.75] space-y-4 max-w-3xl">
            <p>Sleep was clean. 7h 41m, latency under 8 minutes, no waking. Morning erection present and firm — first reliable sign the recovery block is working.</p>
            <p>Drive feels intact today. Walked the 45m loop before any caffeine. Stack A taken with whole eggs. Liver tonight per schedule. Skipping the cold finish — RHR ticked up 4 bpm yesterday and I want to give the nervous system room before D14.</p>
            <p>Caffeine cap held at 150mg, all before 10:00. Zero alcohol since D0. Sauna later, 20m, low temp.</p>
            <p className="text-[var(--accent)]">Hypothesis trending toward confirmation: boron + sleep priority + dropped stims = visible androgen recovery without exogenous compounds. Bloodwork D14 will decide.</p>
          </div>
          <div className="mt-6 pt-5 border-t divider-soft flex items-center gap-2 flex-wrap">
            <span className="label mr-2">Tagged</span>
            <Badge>#cycle-047</Badge>
            <Badge>#androgen-recovery</Badge>
            <Badge>#sleep</Badge>
            <Badge>#boron</Badge>
          </div>
        </div>
      </Card>
    </div>
  </div>
);


/* ------------------------------------------------------------
   DESIGN SYSTEM
   ------------------------------------------------------------ */
const DesignSystemScreen = () => {
  const colorSwatch = (name, val, sub) => (
    <div className="hairline-soft sharp overflow-hidden">
      <div style={{ background: val, height: 64 }} />
      <div className="px-4 py-3">
        <div className="text-[13px] text-[var(--text)]" style={{ fontWeight: 500 }}>{name}</div>
        <div className="mono text-[11.5px] text-[var(--text-3)] mt-1">{val}</div>
        {sub && <div className="text-[11.5px] text-[var(--text-3)] mt-1">{sub}</div>}
      </div>
    </div>
  );

  const tokenRow = (name, val, ex) => (
    <div className="row flex items-center gap-4 px-5 border-b divider-soft last:border-0" style={{ minHeight: 52 }}>
      <div className="w-32 mono text-[12.5px] text-[var(--text)]">{name}</div>
      <div className="w-24 mono text-[12px] text-[var(--text-3)]">{val}</div>
      <div className="flex-1 flex justify-end">{ex}</div>
    </div>
  );

  return (
    <div className="px-8 py-7 stack-lg">
      {/* Intro */}
      <Card>
        <div className="px-7 py-6">
          <div className="label mb-3">VILLAIN.OS · Design System v0.7</div>
          <h2 className="text-[24px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Tokens, primitives, and rules.</h2>
          <p className="text-[14px] text-[var(--text-2)] mt-3 max-w-2xl leading-relaxed">
            Calm, disciplined, tactical. Mono used only as a data layer — values, ranges, timestamps. Uppercase reserved for section markers and status badges. Color stays muted; the accent is signature, not decoration.
          </p>
        </div>
      </Card>

      {/* Colors */}
      <section>
        <SectionHead kicker="Tokens" title="Color" sub="muted, monochrome base, one signature accent" />
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
          {colorSwatch('Background',  '#0a0a0c', 'page')}
          {colorSwatch('Panel',       '#101013', 'sidebar / topbar')}
          {colorSwatch('Card',        '#141417', 'primary surface')}
          {colorSwatch('Card alt',    '#18181c', 'nested surface')}
          {colorSwatch('Border',      '#26262c', 'hairline')}
          {colorSwatch('Border soft', '#1c1c21', 'inner dividers')}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-3">
          {colorSwatch('Text',        '#ececef', 'primary')}
          {colorSwatch('Text 2',      '#b6b6bd', 'secondary body')}
          {colorSwatch('Text 3',      '#8a8a92', 'labels / meta')}
          {colorSwatch('Text 4',      '#5a5a62', 'hints only')}
          {colorSwatch('Accent',      '#9bd34a', 'toxic green')}
          {colorSwatch('Warn',        '#e8b14a', 'caution')}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3 mt-3">
          {colorSwatch('Danger',      '#c84545', 'avoid / out of range')}
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionHead kicker="Tokens" title="Typography" sub="Geist + JetBrains Mono" />
        <Card>
          <div className="divide-y divider-soft">
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="text-[28px] text-[var(--text)] leading-tight" style={{ fontWeight: 600 }}>Display · 28 / 600</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist · screen titles, hero headings</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">--t-display</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>H1 · 20 / 500 — screen heading</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist · topbar title</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">--t-h1</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="text-[16px] text-[var(--text)]" style={{ fontWeight: 500 }}>H2 · 16 / 500 — card titles and section heads</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">--t-h2</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>H3 · 14 / 500 — item titles and inline headers</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">--t-h3</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div className="max-w-md">
                <div className="text-[13.5px] text-[var(--text)] leading-relaxed">Body · 13.5 / 1.5 — descriptions, paragraph text, longer item copy. Two lines of body shown here to test rhythm and the readability of the chosen base size.</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist · body default</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)] shrink-0">--t-body</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="text-[12.5px] text-[var(--text-2)]">Small · 12.5 — secondary text, table cells, meta</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Geist</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">--t-small</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="label">LABEL · MONO 10.5 / 0.14EM</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">Section markers only — never used inline in sentences</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">.label</span>
            </div>
            <div className="px-7 py-5 flex items-baseline justify-between gap-6">
              <div>
                <div className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>486 ng/dL — 22:30 — 92%</div>
                <div className="text-[12.5px] text-[var(--text-3)] mt-2">JetBrains Mono · all data values</div>
              </div>
              <span className="mono text-[12px] text-[var(--text-3)]">.mono</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Spacing */}
      <section>
        <SectionHead kicker="Tokens" title="Spacing scale" sub="8pt base, used as gap / padding tokens" />
        <Card>
          {[
            ['--s-1', '4px',  4],
            ['--s-2', '8px',  8],
            ['--s-3', '12px', 12],
            ['--s-4', '16px', 16],
            ['--s-5', '20px', 20],
            ['--s-6', '24px', 24],
            ['--s-7', '32px', 32],
            ['--s-8', '40px', 40],
            ['--s-9', '56px', 56],
          ].map(([name, val, size]) => tokenRow(name, val, <div style={{ background: 'var(--accent)', width: size, height: 14 }} />))}
        </Card>
      </section>

      {/* Badges */}
      <section>
        <SectionHead kicker="Primitives" title="Status badges" sub="seven kinds — uppercase mono, hairline border, optional dot" />
        <Card>
          <div className="px-6 py-5 flex flex-wrap gap-3 items-center">
            <Badge kind="core" dot>Approved · Core</Badge>
            <Badge kind="avoid" dot>Avoid</Badge>
            <Badge kind="warn" dot>Dose-sensitive</Badge>
            <Badge kind="depends">Depends</Badge>
            <Badge kind="prep">Prep required</Badge>
            <Badge kind="na">Not mentioned</Badge>
            <Badge>Neutral / tag</Badge>
          </div>
        </Card>
      </section>

      {/* Buttons */}
      <section>
        <SectionHead kicker="Primitives" title="Buttons" sub="primary, default, ghost, danger — small + base" />
        <Card>
          <div className="px-6 py-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary">Mark Taken</button>
              <button className="btn">Default Action</button>
              <button className="btn btn-ghost">Ghost Action</button>
              <button className="btn btn-danger">Abort</button>
              <button className="btn"><Glyph name="plus" size={12} /> With icon</button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-primary btn-sm">Small Primary</button>
              <button className="btn btn-sm">Small Default</button>
              <button className="btn btn-ghost btn-sm">Small Ghost</button>
              <span className="kbd">⌘ K</span>
              <span className="kbd">ESC</span>
            </div>
          </div>
        </Card>
      </section>

      {/* Cards */}
      <section>
        <SectionHead kicker="Primitives" title="Card surface" sub="header strip with label + optional action; uniform 6px radius" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card label="Card label" action={<span className="text-[12px] text-[var(--text-3)]">Optional meta</span>}>
            <div className="px-5 py-5 space-y-3">
              <KV k="Sleep adherence" v="92%" tone="accent" />
              <KV k="Training load"   v="71%" />
              <KV k="Supplement stack" v="64%" tone="warn" />
            </div>
          </Card>
          <Card label="With body content">
            <div className="px-5 py-5">
              <h3 className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>Card heading</h3>
              <p className="text-[13.5px] text-[var(--text-2)] mt-2 leading-relaxed">
                Body paragraph uses the base body token. Secondary text drops one step on the text scale and uses --text-2 for sustained readability against the card surface.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Table example */}
      <section>
        <SectionHead kicker="Patterns" title="Table row · 56px min-height" sub="all list rows align to the same baseline" />
        <Card>
          <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-4 items-center">
            <div className="col-span-1"></div>
            <div className="col-span-5 label">Item</div>
            <div className="col-span-3 label">Tag</div>
            <div className="col-span-2 label">Status</div>
            <div className="col-span-1 label text-right">Value</div>
          </div>
          {[
            ['Item one example',   'Core',  'Optimal',     'core'],
            ['Item two example',   'Stack', 'In window',   'core'],
            ['Item three example', 'Cycle', 'At risk',     'warn'],
          ].map(([n, t, s, k], i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-5 items-center border-b divider-soft last:border-0 hover:bg-white/[.015]" style={{ minHeight: 56 }}>
              <div className="col-span-1"><Tick on={false} /></div>
              <div className="col-span-5 text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{n}</div>
              <div className="col-span-3 text-[13px] text-[var(--text-2)]">{t}</div>
              <div className="col-span-2"><Badge kind={k}>{s}</Badge></div>
              <div className="col-span-1 mono text-[13px] text-[var(--text)] text-right">100%</div>
            </div>
          ))}
        </Card>
      </section>

      {/* Empty state */}
      <section>
        <SectionHead kicker="Patterns" title="Empty states" sub="quiet by default — never decorative" />
        <Card><Empty title="No results yet" sub="Ingest a source or run a search to populate this view." action={<button className="btn btn-primary">Open Index</button>} /></Card>
      </section>

      {/* Responsive */}
      <section>
        <SectionHead kicker="Behavior" title="Responsive" sub="desktop-first, mobile compresses to single column" />
        <Card>
          <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { b: '< 768px',  d: 'Sidebar hidden behind a tap target. Stack everything to single column. Padding drops to 20px.' },
              { b: '768–1280', d: 'Sidebar visible. Dashboard grids collapse to 2 columns where possible. Tables become scroll containers.' },
              { b: '> 1280px', d: 'Full 12-column dashboard. Tables fully expanded. Detail panels sit side-by-side with their tables.' },
            ].map(b => (
              <div key={b.b} className="hairline-soft sharp px-4 py-4">
                <div className="mono text-[12px] text-[var(--accent)] tracking-wider">{b.b}</div>
                <div className="text-[13px] text-[var(--text-2)] mt-2 leading-relaxed">{b.d}</div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
};

Object.assign(window, {
  DashboardScreen, SearchScreen, ProtocolScreen, ChecklistScreen,
  BloodworkScreen, NutritionScreen, SupplementsScreen, ShoppingScreen,
  ExperimentsScreen, NotesScreen, DesignSystemScreen,
});
