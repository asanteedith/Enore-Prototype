# Enore — Founding Community Demo Prototype

A standalone, interactive walkthrough of one Enore nursing-shift moment, built to show nurses, healthcare
professionals, and partners what the product feels like — without any production dependencies.

This is **not** the production Enore application. It has no backend, no real AI, no persistence beyond the
current browser tab, and it does not import anything from the production Enore codebase.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. The prototype renders inside a centered mobile device frame (390×844) — it is not
meant to fill the browser window.

```bash
npm run build   # production build, output in dist/
npm run lint    # oxlint
```

## The demo journey

Tap **Start demo**, then walk through:

1. **Now** — what matters right now for Edith's shift.
2. Tap **Bed 08** → its care context (dressing due).
3. **Start work** → the work state changes to in progress.
4. **Capture update** → **Quick capture**. Type `Bed 08 dressing completed.`
5. Enore detects the work described (bed and work item are already known — no destination to pick) →
   **Confirm**.
6. See the confirmation state, then jump to **Work**, **Bed 08**'s care context, **Team**, and **Handover** —
   the same single event is reflected everywhere, without re-entering it.
7. Open the **Workflow Agent** (icon, top right) and ask what's outstanding, or ask for a handover summary.
8. **Reset demo** (small link beneath the device frame) restarts the whole scenario from scratch.

The interaction detects a few other verbs too (`defer`, `escalate`) if you want to try alternate captures on
Bed 11 or Bed 14, but the scripted Bed 08 → completed path is the one built and tested end-to-end.

## Structure

```
src/
  state/        demo data model, reducer, selectors, lightweight intent detection
  components/   reusable design-system pieces (AppShell, MobileFrame, WorkItemRow, CaptureInput, …)
  screens/      one file per screen in the journey
  styles/       design tokens, global reset, component styles, screen styles
```

State lives in a single React Context (`DemoContext`) backed by `useReducer` — one in-memory work state, with
Now / Beds / Work / Team / Handover / Workflow Agent all reading views over it. Nothing is persisted between
page loads; **Reset demo** re-seeds the initial state.

## What this deliberately does not include

No backend, database, real authentication, real AI/LLM calls, offline sync, or EHR integration. Clinical
Knowledge AI is a static stub distinguished visually from the Workflow Agent — it never touches work state.
