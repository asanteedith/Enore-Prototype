export type PatientId = 'P-001' | 'P-002' | 'P-003'

export type WorkState = 'NOW' | 'NEXT' | 'WAITING' | 'OPEN' | 'DONE'

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
  waitingFor?: string
  since?: string
  due?: string
  note?: string
  overdue: boolean
  showInNow: boolean
  completedAt?: string
}

export interface EventEntry {
  id: string
  patientId: PatientId
  time: string
  label: string
}

export interface PaperNote {
  html: string
}

export type PaperTarget = 'P-001' | 'P-002' | 'P-003' | 'NONE'

export interface HandoverNote {
  patientId: PatientId
  lines: string[]
}

export type Screen =
  | { name: 'start' }
  | { name: 'home' }
  | { name: 'patients' }
  | { name: 'patientDetail'; patientId: PatientId }
  | { name: 'work' }
  | { name: 'paper' }
  | { name: 'handover' }
  | { name: 'handoverComplete' }
  | { name: 'capture'; patientId?: PatientId; prefillText?: string }

export interface AppState {
  screen: Screen
  history: Screen[]
  nowTime: string
  patients: Record<PatientId, Patient>
  workItems: WorkItem[]
  events: EventEntry[]
  paperNotes: Record<PaperTarget, string>
  handoverNotes: Record<PatientId, string[]>
  handoverComplete: boolean
  assistOpen: boolean
  captureSuggestion: { workItemId: string; workItemTitle: string; patientId: PatientId } | null
}
