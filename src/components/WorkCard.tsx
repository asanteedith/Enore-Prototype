import type { WorkItem } from '../state/types'
import { PATIENTS } from '../state/initialData'
import { elapsedSince } from '../state/time'
import { StateBadge } from './StateBadge'

interface Props {
  item: WorkItem
  onClick?: () => void
  onComplete?: () => void
  showPatient?: boolean
}

export function WorkCard({ item, onClick, onComplete, showPatient = true }: Props) {
  const patient = PATIENTS[item.patientId]

  let timeLabel: string | null = null
  if (item.since) timeLabel = `Waiting since ${item.since} · ${elapsedSince(item.since)}`
  else if (item.due) timeLabel = `Due ${item.due}`
  else if (item.completedAt) timeLabel = `Completed ${item.completedAt}`

  return (
    <div className="work-card">
      <div
        className="work-card-body"
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') onClick()
              }
            : undefined
        }
      >
        <div className="work-card-top">
          {showPatient && (
            <span className="work-card-patient">
              {patient.id} · {patient.bed}
            </span>
          )}
          <StateBadge state={item.state} overdue={item.overdue} />
        </div>
        <div className="work-card-title">{item.title}</div>
        <div className="work-card-meta">
          <span className="work-card-owner">Owner: {item.owner}</span>
          {item.waitingFor && <span className="work-card-dependency">Waiting for {item.waitingFor}</span>}
        </div>
        {item.note && <div className="work-card-note">{item.note}</div>}
        {timeLabel && <div className="work-card-time">{timeLabel}</div>}
      </div>
      {onComplete && item.state !== 'DONE' && (
        <button className="work-card-complete" type="button" onClick={onComplete}>
          Mark done
        </button>
      )}
    </div>
  )
}
