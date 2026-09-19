import type { WorkState } from '../state/types'

const LABELS: Record<WorkState, string> = {
  NOW: 'Now',
  NEXT: 'Next',
  WAITING: 'Waiting',
  OPEN: 'Open',
  DONE: 'Done',
}

const CLASSES: Record<WorkState, string> = {
  NOW: 'badge-now',
  NEXT: 'badge-next',
  WAITING: 'badge-waiting',
  OPEN: 'badge-open',
  DONE: 'badge-done',
}

export function StateBadge({ state, overdue }: { state: WorkState; overdue?: boolean }) {
  return (
    <span className="badge-row">
      <span className={`status-badge ${CLASSES[state]}`}>{LABELS[state]}</span>
      {overdue && <span className="status-badge badge-overdue">Overdue</span>}
    </span>
  )
}
