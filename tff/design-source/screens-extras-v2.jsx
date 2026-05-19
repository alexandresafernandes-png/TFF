// ============================================================
//  VILLAIN.OS — EXTRAS v2
//  Mobile Dashboard · Onboarding flow · States gallery
// ============================================================

/* ------------------------------------------------------------
   MOBILE DASHBOARD — shown inside a phone frame on desktop
   ------------------------------------------------------------ */
const MobileDashboard = () => {
  const [tab, setTab] = React.useState('home');
  const [done, setDone] = React.useState({ 0: true, 1: true, 2: false, 3: false });
  const toggleTask = (i) => setDone(prev => ({ ...prev, [i]: !prev[i] }));

  const tasks = [
    { t: 'Sunlight 10min',          tag: 'Circadian', prio: 'CORE' },
    { t: 'Hydrate + 1g sodium',     tag: 'Hydration', prio: 'CORE' },
    { t: 'Stack A — Zn / B / Mg',   tag: 'Stack',     prio: 'CORE' },
    { t: 'Compound lift 5×5 squat', tag: 'Stimulus',  prio: 'CORE' },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20" style={{ background: 'var(--bg)' }}>
      {/* Mobile status bar */}
      <div className="h-12 flex items-center justify-between px-6 pt-1">
        <span className="mono text-[11px] text-[var(--text)]">09:41</span>
        <div className="flex items-center gap-1.5 text-[var(--text)]">
          <span className="mono text-[10px]">5G</span>
          <span className="w-4 h-2 hairline-soft sharp" style={{ background: 'var(--text)' }} />
        </div>
      </div>

      {/* Brand row */}
      <div className="px-5 pt-2 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 relative flex items-center justify-center">
            <div className="w-5 h-5 border" style={{ borderColor: 'var(--accent)', transform: 'rotate(45deg)' }} />
            <div className="w-1.5 h-1.5 absolute" style={{ background: 'var(--accent)' }} />
          </div>
          <div>
            <div className="mono text-[11px] tracking-[0.2em] text-[var(--text)]" style={{ fontWeight: 500 }}>VILLAIN.OS</div>
            <div className="mono text-[9px] text-[var(--text-3)] tracking-wider">CYCLE 047 · D12</div>
          </div>
        </div>
        <button className="w-9 h-9 hairline sharp flex items-center justify-center text-[var(--text-2)]">
          <Glyph name="dots" size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-5 mb-5">
        <div className="card flex items-center gap-3 px-4 py-3">
          <Glyph name="search" size={14} className="text-[var(--text-3)]" />
          <span className="flex-1 text-[13px] text-[var(--text-4)]">Search archive…</span>
          <span className="kbd">⌘K</span>
        </div>
      </div>

      {tab === 'home' && (
        <div className="px-5 space-y-4">
          {/* Score card */}
          <Card label="Protocol Score · Today">
            <div className="px-5 py-5 flex items-center gap-5">
              <div className="relative shrink-0">
                <svg width="84" height="84" viewBox="0 0 84 84">
                  <circle cx="42" cy="42" r="36" stroke="#1e1e24" strokeWidth="4.5" fill="none" />
                  <circle cx="42" cy="42" r="36" stroke="var(--accent)" strokeWidth="4.5" fill="none"
                          strokeDasharray={`${2 * Math.PI * 36}`}
                          strokeDashoffset={`${2 * Math.PI * 36 * (1 - 0.78)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 42 42)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="mono text-[24px] text-[var(--text)]" style={{ fontWeight: 500 }}>78</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <KV k="Sleep" v="92%" tone="accent" />
                <KV k="Training" v="71%" />
                <KV k="Nutrition" v="84%" tone="accent" />
              </div>
            </div>
          </Card>

          {/* Daily checklist */}
          <Card
            label="Daily Checklist"
            action={<span className="mono text-[10.5px] text-[var(--text-3)]">{Object.values(done).filter(Boolean).length}/{tasks.length}</span>}
          >
            <div className="px-4 pt-3 pb-2">
              <Progress value={Object.values(done).filter(Boolean).length} max={tasks.length} />
            </div>
            <div className="divide-y divider-soft">
              {tasks.map((task, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 ${done[i] ? 'opacity-55' : ''}`}>
                  <Tick on={done[i]} onClick={() => toggleTask(i)} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-[13px] ${done[i] ? 'line-through text-[var(--text-2)]' : 'text-[var(--text)]'}`}>{task.t}</div>
                    <div className="text-[11px] text-[var(--text-3)] mt-0.5">{task.tag}</div>
                  </div>
                  <Badge kind="core">{task.prio}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Next action */}
          <Card label="Next Action" action={<Badge kind="warn" dot>14m</Badge>}>
            <div className="px-5 py-4">
              <div className="flex items-baseline gap-2">
                <span className="mono text-[20px] text-[var(--text)]" style={{ fontWeight: 500 }}>16:45</span>
                <span className="text-[13px] text-[var(--text-2)]">Pre-training stack</span>
              </div>
              <div className="text-[12.5px] text-[var(--text-3)] mt-1.5">Citrulline 6g · Sodium 1g · β-Alanine 3g</div>
              <div className="flex gap-2 mt-3.5">
                <button className="btn btn-primary btn-sm flex-1 justify-center">Mark Taken</button>
                <button className="btn btn-sm">Skip</button>
              </div>
            </div>
          </Card>

          {/* Minimum Effective Day */}
          <Card label="Minimum Effective Day">
            <div className="px-5 py-4 space-y-2">
              {['Sunlight 10m', 'Protein 1g/lb', 'Walk 30m', 'Compound lift', 'Sleep 7h+'].map((m, i) => (
                <div key={m} className="flex items-center gap-3">
                  <span className="mono text-[10.5px] text-[var(--accent)] tracking-[0.2em] w-5">0{i + 1}</span>
                  <span className="text-[13px] text-[var(--text)]">{m}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="h-2" />
        </div>
      )}

      {tab === 'search' && (
        <div className="px-5 space-y-3">
          <div className="text-[14px] text-[var(--text)] mb-3" style={{ fontWeight: 500 }}>Recent</div>
          {['egg yolks', 'cold exposure', 'ashwagandha', 'liver dosing', 'mouth tape'].map(q => (
            <div key={q} className="hairline-soft sharp px-4 py-3 flex items-center gap-3">
              <Glyph name="search" size={12} className="text-[var(--text-3)]" />
              <span className="text-[13px] text-[var(--text)] flex-1">{q}</span>
              <Glyph name="chev" size={11} className="text-[var(--text-4)]" />
            </div>
          ))}
        </div>
      )}

      {tab === 'check' && (
        <div className="px-5 space-y-3">
          {tasks.map((task, i) => (
            <div key={i} className={`hairline-soft sharp px-4 py-3 flex items-center gap-3 ${done[i] ? 'opacity-55' : ''}`}>
              <Tick on={done[i]} onClick={() => toggleTask(i)} />
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] ${done[i] ? 'line-through text-[var(--text-2)]' : 'text-[var(--text)]'}`}>{task.t}</div>
                <div className="text-[11px] text-[var(--text-3)] mt-0.5">{task.tag}</div>
              </div>
              <Badge kind="core">{task.prio}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === 'protocol' && (
        <div className="px-5 space-y-3">
          <Card label="Active · 14D Block">
            <div className="px-4 py-4">
              <div className="text-[14px] text-[var(--text)]" style={{ fontWeight: 500 }}>Androgen Recovery</div>
              <div className="mt-3"><Progress value={12} max={14} label="Day 12 / 14" valueLabel="86%" /></div>
            </div>
          </Card>
        </div>
      )}

      {/* Bottom nav */}
      <div className="absolute left-0 right-0 bottom-0 panel border-t divider px-2 pt-2 pb-5 flex items-center justify-around">
        {[
          { k: 'home',     g: 'dashboard', l: 'Home' },
          { k: 'search',   g: 'search',    l: 'Search' },
          { k: 'check',    g: 'check',     l: 'Today' },
          { k: 'protocol', g: 'protocol',  l: 'Protocol' },
        ].map(n => (
          <button
            key={n.k}
            onClick={() => setTab(n.k)}
            className="flex flex-col items-center gap-1 px-2 py-1 min-w-[60px]"
            style={{ color: tab === n.k ? 'var(--accent)' : 'var(--text-3)' }}
          >
            <Glyph name={n.g} size={17} />
            <span className="mono text-[9px] tracking-[0.14em]">{n.l.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const MobileScreen = () => (
  <div className="px-8 py-7 space-y-6">
    <Card>
      <div className="px-6 py-5">
        <div className="label mb-1.5">Mobile · Compact command center</div>
        <h2 className="text-[20px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Mobile Dashboard</h2>
        <p className="text-[13.5px] text-[var(--text-2)] mt-2 max-w-2xl leading-relaxed">
          Same identity, condensed for one-thumb operation. Score, checklist, next action, and search live above the fold. Bottom nav exposes the four most-used surfaces.
        </p>
      </div>
    </Card>

    <div className="flex flex-col xl:flex-row items-start gap-8">
      <div className="phone shrink-0 mx-auto xl:mx-0">
        <MobileDashboard />
      </div>
      <Card className="flex-1 w-full" label="Mobile design notes">
        <div className="px-6 py-5 space-y-4">
          {[
            { k: 'Layout',     v: 'Single column. 16px outer gutter. Cards retain 6px radius. No floating action button — the bottom nav is the action surface.' },
            { k: 'Navigation', v: 'Bottom 4-tab nav: Home, Search, Today, Protocol. The remaining six sidebar modules collapse into a "More" sheet on Home → top right.' },
            { k: 'Density',    v: 'One step tighter than desktop comfortable. Task rows 48px min. Body type stays at 13–13.5 for thumbreach legibility.' },
            { k: 'Search',     v: 'Always one tap away. Quick chip on Home; full-screen overlay from the nav tab.' },
            { k: 'Touch targets', v: 'Tick boxes are 18×18 visually but 44×44 tap area. Status badges remain non-interactive — keeps mass low.' },
            { k: 'Offline',    v: 'Local-only by default. The "System Armed" indicator from desktop becomes a single dot in the status row when degraded.' },
          ].map(n => (
            <div key={n.k} className="hairline-soft sharp px-4 py-3.5">
              <div className="label mb-1.5">{n.k}</div>
              <div className="text-[13.5px] text-[var(--text)] leading-relaxed">{n.v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);


/* ------------------------------------------------------------
   ONBOARDING — multi-step baseline capture
   ------------------------------------------------------------ */
const ONBOARD_STEPS = [
  { k: 'goals',         label: 'Goals' },
  { k: 'sleep',         label: 'Sleep' },
  { k: 'training',      label: 'Training' },
  { k: 'symptoms',      label: 'Symptoms' },
  { k: 'supplements',   label: 'Supplements' },
  { k: 'bloodwork',     label: 'Bloodwork' },
  { k: 'priority',      label: 'Priority focus' },
];

const Pill = ({ on, children, onClick }) => (
  <button
    onClick={onClick}
    className="px-3.5 py-2 sharp text-[12.5px] hairline-soft"
    style={on ? { background: 'var(--accent-soft)', borderColor: 'var(--accent-line)', color: 'var(--accent)' } : { color: 'var(--text)' }}
  >
    {children}
  </button>
);

const OnboardingScreen = () => {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    goals: ['Hormonal recovery', 'Body composition'],
    sleepHours: 6.5,
    sleepIssues: ['Wake at 3am'],
    trainingDays: 4,
    trainingType: 'Hybrid',
    symptoms: ['Low drive', 'Mid-day fatigue'],
    supplementsOn: 'Yes — partial stack',
    bloodworkOn: 'Yes — recent',
    priority: 'Androgen recovery',
  });

  const goNext = () => setStep(Math.min(step + 1, ONBOARD_STEPS.length - 1));
  const goPrev = () => setStep(Math.max(step - 1, 0));
  const cur = ONBOARD_STEPS[step];

  return (
    <div className="px-8 py-7 max-w-4xl mx-auto stack-md">
      <Card>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="label mb-1.5">First-use setup · Baseline capture</div>
              <h2 className="text-[24px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Configure operator profile</h2>
              <p className="text-[13.5px] text-[var(--text-2)] mt-2 leading-relaxed max-w-xl">
                Seven steps to calibrate the system. Everything stays local. You can edit any answer later from Notes → Operator log.
              </p>
            </div>
            <div className="hidden md:block text-right">
              <div className="mono text-[24px] text-[var(--text)] leading-none" style={{ fontWeight: 500 }}>{step + 1}<span className="text-[14px] text-[var(--text-3)]">/{ONBOARD_STEPS.length}</span></div>
              <div className="mono text-[11px] text-[var(--text-3)] mt-2 tracking-wider">STEP</div>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-5 flex items-center gap-1.5 overflow-x-auto">
            {ONBOARD_STEPS.map((s, i) => (
              <div key={s.k} className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setStep(i)}
                  className="flex items-center gap-2 px-2 py-1.5 sharp text-[11.5px] hairline-soft"
                  style={{
                    background: i === step ? 'var(--accent-soft)' : 'transparent',
                    borderColor: i < step ? 'var(--accent-line)' : i === step ? 'var(--accent-line)' : 'var(--border-soft)',
                    color: i === step ? 'var(--accent)' : i < step ? 'var(--text-2)' : 'var(--text-3)',
                  }}
                >
                  <span className="mono text-[10px]">{String(i + 1).padStart(2, '0')}</span>
                  <span>{s.label}</span>
                  {i < step && <Glyph name="check" size={10} />}
                </button>
                {i < ONBOARD_STEPS.length - 1 && <div className="w-2 h-px bg-[var(--border-soft)]" />}
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card label={`Step ${step + 1} · ${cur.label}`}>
        <div className="px-6 py-6">
          {cur.k === 'goals' && (
            <div className="space-y-4">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>What are you trying to fix?</h3>
              <p className="text-[13px] text-[var(--text-2)] leading-relaxed">Pick all that apply. The system will weight protocol recommendations toward whatever you select.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Hormonal recovery', 'Body composition', 'Sleep quality', 'Cognitive output', 'Athletic performance', 'Longevity / hormesis', 'Inflammation', 'Gut function', 'Energy / mitochondrial'].map(g => (
                  <Pill key={g} on={data.goals.includes(g)} onClick={() => setData(d => ({ ...d, goals: d.goals.includes(g) ? d.goals.filter(x => x !== g) : [...d.goals, g] }))}>{g}</Pill>
                ))}
              </div>
            </div>
          )}

          {cur.k === 'sleep' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Current sleep baseline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Average hours / night" hint="Last 14 days">
                  <Input type="number" value={data.sleepHours} step="0.25" onChange={e => setData({ ...data, sleepHours: e.target.value })} className="font-mono" />
                </Field>
                <Field label="Bedtime · typical">
                  <Input type="time" defaultValue="23:00" />
                </Field>
                <Field label="Wake · typical">
                  <Input type="time" defaultValue="06:30" />
                </Field>
              </div>
              <div>
                <div className="label mb-2.5">Known issues</div>
                <div className="flex flex-wrap gap-2">
                  {['Wake at 3am', 'Trouble falling asleep', 'Snoring / apnea', 'Restless legs', 'Vivid dreams', 'Night sweats', 'Wake to urinate', 'None'].map(s => (
                    <Pill key={s} on={data.sleepIssues.includes(s)} onClick={() => setData(d => ({ ...d, sleepIssues: d.sleepIssues.includes(s) ? d.sleepIssues.filter(x => x !== s) : [...d.sleepIssues, s] }))}>{s}</Pill>
                  ))}
                </div>
              </div>
            </div>
          )}

          {cur.k === 'training' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Training schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Days per week">
                  <Select
                    value={String(data.trainingDays)}
                    onChange={v => setData({ ...data, trainingDays: Number(v) })}
                    options={['0', '1', '2', '3', '4', '5', '6', '7']}
                  />
                </Field>
                <Field label="Training type">
                  <Select
                    value={data.trainingType}
                    onChange={v => setData({ ...data, trainingType: v })}
                    options={['Resistance only', 'Hybrid', 'Endurance', 'Combat / skill', 'Mixed modal']}
                  />
                </Field>
              </div>
              <div className="hairline-soft sharp px-4 py-3.5">
                <div className="label mb-2">Window detected</div>
                <div className="text-[13.5px] text-[var(--text)] leading-relaxed">
                  Hybrid · 4 days/wk classifies you as <span className="text-[var(--accent)]">recovery-sensitive</span>. Cold-exposure protocols will be flagged for AM-only stacking.
                </div>
              </div>
            </div>
          )}

          {cur.k === 'symptoms' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Current symptoms</h3>
              <p className="text-[13px] text-[var(--text-2)] leading-relaxed">Subjective markers help the system rank confounders. Be honest — this never leaves the device.</p>
              <div className="flex flex-wrap gap-2">
                {['Low drive', 'Mid-day fatigue', 'Brain fog', 'Low motivation', 'Anxiety / wired', 'Soft erections', 'Bloating', 'Slow recovery', 'Joint pain', 'Cold extremities', 'Sweet cravings', 'None'].map(s => (
                  <Pill key={s} on={data.symptoms.includes(s)} onClick={() => setData(d => ({ ...d, symptoms: d.symptoms.includes(s) ? d.symptoms.filter(x => x !== s) : [...d.symptoms, s] }))}>{s}</Pill>
                ))}
              </div>
            </div>
          )}

          {cur.k === 'supplements' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Are you running anything currently?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['No — clean slate', 'Yes — partial stack', 'Yes — full stack'].map(o => (
                  <button key={o} onClick={() => setData({ ...data, supplementsOn: o })}
                          className="hairline-soft sharp px-4 py-4 text-left"
                          style={data.supplementsOn === o ? { background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' } : {}}>
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{o}</div>
                  </button>
                ))}
              </div>
              {data.supplementsOn !== 'No — clean slate' && (
                <Field label="List what you're taking" hint="One per line · dose optional">
                  <Textarea rows={5} defaultValue={'Magnesium glycinate 400mg\nZinc 25mg\nVitamin D3 5000IU\nCreatine 5g'} />
                </Field>
              )}
            </div>
          )}

          {cur.k === 'bloodwork' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Do you have recent bloodwork?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { o: 'Yes — recent',  d: 'Within last 90 days. Will import.' },
                  { o: 'Yes — older',   d: 'Older than 90 days. Reference only.' },
                  { o: 'No · skip',     d: 'Continue without bloodwork.' },
                ].map(opt => (
                  <button key={opt.o} onClick={() => setData({ ...data, bloodworkOn: opt.o })}
                          className="hairline-soft sharp px-4 py-4 text-left"
                          style={data.bloodworkOn === opt.o ? { background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' } : {}}>
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{opt.o}</div>
                    <div className="text-[12px] text-[var(--text-3)] mt-1.5 leading-relaxed">{opt.d}</div>
                  </button>
                ))}
              </div>
              {data.bloodworkOn.startsWith('Yes') && (
                <div className="hairline-soft sharp px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>Import method</div>
                    <div className="text-[12.5px] text-[var(--text-3)] mt-1">CSV from lab portal, or manual entry</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn btn-sm"><Glyph name="external" size={12} /> Upload CSV</button>
                    <button className="btn btn-sm">Manual entry</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {cur.k === 'priority' && (
            <div className="space-y-5">
              <h3 className="text-[17px] text-[var(--text)]" style={{ fontWeight: 500 }}>Pick a single primary focus</h3>
              <p className="text-[13px] text-[var(--text-2)] leading-relaxed">The system runs better when you concentrate fire. You can shift focus mid-cycle, but only one at a time.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Androgen recovery',
                  'Sleep architecture',
                  'Cognitive output',
                  'Body recomposition',
                  'Cardiovascular fitness',
                  'Gut / inflammation',
                ].map(p => (
                  <button key={p} onClick={() => setData({ ...data, priority: p })}
                          className="hairline-soft sharp px-4 py-3.5 text-left flex items-center justify-between"
                          style={data.priority === p ? { background: 'var(--accent-soft)', borderColor: 'var(--accent-line)' } : {}}>
                    <span className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>{p}</span>
                    {data.priority === p && <Glyph name="check" size={14} className="text-[var(--accent)]" />}
                  </button>
                ))}
              </div>

              <div className="hairline sharp px-5 py-4 mt-4" style={{ borderColor: 'var(--accent-line)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Badge kind="core" dot>READY</Badge>
                  <span className="text-[13.5px] text-[var(--text)]" style={{ fontWeight: 500 }}>System will recommend:</span>
                </div>
                <ul className="text-[13px] text-[var(--text-2)] space-y-1.5 mt-2 leading-relaxed">
                  <li>• Active protocol: <span className="text-[var(--accent)]">Androgen Recovery — 14-Day Block</span></li>
                  <li>• Starter stack: Zinc + Boron + Magnesium glycinate + D3/K2</li>
                  <li>• Bloodwork cadence: every 8 weeks</li>
                  <li>• Daily checklist: 13 tasks across 4 windows</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={goPrev} disabled={step === 0} className="btn" style={{ opacity: step === 0 ? 0.4 : 1 }}>
          <Glyph name="arrowRight" size={11} className="rotate-180" /> Back
        </button>
        <div className="text-[12.5px] text-[var(--text-3)]">Step {step + 1} of {ONBOARD_STEPS.length}</div>
        {step < ONBOARD_STEPS.length - 1 ? (
          <button onClick={goNext} className="btn btn-primary">Next <Glyph name="arrowRight" size={11} /></button>
        ) : (
          <button className="btn btn-primary"><Glyph name="play" size={12} /> Arm system</button>
        )}
      </div>
    </div>
  );
};


/* ------------------------------------------------------------
   STATES GALLERY — empty / loading / error states
   ------------------------------------------------------------ */
const StateBlock = ({ kicker, title, children }) => (
  <section>
    <SectionHead kicker={kicker} title={title} />
    {children}
  </section>
);

const StatesScreen = () => (
  <div className="px-8 py-7 stack-lg">
    <Card>
      <div className="px-6 py-5">
        <div className="label mb-1.5">UI States Gallery</div>
        <h2 className="text-[24px] text-[var(--text)] tracking-tight" style={{ fontWeight: 600 }}>Empty · Loading · Error</h2>
        <p className="text-[13.5px] text-[var(--text-2)] mt-2 max-w-2xl leading-relaxed">
          Every screen needs its quiet states. These stay calm: no illustrations, no exclamation marks, no apologies. Just a tight title, one line of context, and a single primary action.
        </p>
      </div>
    </Card>

    <StateBlock kicker="Empty" title="No search results">
      <Card>
        <Empty
          glyph="search"
          title="No matches in archive"
          sub="Try a broader term, or strip down to a single keyword. The archive index has 14 sources scanned."
          action={<button className="btn btn-primary">Clear filters</button>}
        />
      </Card>
    </StateBlock>

    <StateBlock kicker="Empty" title="No bloodwork yet">
      <Card>
        <Empty
          glyph="drop"
          title="No bloodwork on file"
          sub="Log your first panel to start tracking trends. Manual entry takes about three minutes; CSV import is faster if your lab supports it."
          action={
            <div className="flex items-center gap-2">
              <button className="btn btn-primary"><Glyph name="plus" size={12} /> Log first panel</button>
              <button className="btn"><Glyph name="external" size={12} /> Import CSV</button>
            </div>
          }
        />
      </Card>
    </StateBlock>

    <StateBlock kicker="Empty" title="No active protocol">
      <Card>
        <Empty
          glyph="protocol"
          title="No protocol armed"
          sub="The system runs at minimum-effective baseline. Arm a protocol from the library to populate the daily checklist."
          action={
            <div className="flex items-center gap-2">
              <button className="btn btn-primary">Browse library</button>
              <button className="btn btn-ghost">Stay at MED</button>
            </div>
          }
        />
      </Card>
    </StateBlock>

    <StateBlock kicker="Empty" title="No shopping items">
      <Card>
        <Empty
          glyph="cart"
          title="Shopping list is clear"
          sub="Add items manually, or arm a protocol to auto-generate a list from its required inputs."
          action={<button className="btn btn-primary"><Glyph name="plus" size={12} /> Add item</button>}
        />
      </Card>
    </StateBlock>

    <StateBlock kicker="Loading" title="Data loading">
      <Card label="Bloodwork · Loading">
        <div className="px-5 py-2.5 border-b divider-soft grid grid-cols-12 gap-4 items-center">
          <div className="col-span-4 label">Marker</div>
          <div className="col-span-2 label">Value</div>
          <div className="col-span-3 label">Range</div>
          <div className="col-span-1 label text-right">Trend</div>
          <div className="col-span-2 label text-right">Status</div>
        </div>
        {[0,1,2,3,4].map(i => (
          <div key={i} className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center border-b divider-soft last:border-0" style={{ minHeight: 58 }}>
            <div className="col-span-4 space-y-1.5">
              <Skeleton w={140 + (i*8)} h={13} />
              <Skeleton w={60} h={10} />
            </div>
            <div className="col-span-2"><Skeleton w={48} h={16} /></div>
            <div className="col-span-3"><Skeleton w="100%" h={8} /></div>
            <div className="col-span-1 flex justify-end"><Skeleton w={36} h={10} /></div>
            <div className="col-span-2 flex justify-end"><Skeleton w={92} h={18} /></div>
          </div>
        ))}
      </Card>
    </StateBlock>

    <StateBlock kicker="Loading" title="Card / detail loading">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card label="Synthesis · Loading">
          <div className="px-6 py-5 space-y-3">
            <Skeleton w="92%" h={14} />
            <Skeleton w="100%" h={14} />
            <Skeleton w="88%" h={14} />
            <Skeleton w="42%" h={14} />
            <div className="h-2" />
            <div className="flex gap-2">
              <Skeleton w={120} h={20} />
              <Skeleton w={100} h={20} />
              <Skeleton w={130} h={20} />
            </div>
          </div>
        </Card>
        <Card label="Protocol Score · Loading">
          <div className="px-6 py-6 flex items-center gap-6">
            <div className="w-[110px] h-[110px] hairline-soft rounded-full" style={{ background: '#141417' }} />
            <div className="flex-1 space-y-2.5">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton w={120} h={12} />
                  <Skeleton w={36} h={14} />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </StateBlock>

    <StateBlock kicker="Error" title="Data missing / corrupted">
      <Card>
        <div className="px-6 py-6 flex items-start gap-4">
          <div className="w-12 h-12 hairline sharp flex items-center justify-center text-[var(--danger)]" style={{ borderColor: 'rgba(200,69,69,0.4)', background: 'var(--danger-soft)' }}>
            <Glyph name="warning" size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-[15px] text-[var(--text)]" style={{ fontWeight: 500 }}>Local archive returned malformed JSON</h3>
              <Badge kind="avoid" dot>ERR · ARCHIVE_PARSE_FAIL</Badge>
            </div>
            <p className="text-[13px] text-[var(--text-2)] mt-2 leading-relaxed max-w-2xl">
              The system couldn't parse <span className="mono text-[var(--text)]">/archive/sources.index.json</span>. Last known good index was written 14 minutes ago. You can roll back to that snapshot or open the file for repair.
            </p>
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <button className="btn btn-primary"><Glyph name="arrowDown" size={12} /> Roll back · 14m</button>
              <button className="btn"><Glyph name="external" size={12} /> Open file</button>
              <button className="btn btn-ghost">View error log</button>
            </div>
            <details className="mt-4">
              <summary className="mono text-[11px] text-[var(--text-3)] cursor-pointer hover:text-[var(--text-2)] tracking-wider">SHOW STACK TRACE</summary>
              <pre className="mt-3 hairline-soft sharp px-4 py-3 mono text-[11px] text-[var(--text-3)] leading-relaxed overflow-x-auto">
{`SyntaxError: Unexpected token ',' in JSON at position 4218
  at JSON.parse (<anonymous>)
  at loadArchive (archive.ts:142:18)
  at Dashboard.useEffect (Dashboard.tsx:78:5)
  at commitHookEffectListMount (react-dom:19782:26)`}
              </pre>
            </details>
          </div>
        </div>
      </Card>
    </StateBlock>

    <StateBlock kicker="Error" title="Inline field / banner">
      <Card>
        <div className="px-6 py-5 space-y-5">
          <div>
            <div className="text-[13px] text-[var(--text)] mb-2" style={{ fontWeight: 500 }}>Inline field error</div>
            <Field label="Total Testosterone" hint="ng/dL" error="Value 4860 looks 10× too high. Check the decimal — typical range is 300–1000.">
              <Input defaultValue="4860" className="border-[rgba(200,69,69,0.4)]" style={{ borderColor: 'rgba(200,69,69,0.45)' }} />
            </Field>
          </div>
          <div>
            <div className="text-[13px] text-[var(--text)] mb-2" style={{ fontWeight: 500 }}>Banner — degraded sync</div>
            <div className="hairline sharp px-4 py-3 flex items-center gap-3" style={{ borderColor: 'rgba(232,177,74,0.35)', background: 'var(--warn-soft)' }}>
              <Glyph name="warning" size={14} className="text-[var(--warn)] shrink-0" />
              <span className="text-[13px] text-[var(--text)] flex-1">Biofeedback sync degraded — last update 17 min ago. Some metrics may be stale.</span>
              <button className="text-[12.5px] text-[var(--text-2)] hover:text-[var(--text)]" style={{ fontWeight: 500 }}>Retry</button>
              <button className="text-[var(--text-3)] hover:text-[var(--text)]"><Glyph name="x" size={13} /></button>
            </div>
          </div>
        </div>
      </Card>
    </StateBlock>
  </div>
);


/* ------------------------------------------------------------ */
Object.assign(window, { MobileScreen, OnboardingScreen, StatesScreen });
