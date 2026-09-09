export type WorkStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'ESCALATED'

export interface WorkItem {
  id: string
  bedId: string | null
  title: string
  status: WorkStatus
  dueLabel: string
  assignedTo: string | null
  startedAt: string | null
  completedAt: string | null
  /** Generic care-context reference for items not tied to a bed. Bed-linked items use bedId instead. */
  contextId?: string
  /** What this item is blocked on, e.g. "Awaiting pharmacy response". Presence means the item is waiting. */
  waitingOn?: string
  waitingSinceLabel?: string
  chased?: boolean
  escalationReason?: string
  escalatedAtLabel?: string
  followUpNeeded?: boolean
}

export interface Bed {
  id: string
  label: string
  status: string
  nextReview: string
}

export type CareContextKind = 'bed' | 'theatre' | 'community' | 'dialysis' | 'outpatient' | 'emergency' | 'maternity'

export interface CareContext {
  id: string
  label: string
  kind: CareContextKind
  status: string
}

export interface ChangeEvent {
  id: string
  text: string
  timeLabel: string
}

export interface TeamActivityEntry {
  bedId: string
  text: string
}

export type DetectedIntent = 'COMPLETED' | 'DEFERRED' | 'ESCALATED' | 'IN_PROGRESS'

export interface RecentUpdate {
  workId: string
  bedId: string
  timeLabel: string
}

export interface MeetingData {
  id: string
  title: string
  dateLabel: string
  discussion: string
  decision: string
  actionTitle: string
  actionOwner: string
  followUp: string
  actionAdded: boolean
}

export interface DemoData {
  nurseName: string
  ward: string
  shiftLabel: string
  beds: Bed[]
  careContexts: CareContext[]
  work: WorkItem[]
  changes: ChangeEvent[]
  teamActivity: TeamActivityEntry[]
  recentUpdate: RecentUpdate | null
  meeting: MeetingData
}

export type Persona = 'edith' | 'ama'

export type ScreenState =
  | { name: 'start' }
  | { name: 'now' }
  | { name: 'beds' }
  | { name: 'careContext'; bedId: string }
  | { name: 'capture'; bedId: string; workId: string; prefill?: string }
  | { name: 'detected'; bedId: string; workId: string; input: string; intent: DetectedIntent }
  | { name: 'confirmed'; bedId: string; workId: string }
  | { name: 'work' }
  | { name: 'team' }
  | { name: 'handover' }
  | { name: 'workflowAgent'; teamMode?: boolean }
  | { name: 'clinicalKnowledge' }
  | { name: 'joinTeam' }
  | { name: 'teamHome' }
  | { name: 'teamWork' }
  | { name: 'teamContexts' }
  | { name: 'teamContextDetail'; contextId: string }
  | { name: 'teamPeople' }
  | { name: 'teamMeetings' }

export type TabName = 'now' | 'beds' | 'work' | 'team'
export type TeamTabName = 'teamHome' | 'teamWork' | 'teamContexts' | 'teamPeople'
