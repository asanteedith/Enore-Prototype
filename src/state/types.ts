export type PatientId = 'P-001' | 'P-002' | 'P-003'

/**
 * Lifecycle states for a unit of clinical WORK — not the patient, not a task.
 * DUE/OVERDUE/ESCALATION are never stored here: they are derived from a real
 * dueAt/escalationRule so urgency can never be manufactured (see time.ts).
 */
export type WorkState = 'OPEN' | 'IN_PROGRESS' | 'WATCHING' | 'WAITING' | 'INTERRUPTED' | 'COMPLETED'

/** Sub-lifecycle for awaited results (e.g. labs), distinct from the general WorkState. */
export type ResultStage = 'REQUESTED' | 'WAITING' | 'AVAILABLE' | 'REVIEWED' | 'CLOSED'

export type CaptureSource = 'manual' | 'voice' | 'paper'

export type Connectivity = 'ONLINE' | 'OFFLINE' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED'

export interface EscalationRule {
  afterMinutes: number
  label: string
}

export interface Patient {
  id: PatientId
  bed: string
  age: number
  admissionNote: string
  allergies: string[]
  currentState: string[]
}

export interface WorkItem {
  id: string
  patientId: PatientId
  title: string
  category: string
  state: WorkState
  owner: string

  /** Who/what this is waiting on, when state === WAITING. */
  waitingFor?: string
  /** When the wait/open period began. */
  since?: string

  /** A real, legitimate due time — only set when one genuinely exists. */
  dueAt?: string
  /** A soft, informal due note (e.g. "Today") that must never drive overdue math. */
  dueNote?: string

  startedAt?: string
  lastAction?: string
  nextAction?: string
  interruptedAt?: string
  resumedAt?: string
  completedAt?: string

  note?: string

  /** id of another WorkItem this one is blocked by / depends on. */
  dependsOn?: string

  /** Sub-lifecycle for awaited results; when present, drives display instead of `state` label. */
  resultStage?: ResultStage
  resultNote?: string

  escalationRule?: EscalationRule
  escalated?: boolean

  /** Only the one scripted demo item needs a full Start -> Interrupt -> Resume arc. */
  supportsInProgress?: boolean
  startLabel?: string
  completeLabel?: string

  pendingSync?: boolean
}

export interface EventEntry {
  id: string
  patientId: PatientId
  time: string
  label: string
  pendingSync?: boolean
}

export type PaperTarget = 'P-001' | 'P-002' | 'P-003' | 'NONE'

export type NewItemState = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'WATCHING'

export type Screen =
  | { name: 'start' }
  | { name: 'home' }
  | { name: 'patients' }
  | { name: 'patientDetail'; patientId: PatientId }
  | { name: 'work' }
  | { name: 'paper' }
  | { name: 'handover' }
  | { name: 'handoverComplete' }
  | { name: 'capture'; patientId?: PatientId; prefillText?: string; source?: CaptureSource }

export interface CaptureSuggestion {
  itemId: string
  itemTitle: string
  patientId: PatientId
  itemState: WorkState
  text: string
}

export interface AppState {
  screen: Screen
  history: Screen[]
  nowTime: string
  patients: Record<PatientId, Patient>
  workItems: WorkItem[]
  events: EventEntry[]
  paperNotes: Record<PaperTarget, string>
  handoverHiddenItemIds: string[]
  handoverExtraNotes: Record<PatientId, string[]>
  handoverComplete: boolean
  assistOpen: boolean
  captureSuggestion: CaptureSuggestion | null
  pendingCapture: { patientId?: PatientId; text: string; source: CaptureSource } | null
  connectivity: Connectivity
  /** Tracks whether the scripted "while away" event has already fired, so it only happens once. */
  awayEventFired: boolean
}
