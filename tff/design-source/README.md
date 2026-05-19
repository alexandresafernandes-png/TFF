# /design-source — Reference Files

This folder holds the original design prototype source files.

## Files expected here (add when available)

- `AestheticVillain_v2.html` — original HTML prototype
- `app-v2.jsx` — original app component
- `components-v2.jsx` — original component library
- `screens-v2.jsx` — original screen definitions
- `screens-extras-v2.jsx` — additional screen variants
- `flow-showcase-v2.jsx` — flow/navigation showcase

**These files were not present in the uploaded packages and must be added manually.**

---

## ⚠️ Priority Rules — READ BEFORE USING

These files are **reference only**. They are the design origin, not the implementation spec.

When any conflict exists between these files and the spec docs, resolve in this order:

1. `/design/IMPLEMENTATION_RULES.md` — **wins always**
2. `/design/DESIGN_SYSTEM.md` — wins over screens/source
3. `/design/APP_SCREENS.md` — wins over source files
4. `/design-source/*` — reference only, lowest priority

Do not copy code from design-source into production without reconciling against IMPLEMENTATION_RULES.md first.
