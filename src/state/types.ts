export type WorkStatus = 'TO_DO' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED' | 'ESCALATED'

export interface WorkItem {
  id: string
  bedId: string
  title: string
  status: WorkStatus
  dueLabel: string
  assignedTo: string | null
  startedAt: string | null
  completedAt: string | null
}

export interface Bed {
  id: string
  label: string
  status: string
  nextReview: string
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

export interface DemoData {
  nurseName: string
  ward: string
  shiftLabel: string
  beds: Bed[]
  work: WorkItem[]
  changes: ChangeEvent[]
  teamActivity: TeamActivityEntry[]
  recentUpdate: RecentUpdate | null
}

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
  | { name: 'workflowAgent' }
  | { name: 'clinicalKnowledge' }

export type TabName = 'now' | 'beds' | 'work' | 'team'
