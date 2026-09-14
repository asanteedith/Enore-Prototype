import type { WorkStatus } from '../state/types'

const LABELS: Record<WorkStatus, string> = {
  TO_DO: 'To do',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  DEFERRED: 'Deferred',
  ESCALATED: 'Escalated',
}

const CLASSES: Record<WorkStatus, string> = {
  TO_DO: 'badge-neutral',
  IN_PROGRESS: 'badge-progress',
  COMPLETED: 'badge-complete',
  DEFERRED: 'badge-deferred',
  ESCALATED: 'badge-escalated',
}

export function StatusBadge({ status }: { status: WorkStatus }) {
  return <span className={`status-badge ${CLASSES[status]}`}>{LABELS[status]}</span>
}
