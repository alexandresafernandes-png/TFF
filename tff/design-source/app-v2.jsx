// ---------- VILLAIN.OS app shell ----------
const { useState, useEffect, useMemo } = React;

const ACCENTS = {
  toxic:  { name: 'TOXIC',  accent: '#9bd34a', ink: '#0c1305', soft: 'rgba(155,211,74,0.10)', line: 'rgba(155,211,74,0.35)' },
  blood:  { name: 'BLOOD',  accent: '#c84545', ink: '#1a0606', soft: 'rgba(200,69,69,0.10)',  line: 'rgba(200,69,69,0.40)'  },
  bone:   { name: 'BONE',   accent: '#d6d2c4', ink: '#0e0e10', soft: 'rgba(214,210,196,0.08)',line: 'rgba(214,210,196,0.30)'},
  cyanide:{ name: 'CYANIDE',accent: '#7ad6c4', ink: '#04130f', soft: 'rgba(122,214,196,0.10)',line: 'rgba(122,214,196,0.35)'},
};

const SCREEN_META = {
  dashboard:  { title: 'Operator Dashboard',     crumb: 'INDEX · 01 / DASHBOARD' },
  search:     { title: 'Knowledge Search',       crumb: 'INDEX · 02 / SEARCH' },
  checklist:  { title: 'Daily Checklist',        crumb: 'INDEX · 03 / CHECKLIST' },
  protocols:  { title: 'Protocol Library',       crumb: 'INDEX · 04 / PROTOCOLS' },
  nutrition:  { title: 'Nutrition & Cooking',    crumb: 'INDEX · 05 / NUTRITION' },
  supplements:{ title: 'Supplement Stacks',      crumb: 'INDEX · 06 / SUPPLEMENTS' },
  bloodwork:  { title: 'Bloodwork Panel',        crumb: 'INDEX · 07 / BLOODWORK' },
  shopping:   { title: 'Shopping List',          crumb: 'INDEX · 08 / SHOPPING' },
  experiments:{ title: 'Self-Experiments',       crumb: 'INDEX · 09 / EXPERIMENTS' },
  notes:      { title: 'Notes',                  crumb: 'INDEX · 10 / NOTES' },
  'flow-search':    { title: 'Knowledge Search · Detail', crumb: 'FLOWS · 01 / SEARCH DETAIL' },
  'flow-bloodwork': { title: 'Bloodwork · Input Flow',    crumb: 'FLOWS · 02 / BLOODWORK INPUT' },
  mobile:     { title: 'Mobile Dashboard',       crumb: 'FLOWS · MOBILE' },
  onboarding: { title: 'Onboarding · Setup',     crumb: 'FLOWS · ONBOARDING' },
  states:     { title: 'States Gallery',         crumb: 'FLOWS · STATES' },
  system:     { title: 'Design System',          crumb: 'SYSTEM · DESIGN TOKENS' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "toxic",
  "density": "comfortable",
  "caps": true,
  "grain": true,
  "scanlines": true
}/*EDITMODE-END*/;

const App = () => {
  const [route, setRoute] = useState('dashboard');
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply accent + density to :root
  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.toxic;
    document.documentElement.style.setProperty('--accent', a.accent);
    document.documentElement.style.setProperty('--accent-ink', a.ink);
    document.documentElement.style.setProperty('--accent-soft', a.soft);
    document.documentElement.style.setProperty('--accent-line', a.line);
    document.body.setAttribute('data-density', tweaks.density);
    document.body.setAttribute('data-caps', tweaks.caps ? 'on' : 'off');
    document.body.classList.toggle('grain', !!tweaks.grain);
  }, [tweaks]);

  // Keyboard nav
  useEffect(() => {
    const map = { '1': 'dashboard', '2': 'search', '3': 'checklist', '4': 'protocols', '5': 'nutrition', '6': 'supplements', '7': 'bloodwork', '8': 'shopping', '9': 'experiments', '0': 'notes' };
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (map[e.key]) setRoute(map[e.key]);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const meta = SCREEN_META[route];

  const renderScreen = () => {
    const goto = setRoute;
    switch (route) {
      case 'dashboard':   return <DashboardScreen goto={goto} />;
      case 'search':      return <SearchScreen goto={goto} />;
      case 'checklist':   return <ChecklistScreen />;
      case 'protocols':   return <ProtocolScreen goto={goto} />;
      case 'nutrition':   return <NutritionScreen />;
      case 'supplements': return <SupplementsScreen />;
      case 'bloodwork':   return <BloodworkScreen />;
      case 'shopping':    return <ShoppingScreen />;
      case 'experiments': return <ExperimentsScreen />;
      case 'notes':       return <NotesScreen />;
      case 'flow-search':    return <SearchDetailFlow />;
      case 'flow-bloodwork': return <BloodworkFlow />;
      case 'mobile':      return <MobileScreen />;
      case 'onboarding':  return <OnboardingScreen />;
      case 'states':      return <StatesScreen />;
      case 'system':      return <DesignSystemScreen />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex" data-screen-label={`VILLAIN · ${route.toUpperCase()}`}>
      <Sidebar active={route} onNav={setRoute} />
      <div className="flex-1 min-w-0">
        <Topbar
          title={meta.title}
          crumb={meta.crumb}
          right={
            <div className="hidden md:flex items-center gap-2">
              <button className="btn btn-ghost"><Glyph name="search" size={11} /> ⌘K</button>
              <button className="btn btn-ghost"><Glyph name="calendar" size={11} /> MAY 18</button>
            </div>
          }
        />
        <div className="relative" style={{ zIndex: 2 }}>{renderScreen()}</div>
        <footer className="px-7 py-5 border-t divider mt-6 flex items-center justify-between">
          <div className="mono text-[10px] text-ink-500 tracking-[0.18em]">VILLAIN.OS · BUILT FOR ONE OPERATOR · NOT FOR DISTRIBUTION</div>
          <div className="mono text-[10px] text-ink-500 tracking-[0.18em]">END OF FILE</div>
        </footer>
      </div>

      {/* Tweaks Panel */}
      <TweaksPanel>
        <TweakSection label="Accent">
          <TweakColor
            label="Operator color"
            value={ACCENTS[tweaks.accent].accent}
            options={Object.values(ACCENTS).map(a => a.accent)}
            onChange={(hex) => {
              const key = Object.keys(ACCENTS).find(k => ACCENTS[k].accent === hex) || 'toxic';
              setTweak('accent', key);
            }}
          />
        </TweakSection>

        <TweakSection label="Display">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[
              { label: 'Tight', value: 'compact' },
              { label: 'Reg',   value: 'comfortable' },
              { label: 'Roomy', value: 'roomy' },
            ]}
            onChange={(v) => setTweak('density', v)}
          />
          <TweakToggle
            label="Uppercase labels"
            value={tweaks.caps}
            onChange={(v) => setTweak('caps', v)}
          />
          <TweakToggle
            label="Film grain"
            value={tweaks.grain}
            onChange={(v) => setTweak('grain', v)}
          />
        </TweakSection>

        <TweakSection label="Jump To Screen">
          <TweakButton label="Dashboard" onClick={() => setRoute('dashboard')} />
          <TweakButton label="Knowledge Search" onClick={() => setRoute('search')} />
          <TweakButton label="Daily Checklist" onClick={() => setRoute('checklist')} />
          <TweakButton label="Protocol Detail" onClick={() => setRoute('protocols')} />
          <TweakButton label="Bloodwork" onClick={() => setRoute('bloodwork')} />
          <TweakButton label="Nutrition" onClick={() => setRoute('nutrition')} />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
