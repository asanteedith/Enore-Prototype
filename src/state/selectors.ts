import type { AppState, PatientId, WorkItem } from './types'

export function activeItems(state: AppState): WorkItem[] {
  return state.workItems.filter((w) => w.state !== 'DONE')
}

export function itemsForPatient(state: AppState, patientId: PatientId): WorkItem[] {
  return state.workItems.filter((w) => w.patientId === patientId)
}

export function nowItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.showInNow)
}

export function nextItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'NEXT')
}

export function waitingItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'WAITING')
}

export function overdueItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.overdue)
}

export function doneItems(state: AppState): WorkItem[] {
  return state.workItems.filter((w) => w.state === 'DONE')
}

export function openItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'OPEN')
}

export function patientsNeedingAttention(state: AppState): PatientId[] {
  const ids = new Set<PatientId>()
  nowItems(state).forEach((w) => ids.add(w.patientId))
  return Array.from(ids)
}

export interface NowSummary {
  patientCount: number
  needAttention: number
  waiting: number
  overdue: number
  unassigned: number
}

export function nowSummary(state: AppState): NowSummary {
  return {
    patientCount: Object.keys(state.patients).length,
    needAttention: patientsNeedingAttention(state).length,
    waiting: waitingItems(state).length,
    overdue: overdueItems(state).length,
    unassigned: 0,
  }
}

export function recentChanges(state: AppState, limit = 5) {
  return [...state.events]
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, limit)
}

export function eventsForPatient(state: AppState, patientId: PatientId) {
  return state.events
    .filter((e) => e.patientId === patientId)
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function openLoopsForPatient(state: AppState, patientId: PatientId): WorkItem[] {
  return itemsForPatient(state, patientId).filter((w) => w.state !== 'DONE')
}

export function handoverLinesFor(state: AppState, patientId: PatientId): string[] {
  return state.handoverNotes[patientId] ?? []
}
