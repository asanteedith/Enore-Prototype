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

## Two experiences, one shared state

The Start screen picks a persona — the two share the exact same `DemoContext` state, not separate datasets:

- **Edith — Staff Nurse.** Her Personal Workspace (Now / Beds / Work / Team / Handover) is the original demo
  journey below. She can step into the full Team Workspace from a card on her Team tab.
- **Ama — Nurse In-Charge.** Enters directly into **Team Workspace** (Home / Work / Contexts / People) —
  ward-wide operational awareness: what's unassigned, waiting, escalated, and what needs to happen next.

A **"Switch to Ama / Switch to Edith"** link sits beneath the device frame, next to Reset — it swaps which
persona you're viewing as *without* resetting the underlying data, so you can complete something as Edith and
immediately see it land in Ama's Team Workspace. **Reset demo** wipes state back to the initial seed for both.

## The Personal Workspace demo journey (Edith)

Tap **Start demo → Continue as Edith**, then walk through:

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

## The Team Workspace demo journey (Ama)

Tap **Start demo → Continue as Ama**:

1. **Team Home** — stat tiles (needs attention / in progress / waiting / escalated / unassigned) and the most
   urgent work, sorted escalations-first.
2. **Team Work** — every shared work item, with a **Team work / My view** toggle. Unassigned items offer
   **Take responsibility**; items with a `waitingOn` reason offer **Chase**.
3. **Care Contexts** — the same 3 beds plus a non-bed context (**Theatre — Case 3**), proving Team Workspace
   isn't a bed-management screen. Tapping one shows every work item tied to it.
4. **People** — who's on shift, plus cards into **Handover** (shared with Edith's) and **Meetings**.
5. **Workflow Agent** (team mode) — "Prepare the work status for this shift" (a live stat report with
   Review/Approve), "Prepare the next-shift handover" (reuses the same Handover screen), and "Announce
   tomorrow's ward meeting at 2 PM" (Edit/Post). Prepare → review → approve throughout; nothing auto-executes.
6. **Meetings** — one fixed demo meeting (discussion / decision / action / follow-up). **Add to Team Work**
   turns the meeting's action into a real, reviewable work item.
7. **Join a Team Workspace** (from Start) — scan/link/search → workspace found → request to join → approval →
   member. A QR code or link finds a workspace; it never grants membership by itself.

## Structure

```
src/
  state/        demo data model, reducer, selectors, lightweight intent detection
  components/   reusable design-system pieces (AppShell, MobileFrame, WorkItemRow, CaptureInput, StatTile, …)
  screens/      one file per screen — Personal Workspace screens plus Team* screens
  styles/       design tokens, global reset, component + screen styles, team.css for Team Workspace
```

State lives in a single React Context (`DemoContext`) backed by `useReducer` — one in-memory work state.
Team Workspace introduces no parallel data model: bed-linked work items keep using `bedId` exactly as
Edith's screens always have; new team-only items (not every one has a bed) carry an optional `contextId`
instead, resolved through `careContexts` — a superset that mirrors every bed plus non-bed contexts. A safe
`contextLabelFor` helper means neither Edith's nor Ama's screens ever assume an item has a bed. Nothing is
persisted between page loads; **Reset demo** re-seeds the initial state for both personas.

## What this deliberately does not include

No backend, database, real authentication, real AI/LLM calls, offline sync, EHR integration, real QR/camera
scanning, or real audio transcription. Clinical Knowledge AI is a static stub distinguished visually from the
Workflow Agent — it never touches work state. There is one fixed demo meeting, not a meeting list; the join
flow is a deterministic mock, not real membership/auth.
