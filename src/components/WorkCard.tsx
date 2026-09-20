import { useState } from 'react'
import type { WorkItem } from '../state/types'
import { useApp } from '../state/AppContext'
import { PATIENTS, SYNTHETIC_BLOOD_RESULT_NOTE } from '../state/initialData'
import { dependencyInfo, dueStatusFor, escalationDueFor, resultStageLabel } from '../state/selectors'
import { elapsedSince } from '../state/time'
import { StateBadge } from './StateBadge'

interface Props {
  item: WorkItem
  showPatient?: boolean
}

export function WorkCard({ item, showPatient = true }: Props) {
  const { state, push, startWork, completeWork, followUp, escalate, resumeWork, checkResult, reviewResult, closeResult } = useApp()
  const [watching, setWatching] = useState(false)
  const patient = PATIENTS[item.patientId]

  const due = dueStatusFor(state, item)
  const escalationDue = escalationDueFor(state, item)
  const dependency = dependencyInfo(state, item)
  const badgeLabel = resultStageLabel(item)

  let timeLabel: string | null = null
  if (item.state === 'COMPLETED' && item.completedAt) timeLabel = `Completed ${item.completedAt}`
  else if (item.state === 'INTERRUPTED' && item.interruptedAt) timeLabel = `Interrupted ${item.interruptedAt}`
  else if (item.startedAt) timeLabel = `Started ${item.startedAt}`
  else if (item.since) timeLabel = `Since ${item.since} · ${elapsedSince(item.since, state.nowTime)}`
  else if (item.dueAt) timeLabel = `Due ${item.dueAt}`
  else if (item.dueNote) timeLabel = `Due ${item.dueNote}`

  const goToPatient = () => push({ name: 'patientDetail', patientId: item.patientId })
  const recordUpdate = () => push({ name: 'capture', patientId: item.patientId, source: 'manual' })
  const watchFlash = () => {
    setWatching(true)
    setTimeout(() => setWatching(false), 1600)
  }

  return (
    <div className="work-card">
      <div
        className="work-card-body"
        onClick={goToPatient}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') goToPatient()
        }}
      >
        <div className="work-card-top">
          {showPatient && (
            <span className="work-card-patient">
              {patient.id} · {patient.bed}
            </span>
          )}
          <StateBadge state={item.state} label={badgeLabel} dueStatus={due} escalationDue={escalationDue} />
        </div>
        <div className="work-card-title">{item.title}</div>
        <div className="work-card-meta">
          <span className="work-card-owner">Owner: {item.owner}</span>
        </div>
        {dependency && (
          <div className="work-card-dependency">
            {dependency.blocking ? 'Blocked by' : 'Depended on'}: {dependency.item.title}
            {!dependency.blocking && ' ✓'}
          </div>
        )}
        {item.lastAction && <div className="work-card-note">Last action: {item.lastAction}</div>}
        {item.nextAction && <div className="work-card-note">Next: {item.nextAction}</div>}
        {item.resultNote && <div className="work-card-note">{item.resultNote}</div>}
        {item.note && <div className="work-card-note">{item.note}</div>}
        {timeLabel && <div className="work-card-time">{timeLabel}</div>}
        {item.pendingSync && <div className="work-card-pending">Pending sync</div>}
      </div>

      <div className="work-card-actions">
        {item.state === 'COMPLETED' ? null : item.owner === 'Me' ? (
          <>
            {item.state === 'INTERRUPTED' && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => resumeWork(item.id)}>
                Resume
              </button>
            )}
            {item.state === 'WATCHING' && (
              <button className="work-card-action" type="button" onClick={recordUpdate}>
                Log update
              </button>
            )}
            {item.state === 'OPEN' && item.supportsInProgress && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => startWork(item.id)}>
                {item.startLabel ?? 'Start'}
              </button>
            )}
            {item.state === 'OPEN' && !item.supportsInProgress && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => completeWork(item.id)}>
                {item.completeLabel ?? 'Complete'}
              </button>
            )}
            {item.state === 'IN_PROGRESS' && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => completeWork(item.id)}>
                {item.completeLabel ?? 'Complete'}
              </button>
            )}
          </>
        ) : item.resultStage ? (
          <>
            {(item.resultStage === 'WAITING' || item.resultStage === 'REQUESTED') && (
              <>
                <button
                  className="work-card-action work-card-action-primary"
                  type="button"
                  onClick={() => checkResult(item.id, SYNTHETIC_BLOOD_RESULT_NOTE)}
                >
                  Check result
                </button>
                <button className="work-card-action" type="button" onClick={() => followUp(item.id)}>
                  Follow up
                </button>
              </>
            )}
            {item.resultStage === 'AVAILABLE' && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => reviewResult(item.id)}>
                Review result
              </button>
            )}
            {item.resultStage === 'REVIEWED' && (
              <button className="work-card-action work-card-action-primary" type="button" onClick={() => closeResult(item.id)}>
                Close
              </button>
            )}
          </>
        ) : item.state === 'WAITING' ? (
          <>
            <button className="work-card-action" type="button" onClick={recordUpdate}>
              Record update
            </button>
            <button className="work-card-action" type="button" onClick={() => followUp(item.id)}>
              Follow up
            </button>
            {escalationDue && (
              <button className="work-card-action work-card-action-warn" type="button" onClick={() => escalate(item.id)}>
                Escalate
              </button>
            )}
            <button className="work-card-action work-card-action-ghost" type="button" onClick={watchFlash}>
              {watching ? 'Watching ✓' : 'Continue watching'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
