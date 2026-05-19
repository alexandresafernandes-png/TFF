# TFF — Design System
**Product:** TFF (The Founder's Framework / private biohacking command center)
**Version:** v1.0 — Design Lock
**Source:** AestheticVillain_v2 HTML + components-v2.jsx + screens-v2.jsx + app-v2.jsx
**Rule:** Do not redesign. Do not change visual identity. Implement exactly as specified.

---

## 1. Product Identity

- **App name visible in UI:** TFF
- **Old prototype name:** VILLAIN.OS — treat as dead naming. Remove from all visible UI.
- **Personality:** Dark underground private command center. Tactical. Dense. Not gamer. Not medical SaaS. Not generic health app.
- **Footer text (desktop):** `TFF · BUILT FOR ONE OPERATOR · NOT FOR DISTRIBUTION`
- **Target feel:** Private operator dashboard. Personal knowledge weapon.

---

## 2. Color Palette

### CSS Custom Properties (apply to `:root`)

```css
--bg:           #0a0a0c;   /* Page background */
--panel:        #101013;   /* Sidebar, top panels */
--card:         #141417;   /* Primary card surface */
--card-2:       #18181c;   /* Nested card / inner surface */
--border:       #26262c;   /* Standard hairline border */
--border-soft:  #1c1c21;   /* Subtle divider */

--text:         #ececef;   /* Primary text */
--text-2:       #b6b6bd;   /* Secondary — nav items, body copy */
--text-3:       #8a8a92;   /* Tertiary — labels, column headers */
--text-4:       #5a5a62;   /* Hint only — placeholder, disabled */

/* Accent: Toxic Green (default) */
--accent:       #9bd34a;
--accent-ink:   #0c1305;   /* Text ON accent bg */
--accent-soft:  rgba(155, 211, 74, 0.10);
--accent-line:  rgba(155, 211, 74, 0.32);

/* Semantic */
--warn:         #e8b14a;
--warn-soft:    rgba(232, 177, 74, 0.10);
--danger:       #c84545;
--danger-soft:  rgba(200, 69, 69, 0.10);
```

### Accent Themes (operator-selectable)
| Key | Name | Hex |
|-----|------|-----|
| `toxic` | TOXIC | `#9bd34a` |
| `blood` | BLOOD | `#c84545` |
| `bone` | BONE | `#d6d2c4` |
| `cyanide` | CYANIDE | `#7ad6c4` |

Default accent: `toxic`. Store selection in localStorage only (UI preference, not Supabase).

### Ink Scale (Tailwind extended)
```
ink-950: #08080a
ink-900: #0b0b0d
ink-850: #101013
ink-800: #131316
ink-750: #17171b
ink-700: #1c1c21
ink-600: #26262c
ink-500: #3a3a42
ink-400: #5a5a64
ink-300: #86868f
ink-200: #a8a8b0
ink-100: #d4d4d8
ink-50:  #ececef
```

---

## 3. Typography

### Fonts
- **Primary:** Geist (sans-serif) — weights 300, 400, 500, 600, 700
- **Monospace:** JetBrains Mono — weights 400, 500, 600
- Google Fonts import: `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap`

### Type Scale (CSS vars)
```css
--t-display: 28px;   /* Page/section hero */
--t-h1:      20px;   /* Screen title */
--t-h2:      16px;   /* Card header */
--t-h3:      14px;   /* Sub-header */
--t-body:    13.5px; /* Body text */
--t-small:   12.5px; /* Secondary info */
--t-micro:   11px;   /* Micro/hints */
```

### Body Defaults
```css
font-family: 'Geist', system-ui, sans-serif;
font-feature-settings: 'ss01' on, 'cv11' on;
letter-spacing: -0.005em;
-webkit-font-smoothing: antialiased;
font-size: 13.5px;
line-height: 1.5;
```

### Label Class (section/column headers ONLY)
```css
.label {
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10.5px;
  color: var(--text-3);
  font-weight: 500;
}
```
**Reserved strictly for:** section headings, table column headers. Not for inline KV pairs.

### KV Label (inline key-value)
```css
.kv-label {
  font-size: 12.5px;   /* --t-small */
  color: var(--text-3);
  letter-spacing: 0;
}
```

### Mono Utility
```css
.mono {
  font-family: 'JetBrains Mono', monospace;
  font-feature-settings: 'tnum' on;
}
```

---

## 4. Spacing System (8pt base)

```css
--s-1: 4px
--s-2: 8px
--s-3: 12px
--s-4: 16px
--s-5: 20px
--s-6: 24px
--s-7: 32px
--s-8: 40px
--s-9: 56px
```

### Row Heights
- Standard row: `min-height: 56px`
- Tight row: `min-height: 44px`

### Stack Utilities
- `.stack-md > * + *` → `margin-top: 20px`
- `.stack-lg > * + *` → `margin-top: 28px`

### Card Padding (density-aware)
```
compact:     card-pad=14px/16px  card-pad-tight=10px/14px
comfortable: card-pad=20px/22px  card-pad-tight=14px/18px
roomy:       card-pad=26px/28px  card-pad-tight=18px/22px
```
Apply via `data-density` attribute on `<body>`.

---

## 5. Surface Classes

```css
.card    { background: var(--card);   border: 1px solid var(--border); border-radius: 6px; }
.card-2  { background: var(--card-2); border: 1px solid var(--border); border-radius: 6px; }
.panel   { background: var(--panel); }
.hairline      { border: 1px solid var(--border); }
.hairline-soft { border: 1px solid var(--border-soft); }
.sharp   { border-radius: 4px; }
```

### Texture Effects
- **Film grain:** `grain` class on `<body>` — SVG noise overlay at 0.45 opacity, `mix-blend-mode: screen`
- **Sidebar scanlines:** `scan` class — `linear-gradient` 1px/3px pattern at ~1.2% white
- **Card hairline grid:** `grid-faint` class — 32×32px faint grid at ~1.4% white

---

## 6. Buttons

```css
/* Base */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'Geist', sans-serif; font-size: 12.5px;
  padding: 8px 14px; border-radius: 4px;
  border: 1px solid var(--border); color: var(--text);
  background: #181820; font-weight: 500;
  transition: background 120ms, border-color 120ms;
}
.btn:hover { background: #1f1f27; border-color: #34343c; }

/* Variants */
.btn-primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
.btn-primary:hover { filter: brightness(1.08); }
.btn-ghost   { background: transparent; }
.btn-ghost:hover { background: rgba(255,255,255,0.025); }
.btn-danger  { color: var(--danger); border-color: rgba(200,69,69,0.4); background: var(--danger-soft); }

/* Size modifier */
.btn-sm { padding: 6px 10px; font-size: 12px; }
```

---

## 7. Badges

Base badge class:
```css
.badge {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 4px 9px; border-radius: 3px;
  border: 1px solid var(--border); color: var(--text-2);
  background: rgba(255,255,255,0.01); white-space: nowrap;
  line-height: 1; font-weight: 500;
}
.badge .dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
```

### Status Badge Mapping

| Status | Class | Color | Border | Background |
|--------|-------|-------|--------|------------|
| `APPROVED_CORE` | `.badge-core` | `var(--accent)` | `var(--accent-line)` | `var(--accent-soft)` |
| `APPROVED_CONTEXT` | `.badge-warn` | `var(--warn)` | `rgba(232,177,74,0.36)` | `var(--warn-soft)` |
| `PREP_REQUIRED` | `.badge-prep` | `#d2d2d8` | `var(--border)` | transparent |
| `AVOID` | `.badge-avoid` | `var(--danger)` | `rgba(200,69,69,0.36)` | `var(--danger-soft)` |
| `DEPENDS` | `.badge-depends` | `#d2d2d8` | `var(--border)` | transparent |
| `NOT_MENTIONED` | `.badge-na` | `var(--text-3)` | `var(--border-soft)` | transparent |

### Phase Badge Mapping

| Phase | Display Label | Style |
|-------|--------------|-------|
| `phase_1` | `PHASE 1` | `.badge` default |
| `phase_2` | `PHASE 2` | `.badge-warn` |
| `phase_3` | `PHASE 3` | `.badge-na` |

### Supplement Tier Badges

| Tier | Display | Style |
|------|---------|-------|
| `TIER_1` | `TIER 1` | `.badge-core` |
| `TIER_2` | `TIER 2` | `.badge-warn` |
| `TIER_3` | `TIER 3` | `.badge-depends` |
| `OPTIONAL` | `OPTIONAL` | `.badge-na` |
| `CONTEXT_DEPENDENT` | `CONTEXT` | `.badge-prep` |

---

## 8. Sidebar

**Width:** 220px (desktop fixed left)
**Background:** `var(--panel)` with `scan` scanline texture
**Border-right:** `1px solid var(--border)`

### Nav Item
```css
.nav-item {
  color: var(--text-2);
  border-left: 2px solid transparent;
  padding: 9px 16px;
}
.nav-item:hover { color: var(--text); background: rgba(255,255,255,0.018); }
.nav-item[data-active="true"] {
  color: var(--text);
  background: linear-gradient(90deg, var(--accent-soft), transparent 70%);
  border-left-color: var(--accent);
}
.nav-item[data-active="true"] .nav-glyph { color: var(--accent); }
```

### Sidebar Header
- Top: TFF logo/wordmark in `var(--text)` (Geist, ~14px, weight 600)
- Below: operator status indicator — small accent dot + mono micro text
- Bottom section: version/build label in mono micro text

### Nav Groups
Phase 1 nav items (in order):
1. Dashboard (keyboard: `1`)
2. Knowledge Search (`2`)
3. Daily Checklist (`3`)
4. Protocol Library (`4`)
5. Nutrition & Cooking (`5`)
6. Supplements (`6`)
7. Bloodwork (`7`)
8. Shopping List (`8`)
9. Routines (`9`)
10. Sources / References (`0`)

Separator before Settings group.

---

## 9. Topbar

**Height:** ~52px
**Background:** `var(--panel)` or transparent over `var(--bg)`
**Border-bottom:** `1px solid var(--border)`

Contents (left to right):
- Breadcrumb crumb string in mono label style (e.g. `INDEX · 01 / DASHBOARD`)
- Page title in Geist 500 ~16px
- Right slot: action buttons (screen-specific), ⌘K search, date display

---

## 10. Mobile Bottom Navigation

**Visible:** mobile only (`< 768px`) — sidebar hidden on mobile
**Height:** 56px + safe-area-inset-bottom
**Background:** `var(--panel)`
**Border-top:** `1px solid var(--border)`
**Items:** 4 primary tabs + "More" tab

Primary bottom nav tabs:
1. Dashboard
2. Checklist
3. Search
4. More (opens More Sheet)

### More Sheet (mobile)
Full-height bottom sheet with remaining nav items.
**Background:** `var(--panel)`
**Handle bar:** centered 40×4px pill in `var(--border)`
Drag-to-dismiss or tap outside.

---

## 11. Drawers / Modals

### Drawer (detail panels)
- **Desktop:** slides in from right, ~480px wide, over main content
- **Mobile:** full-height bottom sheet (like More Sheet)
- **Backdrop:** `rgba(0,0,0,0.5)` with `backdrop-filter: blur(2px)`
- **Background:** `var(--panel)`
- **Border:** left/top `1px solid var(--border)`
- **Close:** X button top-right OR swipe down (mobile)

### Modal (confirmations, simple inputs)
- **Desktop:** centered, max-width 440px
- **Background:** `var(--card)`
- **Border:** `1px solid var(--border)`
- **Border-radius:** 8px
- **Backdrop:** same as drawer

---

## 12. Tables

Row structure:
```
- border-bottom: 1px solid var(--border-soft)
- min-height: 56px (standard) or 44px (tight)
- padding: 0 16px
- hover: background rgba(255,255,255,0.012)
```

Column headers: `.label` class
Cell text: `var(--text)` primary, `var(--text-2)` secondary
Last column: action buttons or badges right-aligned

---

## 13. Forms & Inputs

```css
input, select, textarea {
  background: #0e0e11;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text);
  font-family: 'Geist', sans-serif;
  font-size: 13.5px;
  padding: 8px 12px;
}
input:focus { border-color: var(--accent); outline: none; }
input::placeholder { color: var(--text-4); }
```

---

## 14. Progress Bars

```css
.bar-track {
  background: #1a1a1f;
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  height: 7px;
  overflow: hidden;
}
.bar-fill {
  background: var(--accent);
  height: 100%;
  border-radius: 999px;
  transition: width 200ms ease;
}
```

Danger variant: replace `var(--accent)` with `var(--danger)` when value is in avoid range.
Warn variant: replace with `var(--warn)` when in caution zone.

---

## 15. Tabs

```css
.tab {
  font-family: 'Geist', sans-serif;
  font-size: 12.5px; letter-spacing: 0;
  color: var(--text-3); padding: 10px 0;
  border-bottom: 1px solid transparent;
  font-weight: 500;
}
.tab[data-on="true"] { color: var(--text); border-bottom-color: var(--accent); }
.tab:hover { color: var(--text-2); }
```

Tab bar: `border-bottom: 1px solid var(--border)` on container. Gap between tabs: 24px.

---

## 16. Checkbox / Tick

```css
.tick {
  width: 18px; height: 18px;
  border: 1px solid var(--border);
  border-radius: 3px;
  background: #0e0e11;
  display: inline-flex; align-items: center; justify-content: center;
  transition: background 120ms, border-color 120ms;
}
.tick:hover { border-color: #3a3a42; }
.tick[data-on="true"] { background: var(--accent); border-color: var(--accent); }
.tick[data-on="true"] svg { color: var(--accent-ink); }
```

---

## 17. KBD / Code Chip

```css
.kbd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px; color: var(--text-3);
  border: 1px solid var(--border-soft);
  padding: 3px 7px; border-radius: 3px;
  background: rgba(255,255,255,0.01);
  letter-spacing: 0.05em;
}
```

---

## 18. Loading / Empty / Error States

### Skeleton Loading
```css
.skeleton {
  background: linear-gradient(90deg,
    var(--card) 25%,
    var(--card-2) 50%,
    var(--card) 75%
  );
  background-size: 200% 100%;
  animation: skel 1.4s ease infinite;
  border-radius: 3px;
}
@keyframes skel {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Empty State
```
- Centered in content area
- Icon: 24px, color var(--text-4)
- Heading: var(--text-2), 14px
- Sub: var(--text-3), 12.5px
- No illustration. No emoji. Keep it tactical.
```

### Error State
```
- Same layout as empty state
- Icon: warning glyph in var(--danger)
- Message: "Could not load — check data source."
- Retry button: .btn .btn-sm
```

---

## 19. Scrollbar

```css
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1c1c22; border-radius: 6px; border: 2px solid var(--bg); }
::-webkit-scrollbar-thumb:hover { background: #2a2a32; }
```

---

## 20. Selection

```css
::selection { background: var(--accent); color: var(--accent-ink); }
```

---

## 21. Density System

Applied via `data-density` attribute on `<body>`:
- `compact` — tight row heights, minimal padding
- `comfortable` — default/balanced
- `roomy` — generous spacing

Store selection in localStorage (`tff_density`).

---

## 22. Caps Mode

Applied via `data-caps` on `<body>`:
- `on` — uppercase labels (default)
- `off` — label text stays sentence case, letter-spacing reduced to 0.01em

Store in localStorage (`tff_caps`).

---

## 23. Global Constraints

- **No neon overload.** Accent appears on: active nav border, badge fills, progress bars, primary buttons, checked ticks. Nowhere else unless intentional.
- **No medical SaaS look.** No blue/white clinical UI. No charts unless data demands it.
- **No gamer aesthetics.** No glitch effects. No animated text. No excessive scanlines.
- **No calorie tracker UI.** No macro rings/dials unless Phase 2 Macro system is implemented.
- **Border-radius:** 4–6px max. No rounded-xl.
- **Shadows:** Not used on cards. Use border only.
- **Animations:** 120–200ms max, ease or ease-in-out. No bouncy springs.
