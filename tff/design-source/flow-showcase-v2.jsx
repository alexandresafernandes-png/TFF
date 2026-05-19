// ============================================================
//  VILLAIN.OS — FLOW SHOWCASES v2
//  1. Knowledge Search Detail (desktop drawer + mobile sheet)
//  2. Bloodwork Input Flow (empty → input → summary)
// ============================================================

/* ============================================================
   SHARED — Knowledge detail content
   ============================================================ */
const KNOWLEDGE_ITEM = {
  name: 'Pasture-raised egg yolks',
  kind: 'Food',
  status: 'core',
  statusLabel: 'APPROVED_CORE',
  why: 'Whole-food matrix of choline, retinol, B12, and the cholesterol substrate for hormone synthesis. Mero (ch.7) frames yolks as the single most underrated androgen support food.',
  mechanism: 'Provides the cholesterol substrate the body uses to rebuild steroidogenic membranes and hormone precursors. The retinol + choline pairing accelerates phospholipid turnover. Bioavailability outpaces isolated supplement equivalents by 3–8× depending on the marker measured.',
  howToUse: [
    'Source pasture-raised or true-soy-free.',
    '4–6 yolks daily, soft cooked. Whites optional — biotin-binding effect at high volume.',
    'Pair with a salt source. Skip when fasted morning protocol is in effect.',
    'Track HRV and morning erection frequency across a 14-day run.',
  ],
  sources: [
    { title: 'Carnivore Reset',     page: 'ch.7 · p.118–124' },
    { title: 'Hormone Manifesto',   page: 'ch.4 · p.61' },
    { title: 'Metabolic Sabotage',  page: 'ch.5 · p.77' },
  ],
  related: [
    'Androgen Recovery · 14D',
    'Carnivore Reset 30D',
    'Choline Loading · 5D',
  ],
  tags: ['choline', 'retinol', 'androgen-substrate', 'whole-food'],
};

const KnowledgeDetailBody = ({ item }) => (
  <div className="space-y-5">
    <div className="flex items-center gap-2 flex-wrap">
      <Badge kind={item.status} dot>{item.statusLabel}</Badge>
      <span className="text-[12.5px] text-[var(--text-3)]">{item.kind} · 3 sources</span>
    </div>

    <div>
      <div className="label mb-2">Why</div>
      <p className="text-[13.5px] text-[var(--text)] leading-relaxed">{item.why}</p>
    </div>

    <div>
      <div className="label mb-2">Mechanism</div>
      <p className="text-[13.5px] text-[var(--text-2)] leading-relaxed">{item.mechanism}</p>
    </div>

    <div>
      <div className="label mb-2">How to use</div>
      <ul className="space-y-2">
        {item.howToUse.map((step, i) => (
          <li key={i} className="flex items-start gap-3 text-[13px] text-[var(--text)]">
            <span className="mono text-[11px] text-[var(--text-4)] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
            <span className="leading-relaxed">{step}</span>
          </li>
        ))}
      </ul>
    </div>

    <div>
      <div className="label mb-2">Source references</div>
      <div className="space-y-2">
        {item.sources.map((s, j) => (
          <div key={j} className="hairline-soft sharp px-4 py-3 flex items-center justify-between gap-3 hover:border-[var(--border)] cursor-pointer">
            <div className="min-w-0">
              <div className="text-[13px] text-[var(--text)] truncate" style={{ fontWeight: 500 }}>{s.title}</div>
              <div className="mono text-[11.5px] text-[var(--text-3)] mt-1">{s.page}</div>
            </div>
            <Glyph name="external" size={13} className="text-[var(--text-3)] shrink-0" />
          </div>
        ))}
      </div>
    </div>

    <div>
      <div className="label mb-2">Related protocols</div>
      <div className="space-y-2">
        {item.related.map(p => (
          <button key={p} className="w-full hairline-soft sharp px-4 py-3 flex items-center justify-between gap-3 hover:border-[var(--border)]">
            <div className="flex items-center gap-3 min-w-0">
              <Glyph name="protocol" size={13} className="text-[var(--text-3)] shrink-0" />
              <span className="text-[13px] text-[var(--text)] truncate">{p}</span>
            </div>
            <Glyph name="chev" size={12} className="text-[var(--text-4)] shrink-0" />
          </button>
        ))}
      </div>
    </div>

    <div>
      <div className="label mb-2">Tags</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        {item.tags.map(t => (
          <span key={t} className="mono text-[10.5px] text-[var(--text-3)] hairline-soft sharp px-2 py-1">#{t}</span>
        ))}
      </div>
    </div>
  </div>
);

const detailActions = (
  <div className="flex items-center gap-2">
    <button className="btn btn-ghost btn-sm flex-1 justify-center"><Glyph name="check" size={12} /> Checklist</button>
    <button className="btn btn-ghost btn-sm flex-1 justify-center"><Glyph name="cart" size={12} /> Shopping</button>
    <button className="btn btn-primary btn-sm flex-1 justify-center">View Protocol</button>
  </div>
);


/* ============================================================
   1 · KNOWLEDGE SEARCH DETAIL — desktop + mobile showcase
   ============================================================ */
const SearchDetailFlow = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const item = KNOWLEDGE_ITEM;

  return (
    <div className="px-8 py-7 stack-md">
      {/* Intro */}
      <Card>
        <div className="px-6 py-5">
          <div className="label mb-1.5">Flow · 01</div>
          <h2 className="text-[24px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Knowledge Search Detail</h2>
          <p className="text-[13.5px] text-[var(--text-2)] mt-2 max-w-2xl leading-relaxed">
            Same payload, two surfaces. On desktop it slides in as a right-side drawer over the result grid; on mobile it takes the full screen as a sheet that pushes up from below.
          </p>
        </div>
      </Card>

      {/* Desktop preview */}
      <section>
        <SectionHead kicker="Desktop · ≥ 768px" title="Right-side drawer" sub="480px · ESC + scrim to close" action={
          <button onClick={() => setDrawerOpen(true)} className="btn btn-sm"><Glyph name="play" size={11} /> Open drawer</button>
        } />

        <Card>
          <div className="relative" style={{ height: 640, overflow: 'hidden' }}>
            {/* Faux desktop background — the result grid */}
            <div className="absolute inset-0 grid grid-cols-2 gap-4 p-5 pointer-events-none" style={{ background: 'var(--bg)' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="card opacity-60">
                  <div className="px-5 py-4 border-b divider-soft">
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="label">FOOD</span>
                      <Badge kind={i === 0 ? 'core' : i === 1 ? 'avoid' : i === 2 ? 'depends' : 'warn'}>
                        {i === 0 ? 'Core' : i === 1 ? 'Avoid' : i === 2 ? 'Depends' : 'Warn'}
                      </Badge>
                    </div>
                    <h3 className="text-[15px] text-[var(--text)]" style={{ fontWeight: 500 }}>
                      {['Pasture egg yolks', 'Seed oils', 'Cold exposure', 'Infrared sauna'][i]}
                    </h3>
                  </div>
                  <div className="px-5 py-4">
                    <div className="space-y-1.5">
                      <Skeleton w="100%" h={10} />
                      <Skeleton w="92%" h={10} />
                      <Skeleton w="78%" h={10} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Inline drawer panel — always visible to demonstrate, not a real overlay */}
            <div className="absolute top-0 right-0 bottom-0 panel border-l divider flex flex-col" style={{ width: 480 }}>
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b divider gap-4">
                <div className="min-w-0">
                  <div className="label mb-1.5">{item.kind}</div>
                  <h2 className="text-[18px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{item.name}</h2>
                </div>
                <button className="text-[var(--text-3)] hover:text-[var(--text)] shrink-0 mt-1"><Glyph name="x" size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <KnowledgeDetailBody item={item} />
              </div>
              <div className="border-t divider px-6 py-4 panel">
                {detailActions}
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Mobile preview */}
      <section>
        <SectionHead kicker="Mobile · < 768px" title="Full-screen sheet" sub="100% width · swipe-down or back to dismiss" />

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Phone frame with the sheet */}
          <div className="phone shrink-0 mx-auto xl:mx-0">
            <div className="h-full flex flex-col" style={{ background: 'var(--bg)' }}>
              {/* Mobile status bar */}
              <div className="h-12 flex items-center justify-between px-6 pt-1 shrink-0">
                <span className="mono text-[11px] text-[var(--text)]">09:41</span>
                <div className="flex items-center gap-1.5 text-[var(--text)]">
                  <span className="mono text-[10px]">5G</span>
                  <span className="w-4 h-2 hairline-soft sharp" style={{ background: 'var(--text)' }} />
                </div>
              </div>

              {/* Mobile sheet header — sticky */}
              <div className="panel border-b divider px-5 pt-3 pb-4 shrink-0">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <button className="w-9 h-9 hairline sharp flex items-center justify-center text-[var(--text-2)]">
                    <Glyph name="chev" size={13} className="rotate-180" />
                  </button>
                  <div className="flex-1 text-center pt-1.5">
                    <div className="mono text-[9.5px] text-[var(--text-3)] tracking-[0.18em]">SEARCH · DETAIL</div>
                  </div>
                  <button className="w-9 h-9 hairline sharp flex items-center justify-center text-[var(--text-2)]">
                    <Glyph name="dots" size={13} />
                  </button>
                </div>
                <div className="label mb-1.5">{item.kind}</div>
                <h2 className="text-[18px] text-[var(--text)] leading-snug" style={{ fontWeight: 500 }}>{item.name}</h2>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Badge kind={item.status} dot>{item.statusLabel}</Badge>
                </div>
              </div>

              {/* Mobile body — scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4 pb-32">
                <div className="space-y-4">
                  <div>
                    <div className="label mb-1.5">Why</div>
                    <p className="text-[13px] text-[var(--text)] leading-relaxed">{item.why}</p>
                  </div>

                  <div>
                    <div className="label mb-1.5">Mechanism</div>
                    <p className="text-[13px] text-[var(--text-2)] leading-relaxed">{item.mechanism}</p>
                  </div>

                  <div>
                    <div className="label mb-2">How to use</div>
                    <ul className="space-y-2">
                      {item.howToUse.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-[var(--text)]">
                          <span className="mono text-[10.5px] text-[var(--text-4)] mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="label mb-2">Sources</div>
                    <div className="space-y-2">
                      {item.sources.slice(0, 2).map((s, j) => (
                        <div key={j} className="hairline-soft sharp px-3 py-2.5 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-[12.5px] text-[var(--text)] truncate" style={{ fontWeight: 500 }}>{s.title}</div>
                            <div className="mono text-[11px] text-[var(--text-3)] mt-0.5">{s.page}</div>
                          </div>
                          <Glyph name="external" size={12} className="text-[var(--text-3)]" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="label mb-2">Related</div>
                    <div className="space-y-2">
                      {item.related.slice(0, 2).map(p => (
                        <button key={p} className="w-full hairline-soft sharp px-3 py-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Glyph name="protocol" size={12} className="text-[var(--text-3)] shrink-0" />
                            <span className="text-[12.5px] text-[var(--text)] truncate">{p}</span>
                          </div>
                          <Glyph name="chev" size={11} className="text-[var(--text-4)]" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile sticky footer — actions */}
              <div className="absolute left-0 right-0 bottom-0 panel border-t divider px-4 pt-3 pb-6">
                <div className="grid grid-cols-3 gap-2">
                  <button className="btn btn-ghost btn-sm flex flex-col items-center gap-1 py-2" style={{ height: 'auto' }}>
                    <Glyph name="check" size={14} />
                    <span className="text-[10px]">Checklist</span>
                  </button>
                  <button className="btn btn-ghost btn-sm flex flex-col items-center gap-1 py-2" style={{ height: 'auto' }}>
                    <Glyph name="cart" size={14} />
                    <span className="text-[10px]">Shopping</span>
                  </button>
                  <button className="btn btn-primary btn-sm flex flex-col items-center gap-1 py-2" style={{ height: 'auto' }}>
                    <Glyph name="protocol" size={14} />
                    <span className="text-[10px]">Protocol</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile design notes */}
          <Card className="flex-1 w-full" label="Mobile sheet · Design notes">
            <div className="px-6 py-5 space-y-4">
              {[
                { k: 'Surface',     v: 'Pushes up from bottom on enter. Takes 100% of viewport — no peek-through. Status bar stays system; sheet starts below it.' },
                { k: 'Header',      v: 'Sticky. Back arrow left, overflow dots right, breadcrumb centered. Title + status badge sit in the same sticky region so they survive scroll.' },
                { k: 'Body',        v: 'Single column, 13px body. Three deepest sections (Why / Mechanism / How to use) lead; sources and related collapse to compact rows.' },
                { k: 'Actions',     v: 'Bottom-fixed bar with three icon-and-label buttons. Primary (Protocol) is full-color; the other two are ghost. 56px tap height including safe-area inset.' },
                { k: 'Dismissal',   v: 'Hardware back, swipe-down on header, or scroll-past-top elastic. ESC equivalent unused on mobile.' },
                { k: 'Empty rels',  v: 'When no related protocols exist, the section collapses entirely — never shown empty.' },
              ].map(n => (
                <div key={n.k} className="hairline-soft sharp px-4 py-3.5">
                  <div className="label mb-1.5">{n.k}</div>
                  <div className="text-[13.5px] text-[var(--text)] leading-relaxed">{n.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Live drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        label={item.kind}
        title={item.name}
        footer={detailActions}
      >
        <div className="px-6 py-5">
          <KnowledgeDetailBody item={item} />
        </div>
      </Drawer>
    </div>
  );
};


/* ============================================================
   2 · BLOODWORK INPUT FLOW — empty → input → summary
   ============================================================ */
const BLOODWORK_TEMPLATE = [
  { name: 'Total Testosterone', unit: 'ng/dL',  ref: '300–1000', opt: '700–950',  refLow: 300, refHigh: 1000, optLow: 700, optHigh: 950 },
  { name: 'Free Testosterone',  unit: 'pg/mL',  ref: '8.7–25.1', opt: '18–24',    refLow: 8.7, refHigh: 25.1, optLow: 18,  optHigh: 24 },
  { name: 'SHBG',               unit: 'nmol/L', ref: '16.5–55.9',opt: '20–35',    refLow: 16.5,refHigh: 55.9, optLow: 20,  optHigh: 35 },
  { name: 'Estradiol (E2)',     unit: 'pg/mL',  ref: '7.6–42.6', opt: '20–30',    refLow: 7.6, refHigh: 42.6, optLow: 20,  optHigh: 30 },
  { name: 'Cortisol (A.M.)',    unit: 'µg/dL',  ref: '6.2–19.4', opt: '10–15',    refLow: 6.2, refHigh: 19.4, optLow: 10,  optHigh: 15 },
  { name: 'Vitamin D, 25-OH',   unit: 'ng/mL',  ref: '30–100',   opt: '50–80',    refLow: 30,  refHigh: 100,  optLow: 50,  optHigh: 80 },
];

const MiniRangeBar = ({ m, val }) => {
  const range = m.refHigh - m.refLow;
  const optStart = ((m.optLow - m.refLow) / range) * 100;
  const optEnd = ((m.optHigh - m.refLow) / range) * 100;
  const v = Number(val);
  const hasVal = !isNaN(v) && val !== '';
  const pos = hasVal ? Math.max(0, Math.min(100, ((v - m.refLow) / range) * 100)) : null;
  const status = !hasVal ? null : (v < m.refLow || v > m.refHigh) ? 'avoid' : (v >= m.optLow && v <= m.optHigh) ? 'core' : 'warn';

  return (
    <div className="relative h-2 bg-[#171719] hairline-soft sharp">
      <div className="absolute top-0 bottom-0"
           style={{ left: `${optStart}%`, width: `${optEnd - optStart}%`, background: 'var(--accent-soft)', borderLeft: '1px solid var(--accent-line)', borderRight: '1px solid var(--accent-line)' }} />
      {pos !== null && (
        <div className="absolute top-[-3px] bottom-[-3px] w-[2px]"
             style={{ left: `calc(${pos}% - 1px)`, background: status === 'core' ? 'var(--accent)' : status === 'avoid' ? 'var(--danger)' : 'var(--warn)' }} />
      )}
    </div>
  );
};

const gradeOf = (m, val) => {
  const v = Number(val);
  if (isNaN(v) || val === '') return null;
  if (v < m.refLow || v > m.refHigh) return 'avoid';
  if (v >= m.optLow && v <= m.optHigh) return 'core';
  return 'warn';
};
const labelOfGrade = (g) => g === 'core' ? 'Optimal' : g === 'avoid' ? 'Out of range' : g === 'warn' ? 'Low-normal' : '—';


/* ---------- Step 1: Empty state ---------- */
const BloodworkEmpty = ({ onStart }) => (
  <Card>
    <Empty
      glyph="drop"
      title="No bloodwork on file"
      sub="Log your first panel to start tracking trends across markers. Manual entry takes about three minutes; CSV import is faster if your lab supports it."
      action={
        <div className="flex items-center gap-2">
          <button onClick={onStart} className="btn btn-primary"><Glyph name="plus" size={12} /> Log first panel</button>
          <button className="btn"><Glyph name="external" size={12} /> Import CSV</button>
          <button className="btn btn-ghost">Learn more</button>
        </div>
      }
    />
  </Card>
);


/* ---------- Step 2: Input form ---------- */
const BloodworkInputView = ({ meta, setMeta, rows, setRows, onCancel, onSave }) => {
  const update = (i, k, v) => setRows(prev => prev.map((r, j) => j === i ? { ...r, [k]: v } : r));
  const remove = (i) => setRows(prev => prev.filter((_, j) => j !== i));
  const add = () => setRows(prev => [...prev, { ...BLOODWORK_TEMPLATE[0], name: '', unit: '', ref: '', opt: '', val: '', refLow: 0, refHigh: 100, optLow: 0, optHigh: 0 }]);

  const filled = rows.filter(r => r.val !== '' && r.val !== undefined).length;

  return (
    <div className="stack-md">
      <Card label="Panel · Meta">
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="Draw date">
            <Input type="date" value={meta.date} onChange={e => setMeta({ ...meta, date: e.target.value })} />
          </Field>
          <Field label="Lab">
            <Select
              value={meta.lab}
              onChange={v => setMeta({ ...meta, lab: v })}
              options={['Quest', 'LabCorp', 'Marek Diagnostics', 'In-house', 'Other']}
            />
          </Field>
          <Field label="Fasted state">
            <Select
              value={meta.fasted ? 'yes' : 'no'}
              onChange={v => setMeta({ ...meta, fasted: v === 'yes' })}
              options={[{ label: 'Fasted 8h+', value: 'yes' }, { label: 'Non-fasted', value: 'no' }]}
            />
          </Field>
          <Field label="Time of draw" hint="24h">
            <Input type="time" value={meta.time} onChange={e => setMeta({ ...meta, time: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card
        label="Markers"
        action={
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[var(--text-3)]">{filled} of {rows.length} filled</span>
            <button onClick={add} className="btn btn-ghost btn-sm"><Glyph name="plus" size={11} /> Add marker</button>
          </div>
        }
      >
        {/* Column headers */}
        <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-3 items-center">
          <div className="col-span-3 label">Marker</div>
          <div className="col-span-1 label">Value</div>
          <div className="col-span-1 label">Unit</div>
          <div className="col-span-4 label">Optimal range</div>
          <div className="col-span-2 label text-right">Grade</div>
          <div className="col-span-1"></div>
        </div>

        <div>
          {rows.map((r, i) => {
            const grade = gradeOf(r, r.val);
            return (
              <div key={i} className="grid grid-cols-12 gap-3 px-5 py-3 items-center border-b divider-soft last:border-0" style={{ minHeight: 68 }}>
                <div className="col-span-3">
                  <Input value={r.name} placeholder="e.g. Free Testosterone" onChange={e => update(i, 'name', e.target.value)} />
                </div>
                <div className="col-span-1">
                  <Input value={r.val ?? ''} placeholder="—" onChange={e => update(i, 'val', e.target.value)} className="font-mono text-center" />
                </div>
                <div className="col-span-1 mono text-[12.5px] text-[var(--text-3)] truncate">{r.unit}</div>
                <div className="col-span-4 pr-2">
                  <MiniRangeBar m={r} val={r.val} />
                  <div className="flex items-baseline justify-between mt-1.5 mono text-[10.5px] text-[var(--text-3)]">
                    <span>{r.refLow}</span>
                    <span className="text-[var(--accent)]">{r.opt}</span>
                    <span>{r.refHigh}</span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  {grade
                    ? <Badge kind={grade} dot>{labelOfGrade(grade)}</Badge>
                    : <span className="mono text-[11px] text-[var(--text-4)]">—</span>}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => remove(i)} className="text-[var(--text-4)] hover:text-[var(--danger)]"><Glyph name="x" size={13} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card label="Operator notes">
        <div className="px-6 py-5">
          <Textarea
            value={meta.notes}
            onChange={e => setMeta({ ...meta, notes: e.target.value })}
            rows={4}
            placeholder="Context for this draw — current protocol, cycle day, recent illness, stress load, what you're looking to confirm or rule out…"
          />
        </div>
      </Card>

      <Card>
        <div className="px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-[12.5px] text-[var(--text-3)]">{filled} of {rows.length} markers have values · will be saved as panel #15</div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="btn">Cancel</button>
            <button className="btn">Save draft</button>
            <button onClick={onSave} className="btn btn-primary" disabled={filled === 0} style={{ opacity: filled === 0 ? 0.4 : 1 }}>
              <Glyph name="check" size={12} /> Save panel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};


/* ---------- Step 3: Result summary ---------- */
const BloodworkSummary = ({ meta, rows, onEdit, onDone }) => {
  const valid = rows.filter(r => r.val !== '' && r.name);
  const grades = valid.map(r => gradeOf(r, r.val));
  const count = {
    core:  grades.filter(g => g === 'core').length,
    warn:  grades.filter(g => g === 'warn').length,
    avoid: grades.filter(g => g === 'avoid').length,
  };
  const score = valid.length === 0 ? 0 : Math.round(((count.core * 1.0 + count.warn * 0.5) / valid.length) * 100);

  return (
    <div className="stack-md">
      {/* Hero summary */}
      <Card>
        <div className="px-7 py-6 relative overflow-hidden">
          <div className="absolute inset-0 grid-faint pointer-events-none opacity-30" />
          <div className="relative flex items-center gap-7 flex-wrap">
            <div className="relative shrink-0">
              <svg width="116" height="116" viewBox="0 0 116 116">
                <circle cx="58" cy="58" r="50" stroke="#1e1e24" strokeWidth="6" fill="none" />
                <circle cx="58" cy="58" r="50" stroke="var(--accent)" strokeWidth="6" fill="none"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 58 58)" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mono text-[34px] leading-none text-[var(--text)]" style={{ fontWeight: 500 }}>{score}</div>
                <div className="mono text-[10px] tracking-[0.18em] text-[var(--text-3)] mt-1.5">/ 100</div>
              </div>
            </div>

            <div className="flex-1 min-w-[260px]">
              <Badge kind="core" dot>Panel saved · #15</Badge>
              <h2 className="text-[20px] text-[var(--text)] tracking-tight mt-3" style={{ fontWeight: 500 }}>
                {valid.length} markers logged · {count.core} optimal
              </h2>
              <p className="text-[13.5px] text-[var(--text-2)] mt-2 leading-relaxed max-w-xl">
                Saved {meta.date} at {meta.time}{meta.lab ? ` · ${meta.lab}` : ''}{meta.fasted ? ' · fasted' : ''}. Trends will start updating once panel #16 is logged.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="hairline-soft sharp px-4 py-3 text-center" style={{ minWidth: 84 }}>
                <div className="label mb-1.5">Optimal</div>
                <div className="mono text-[20px] text-[var(--accent)]" style={{ fontWeight: 500 }}>{count.core}</div>
              </div>
              <div className="hairline-soft sharp px-4 py-3 text-center" style={{ minWidth: 84 }}>
                <div className="label mb-1.5">Suboptimal</div>
                <div className="mono text-[20px] text-[var(--warn)]" style={{ fontWeight: 500 }}>{count.warn}</div>
              </div>
              <div className="hairline-soft sharp px-4 py-3 text-center" style={{ minWidth: 84 }}>
                <div className="label mb-1.5">Out of range</div>
                <div className="mono text-[20px] text-[var(--danger)]" style={{ fontWeight: 500 }}>{count.avoid}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Marker breakdown */}
      <Card label="Marker breakdown">
        <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4 label">Marker</div>
          <div className="col-span-2 label">Value</div>
          <div className="col-span-4 label">Range</div>
          <div className="col-span-2 label text-right">Grade</div>
        </div>
        <div>
          {valid.map((r, i) => {
            const grade = gradeOf(r, r.val);
            return (
              <div key={i} className="grid grid-cols-12 gap-4 px-5 items-center border-b divider-soft last:border-0 hover:bg-white/[.015]" style={{ minHeight: 60 }}>
                <div className="col-span-4 min-w-0">
                  <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{r.name}</div>
                  <div className="mono text-[11px] text-[var(--text-3)] mt-1">{r.unit}</div>
                </div>
                <div className="col-span-2">
                  <span className="mono text-[16px] text-[var(--text)]" style={{ fontWeight: 500 }}>{r.val}</span>
                </div>
                <div className="col-span-4 pr-2">
                  <MiniRangeBar m={r} val={r.val} />
                  <div className="flex items-baseline justify-between mt-1.5 mono text-[10px] text-[var(--text-3)]">
                    <span>{r.refLow}</span>
                    <span className="text-[var(--accent)]">{r.opt}</span>
                    <span>{r.refHigh}</span>
                  </div>
                </div>
                <div className="col-span-2 flex justify-end">
                  <Badge kind={grade} dot>{labelOfGrade(grade)}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Highlights and recommendations */}
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 lg:col-span-7" label="System recommendations">
          <div className="px-5 py-4 space-y-3">
            {count.avoid > 0 && (
              <div className="hairline sharp px-4 py-3" style={{ borderColor: 'rgba(200,69,69,0.35)', background: 'var(--danger-soft)' }}>
                <div className="flex items-start gap-3">
                  <Glyph name="warning" size={15} className="text-[var(--danger)] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>
                      {count.avoid} {count.avoid === 1 ? 'marker' : 'markers'} out of reference range
                    </div>
                    <div className="text-[12.5px] text-[var(--text-2)] mt-1 leading-relaxed">
                      These need attention before the next protocol. Open each marker to see linked protocols and operator notes.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {count.warn > 0 && (
              <div className="hairline sharp px-4 py-3" style={{ borderColor: 'rgba(232,177,74,0.35)', background: 'var(--warn-soft)' }}>
                <div className="flex items-start gap-3">
                  <Glyph name="warning" size={15} className="text-[var(--warn)] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>
                      {count.warn} {count.warn === 1 ? 'marker' : 'markers'} suboptimal
                    </div>
                    <div className="text-[12.5px] text-[var(--text-2)] mt-1 leading-relaxed">
                      Within reference range but outside your defined optimal window. Consider a 4–8 week intervention block.
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="hairline sharp px-4 py-3" style={{ borderColor: 'var(--accent-line)', background: 'var(--accent-soft)' }}>
              <div className="flex items-start gap-3">
                <Glyph name="protocol" size={15} className="text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>
                    Suggested protocol · Androgen Recovery — 14-Day Block
                  </div>
                  <div className="text-[12.5px] text-[var(--text-2)] mt-1 leading-relaxed">
                    Targets the largest deficit in this panel. Re-draw D14 to measure delta. Cancel any time.
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="btn btn-primary btn-sm"><Glyph name="play" size={11} /> Open protocol</button>
                    <button className="btn btn-ghost btn-sm">Dismiss</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="col-span-12 lg:col-span-5" label="Panel metadata">
          <div className="px-5 py-4 space-y-1">
            <KV k="Panel number"  v="#15" />
            <KV k="Date"          v={meta.date} />
            <KV k="Lab"           v={meta.lab || '—'} mono={false} />
            <KV k="Time of draw"  v={meta.time} />
            <KV k="Fasted state"  v={meta.fasted ? 'Fasted 8h+' : 'Non-fasted'} mono={false} tone={meta.fasted ? 'accent' : undefined} />
            <KV k="Markers"       v={String(valid.length)} />
            <KV k="Notes"         v={meta.notes ? 'attached' : '—'} mono={false} />
          </div>
        </Card>
      </div>

      {/* Footer */}
      <Card>
        <div className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
          <div className="text-[12.5px] text-[var(--text-3)]">Next draw recommended in <span className="text-[var(--text)]">8 weeks</span> · system will remind D+56</div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="btn">Edit panel</button>
            <button className="btn"><Glyph name="external" size={12} /> Export PDF</button>
            <button onClick={onDone} className="btn btn-primary">Done</button>
          </div>
        </div>
      </Card>
    </div>
  );
};


/* ---------- Container ---------- */
const BloodworkFlow = () => {
  const [step, setStep] = React.useState('empty'); // 'empty' | 'input' | 'summary'
  const [meta, setMeta] = React.useState({ date: '2026-05-18', lab: 'Quest', fasted: true, time: '07:42', notes: '' });
  const [rows, setRows] = React.useState(
    BLOODWORK_TEMPLATE.map((t, i) => ({ ...t, val: i === 0 ? '486' : i === 2 ? '32' : i === 5 ? '58' : '' }))
  );

  return (
    <div className="px-8 py-7 stack-md">
      <Card>
        <div className="px-6 py-5">
          <div className="label mb-1.5">Flow · 02</div>
          <h2 className="text-[24px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Bloodwork Input Flow</h2>
          <p className="text-[13.5px] text-[var(--text-2)] mt-2 max-w-2xl leading-relaxed">
            Three-stage flow: empty state on a fresh install, full input form for manual entry with live optimal-range feedback, and a saved-panel summary that grades the result and suggests the next move.
          </p>
        </div>

        {/* Step rail */}
        <div className="px-6 pb-5 flex items-center gap-2 flex-wrap">
          {[
            { k: 'empty',   l: 'Empty state' },
            { k: 'input',   l: 'Manual entry' },
            { k: 'summary', l: 'Result summary' },
          ].map((s, i) => (
            <React.Fragment key={s.k}>
              <button
                onClick={() => setStep(s.k)}
                className="flex items-center gap-2 px-3 py-1.5 sharp text-[12px] hairline-soft"
                style={{
                  background: step === s.k ? 'var(--accent-soft)' : 'transparent',
                  borderColor: step === s.k ? 'var(--accent-line)' : 'var(--border-soft)',
                  color: step === s.k ? 'var(--accent)' : 'var(--text-2)',
                }}
              >
                <span className="mono text-[10.5px]">{String(i + 1).padStart(2, '0')}</span>
                <span>{s.l}</span>
              </button>
              {i < 2 && <Glyph name="arrowRight" size={12} className="text-[var(--text-4)]" />}
            </React.Fragment>
          ))}
        </div>
      </Card>

      {step === 'empty' && <BloodworkEmpty onStart={() => setStep('input')} />}
      {step === 'input' && (
        <BloodworkInputView
          meta={meta}
          setMeta={setMeta}
          rows={rows}
          setRows={setRows}
          onCancel={() => setStep('empty')}
          onSave={() => setStep('summary')}
        />
      )}
      {step === 'summary' && (
        <BloodworkSummary
          meta={meta}
          rows={rows}
          onEdit={() => setStep('input')}
          onDone={() => setStep('empty')}
        />
      )}
    </div>
  );
};


Object.assign(window, { SearchDetailFlow, BloodworkFlow });
