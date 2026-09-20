import type { WorkState } from '../state/types'
import type { DueStatus } from '../state/time'

const LABELS: Record<WorkState, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  WATCHING: 'Watching',
  WAITING: 'Waiting',
  INTERRUPTED: 'Interrupted',
  COMPLETED: 'Completed',
}

const CLASSES: Record<WorkState, string> = {
  OPEN: 'badge-open',
  IN_PROGRESS: 'badge-progress',
  WATCHING: 'badge-watching',
  WAITING: 'badge-waiting',
  INTERRUPTED: 'badge-interrupted',
  COMPLETED: 'badge-done',
}

interface Props {
  state: WorkState
  label?: string
  dueStatus?: DueStatus
  escalationDue?: boolean
}

export function StateBadge({ state, label, dueStatus, escalationDue }: Props) {
  return (
    <span className="badge-row">
      <span className={`status-badge ${CLASSES[state]}`}>{label ?? LABELS[state]}</span>
      {dueStatus === 'DUE' && <span className="status-badge badge-due">Due</span>}
      {dueStatus === 'OVERDUE' && <span className="status-badge badge-overdue">Overdue</span>}
      {escalationDue && <span className="status-badge badge-escalation">Escalation</span>}
    </span>
  )
}
