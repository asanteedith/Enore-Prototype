import { dueStatus, isEscalationDue, SHIFT_START, type DueStatus } from './time'
import type { AppState, PatientId, WorkItem } from './types'

export const PATIENT_ORDER: PatientId[] = ['P-001', 'P-002', 'P-003']

export function activeItems(state: AppState): WorkItem[] {
  return state.workItems.filter((w) => w.state !== 'COMPLETED')
}

export function itemsForPatient(state: AppState, patientId: PatientId): WorkItem[] {
  return state.workItems.filter((w) => w.patientId === patientId)
}

export function itemById(state: AppState, id: string): WorkItem | undefined {
  return state.workItems.find((w) => w.id === id)
}

/** Nurse's own work she hasn't started or is actively doing. */
export function myActionItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.owner === 'Me' && (w.state === 'OPEN' || w.state === 'IN_PROGRESS'))
}

/** Nurse's own work she hasn't started at all — "needs me". */
export function needsMeItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.owner === 'Me' && w.state === 'OPEN')
}

/** True WAITING items, plus anything OPEN that isn't the nurse's own to act on. */
export function waitingOnOthers(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'WAITING' || (w.state === 'OPEN' && w.owner !== 'Me'))
}

export function watchingItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'WATCHING')
}

export function interruptedItems(state: AppState): WorkItem[] {
  return activeItems(state).filter((w) => w.state === 'INTERRUPTED')
}

export function completedItems(state: AppState): WorkItem[] {
  return state.workItems.filter((w) => w.state === 'COMPLETED')
}

export function dueStatusFor(state: AppState, item: WorkItem): DueStatus {
  return dueStatus(item.dueAt, state.nowTime)
}

export function escalationDueFor(state: AppState, item: WorkItem): boolean {
  if (item.escalated) return false
  return isEscalationDue(item.since, state.nowTime, item.escalationRule?.afterMinutes)
}

/** Worth a glance right now: waiting on someone, a real due time is close/passed, or an escalation threshold has passed. */
export function nowItems(state: AppState): WorkItem[] {
  return activeItems(state).filter(
    (w) => w.state === 'WAITING' || dueStatusFor(state, w) !== 'NONE' || escalationDueFor(state, w),
  )
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
    waiting: waitingOnOthers(state).length,
    overdue: activeItems(state).filter((w) => dueStatusFor(state, w) === 'OVERDUE').length,
    unassigned: 0,
  }
}

export function eventsForPatient(state: AppState, patientId: PatientId) {
  return state.events.filter((e) => e.patientId === patientId).sort((a, b) => a.time.localeCompare(b.time))
}

/** Clinically relevant change lines for a patient since a reference time — events plus reminders of what's still unresolved. */
export function changeLinesForPatient(
  state: AppState,
  patientId: PatientId,
  sinceTime: string,
  excludeItemId?: string,
): string[] {
  const events = state.events
    .filter((e) => e.patientId === patientId && e.time > sinceTime)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((e) => e.label)
  const ongoing = itemsForPatient(state, patientId)
    .filter((w) => w.id !== excludeItemId && w.state !== 'COMPLETED')
    .map((w) => {
      if (w.state === 'WAITING') return `${w.title} still waiting`
      if (w.state === 'WATCHING' || w.state === 'IN_PROGRESS') return `${w.title} continuing`
      return null
    })
    .filter((x): x is string => x !== null)
  return [...events, ...ongoing]
}

export interface PatientLines {
  patientId: PatientId
  lines: string[]
}

/** Home's CHANGED SINCE HANDOVER section. */
export function changedSinceHandover(state: AppState): PatientLines[] {
  return PATIENT_ORDER.map((patientId) => ({
    patientId,
    lines: changeLinesForPatient(state, patientId, SHIFT_START),
  })).filter((g) => g.lines.length > 0)
}

/** What happened for this patient specifically while an interrupted item was untouched. */
export function whileAwaySummary(state: AppState, patientId: PatientId, sinceTime: string, excludeItemId: string): string[] {
  return changeLinesForPatient(state, patientId, sinceTime, excludeItemId)
}

/** Full open ledger, regardless of who owns it — "unresolved work" without pretending it's all the nurse's. */
export function openLoopsRollup(state: AppState): PatientLines[] {
  return PATIENT_ORDER.map((patientId) => ({
    patientId,
    lines: itemsForPatient(state, patientId)
      .filter((w) => w.state !== 'COMPLETED')
      .map((w) => `${w.title}${w.owner !== 'Me' ? ` (${w.owner})` : ''}`),
  })).filter((g) => g.lines.length > 0)
}

const RESULT_STAGE_LABEL: Record<NonNullable<WorkItem['resultStage']>, string> = {
  REQUESTED: 'Requested',
  WAITING: 'Waiting for lab',
  AVAILABLE: 'Result available',
  REVIEWED: 'Reviewed',
  CLOSED: 'Closed',
}

export function resultStageLabel(item: WorkItem): string | undefined {
  return item.resultStage ? RESULT_STAGE_LABEL[item.resultStage] : undefined
}

export interface DependencyInfo {
  item: WorkItem
  blocking: boolean
}

export function dependencyInfo(state: AppState, item: WorkItem): DependencyInfo | undefined {
  if (!item.dependsOn) return undefined
  const dep = itemById(state, item.dependsOn)
  if (!dep) return undefined
  const blocking = dep.resultStage ? dep.resultStage !== 'REVIEWED' && dep.resultStage !== 'CLOSED' : dep.state !== 'COMPLETED'
  return { item: dep, blocking }
}

function describeForHandover(item: WorkItem): string {
  switch (item.state) {
    case 'WAITING':
      return `${item.title} — waiting${item.waitingFor ? ` for ${item.waitingFor}` : ''}${item.since ? ` since ${item.since}` : ''}`
    case 'IN_PROGRESS':
      return `${item.title} — in progress (${item.owner})`
    case 'INTERRUPTED':
      return `${item.title} — interrupted, needs resuming`
    case 'WATCHING':
      return `${item.title} — ongoing`
    default:
      return `${item.title} — open${item.owner !== 'Me' ? ` (${item.owner})` : ''}`
  }
}

export interface HandoverLine {
  id: string
  text: string
  derived: boolean
  itemId?: string
}

/** Handover is generated from live work state, not a separately maintained checklist. */
export function handoverLinesForPatient(state: AppState, patientId: PatientId): HandoverLine[] {
  const derived: HandoverLine[] = itemsForPatient(state, patientId)
    .filter((w) => w.state !== 'COMPLETED' && !state.handoverHiddenItemIds.includes(w.id))
    .map((w) => ({ id: `derived-${w.id}`, text: describeForHandover(w), derived: true, itemId: w.id }))
  const extra: HandoverLine[] = (state.handoverExtraNotes[patientId] ?? []).map((text, i) => ({
    id: `extra-${patientId}-${i}`,
    text,
    derived: false,
  }))
  return [...derived, ...extra]
}
