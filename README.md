# ENORE — Solo Nurse Personal Workspace Prototype

A high-fidelity, functional mobile-first prototype of ENORE's **Personal Workspace** — a clinical
work-orchestration tool for a single nurse working a shift, built to test the core idea before any team or
hospital-wide functionality exists.

ENORE is **not** an EHR, not a hospital management system, not a generic task manager, and not a generic AI
chatbot. It is a workspace built around **Clinical Work-State**: what's happening now, what needs the nurse,
what she's waiting on, what's overdue, and what she'll need to hand over.

All data is synthetic. No real patient names, records, or images are used. The app is clearly labelled
**SYNTHETIC DATA · NOT FOR CLINICAL USE** throughout.

## Run it

```bash
npm install
npm run dev
```

Open the printed local URL. The prototype renders inside a centered mobile device frame (390×844).

```bash
npm run build   # production build, output in dist/
npm run lint    # oxlint
```

## The scenario

A nurse begins a **Morning Shift (07:00–15:00)** on a **Surgical Ward** with three patients handed over to her:

- **P-001 · Bed 4** — day 2 after open appendicectomy. Comfortable, mobilising and due observations today.
- **P-002 · Bed 9** — day 1 after bowel resection. Restless, painful overnight, wound review requested from
  the doctor but not yet done — this is the shift's main open loop.
- **P-003 · Bed 12** — admitted overnight with abdominal pain, penicillin allergy, NPO, bloods pending,
  consent not signed, possible theatre.

## Structure

The five-tab Personal Workspace:

- **Home** — the one-second glance: a NOW summary (patients / need attention / waiting / overdue /
  unassigned), then NOW, NEXT, WAITING, OVERDUE and CHANGES sections.
- **Patients** — the three patients, each flagged with overdue/waiting counts, opening into a **Patient
  workspace**: Current State (what's true about the patient) kept visually separate from Work State (what's
  open, who owns it, what it's waiting on), Recent Events, and Open Loops.
- **Work** — every active work item grouped by state (NOW / NEXT / WAITING / OVERDUE / DONE), each showing
  patient, work, state, owner, dependency and time.
- **Paper** — a personal, per-bed digital paper sheet (write / underline / circle / highlight / erase).
  Nothing written here becomes workflow state automatically — the nurse chooses what to **Add to Work**.
- **Handover** — her open work, auto-grouped by patient into a handover she can edit before completing the
  shift. ENORE never sends it automatically.

**Quick Capture** (the `+` in the header) lets the nurse record what happened in a couple of taps. If the
text plausibly resolves an open item — e.g. "Doctor reviewed the wound" — ENORE offers to mark that item
done; it never completes work without her confirming (a request is not the same as completion).

**ENORE Assist** (the small assistant icon) only organizes what's already in the workflow — "what's still
open", "what's waiting", "what's overdue", a handover summary. It never diagnoses, prescribes, or makes
clinical decisions.

## Demo journey

1. **Begin shift** → land straight in the Personal Workspace, Home tab.
2. See P-002's wound review sitting in NOW / WAITING / OVERDUE.
3. Open **P-002** → Current State vs. Work State, shown separately.
4. **Capture update** → type "Doctor reviewed the wound" → ENORE suggests completing the wound review →
   confirm → the item moves **WAITING → DONE** and disappears from Home/Work's open sections.
5. Open **P-003** → blood results still pending, theatre decision and consent still open.
6. Visit **Paper** → jot a personal note on a bed's sheet, try underline/circle/highlight, optionally
   **Add to Work**.
7. Return to **Home** — the workspace reflects the change.
8. Open **Handover** at end of shift — unresolved work is grouped by patient and ready to edit before
   **Complete shift**.

## What this deliberately does not include

No Team Workspace, no Nurse In-Charge dashboard, no hospital administration, billing, staffing, or scheduling
screens, no EHR replacement, no autonomous clinical decision-making, no AI diagnosis/prescribing, and no real
integrations. This is a single-nurse, single-shift prototype only.

## Tech

React + TypeScript + Vite, no backend. All state lives in a single `useReducer`-backed context
(`src/state/AppContext.tsx`); nothing persists between page loads.
