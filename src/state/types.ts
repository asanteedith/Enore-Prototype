export type WorkStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'ESCALATED'
export type WorkScope = 'personal' | 'team'
export type SyncState = 'LOCAL' | 'SYNCING' | 'SYNCED' | 'FAILED'
export type TeamKind = 'ward' | 'pharmacy' | 'laboratory' | 'emergency' | 'specialty' | 'externalFacility'
export type OwnerRole = 'Staff Nurse' | 'Nurse In-Charge' | 'Pharmacist' | 'Laboratory Scientist' | 'Doctor' | 'Midwife'
export type DependencyStatus = 'REQUESTED' | 'WAITING' | 'CHASED' | 'RESPONDED' | 'RESOLVED'
export type FollowUpStatus = 'PLANNED' | 'DUE' | 'OVERDUE' | 'DONE'
export type ActivityType =
  | 'created'
  | 'connected'
  | 'assigned'
  | 'started'
  | 'dependencyRequested'
  | 'dependencyChased'
  | 'dependencyResponded'
  | 'continued'
  | 'completed'
  | 'deferred'
  | 'escalated'
  | 'externalUpdate'
  | 'handover'

export interface Team {
  id: string
  name: string
  kind: TeamKind
}

export interface Owner {
  id: string
  name: string
  role: OwnerRole
  teamId: string
  persona?: Persona
}

export interface WorkItem {
  id: string
  bedId: string | null
  scope: WorkScope
  owningTeamId?: string
  sourceTeamId?: string
  receivingTeamId?: string
  ownerId: string | null
  title: string
  description?: string
  status: WorkStatus
  priority: 'routine' | 'soon' | 'now'
  dueLabel: string
  dueAtMinutes: number | null
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
  sourceType?: 'manual' | 'capture' | 'paper' | 'external'
  sourceSummary?: string
  handoverNote?: string
  syncState: SyncState
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
  workId?: string
  type?: ActivityType
  syncState?: SyncState
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

export interface Dependency {
  id: string
  workId: string
  requestedByTeamId: string
  requestedFromTeamId: string
  requestedFromRole?: OwnerRole
  ownerId?: string
  status: DependencyStatus
  waitingOn: string
  requestedAtLabel: string
  expectedAtLabel: string
  expectedAtMinutes: number
  chasedAtLabel?: string
  responseSummary?: string
  respondedAtLabel?: string
  nextAction?: string
}

export interface FollowUp {
  id: string
  workId: string
  ownerId: string
  dueLabel: string
  dueAtMinutes: number
  status: FollowUpStatus
  note: string
}

export interface ExternalContact {
  id: string
  displayLabel: string
  type: 'relative' | 'caregiver' | 'referrer' | 'externalFacility' | 'emergencyContact'
  relationshipLabel?: string
  channelHint: 'phone' | 'sms' | 'whatsapp' | 'email'
}

export interface ExternalCommunication {
  id: string
  contactId: string
  workId: string
  careContextId?: string
  channel: 'phone' | 'sms' | 'whatsapp' | 'email'
  direction: 'inbound' | 'outbound'
  summary: string
  receivedAtLabel: string
  reviewedById?: string
  outcome?: string
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
  nowMinutes: number
  teams: Team[]
  owners: Owner[]
  beds: Bed[]
  careContexts: CareContext[]
  work: WorkItem[]
  dependencies: Dependency[]
  followUps: FollowUp[]
  externalContacts: ExternalContact[]
  externalCommunications: ExternalCommunication[]
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
  | { name: 'workDetail'; workId: string }
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

export type TabName = 'teamHome' | 'now' | 'teamWork' | 'handover' | 'beds' | 'work' | 'team'
export type TeamTabName = 'teamHome' | 'now' | 'teamWork' | 'handover' | 'teamContexts' | 'teamPeople'
