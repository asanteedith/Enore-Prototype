import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import {
  changeLinesForPatient,
  eventsForPatient,
  itemsForPatient,
  whileAwaySummary,
} from '../state/selectors'
import { SHIFT_START } from '../state/time'
import type { PatientId } from '../state/types'
import { SafetyBanner } from '../components/SafetyBanner'
import { WorkCard } from '../components/WorkCard'

export function PatientDetailScreen({ patientId }: { patientId: PatientId }) {
  const { state, recordProgress } = useApp()
  const patient = PATIENTS[patientId]
  const items = itemsForPatient(state, patientId)
  const events = eventsForPatient(state, patientId).slice().reverse()
  const openLoops = items.filter((w) => w.state !== 'COMPLETED')
  const changedLines = changeLinesForPatient(state, patientId, SHIFT_START)

  const interrupted = items.find((w) => w.state === 'INTERRUPTED')
  const awayLines = interrupted ? whileAwaySummary(state, patientId, interrupted.interruptedAt ?? state.nowTime, interrupted.id) : []

  const woundAssessment = items.find((w) => w.id === 'p002-wound-assessment')
  const needsInspectStep = woundAssessment?.state === 'IN_PROGRESS' && !woundAssessment.lastAction?.includes('inspected')

  return (
    <>
      <div className="patient-detail-header">
        <div className="patient-detail-id">{patient.id}</div>
        <div className="patient-detail-sub">
          {patient.bed} · {patient.age} years
        </div>
        <SafetyBanner allergies={patient.allergies} />
      </div>

      {interrupted && (
        <section className="resume-banner">
          <div className="resume-banner-title">Resume work</div>
          <div className="resume-banner-lead">You left this here.</div>
          <div className="resume-banner-item">{interrupted.title}</div>
          {interrupted.lastAction && <div className="resume-banner-detail">Last action: {interrupted.lastAction}</div>}
          {awayLines.length > 0 && (
            <div className="resume-banner-away">
              <div className="resume-banner-away-title">While you were away</div>
              <ul>
                {awayLines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section className="patient-block">
        <div className="patient-block-title">Work State</div>
        <div className="work-state-list">
          {items.map((item) => (
            <WorkCard key={item.id} item={item} showPatient={false} />
          ))}
          {needsInspectStep && woundAssessment && (
            <button
              className="btn btn-secondary btn-full"
              type="button"
              onClick={() => recordProgress(woundAssessment.id, 'Wound inspected', 'Complete assessment')}
            >
              Record: wound inspected
            </button>
          )}
        </div>
      </section>

      <section className="patient-block">
        <div className="patient-block-title">Current State</div>
        <ul className="current-state-list">
          {patient.currentState.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      {changedLines.length > 0 && (
        <section className="patient-block">
          <div className="patient-block-title">Changed Since Handover</div>
          <ul className="events-list">
            {changedLines.map((line, i) => (
              <li key={i} className="events-item">
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="patient-block">
        <div className="patient-block-title">Recent Events</div>
        <ul className="events-list">
          {events.map((e) => (
            <li key={e.id} className="events-item">
              <span className="events-time">{e.time}</span>
              <span>{e.label}</span>
              {e.pendingSync && <span className="events-pending">Pending sync</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="patient-block">
        <div className="patient-block-title">Open Loops</div>
        {openLoops.length === 0 ? (
          <p className="home-empty">No open loops for this patient.</p>
        ) : (
          <ul className="open-loops-list">
            {openLoops.map((item) => (
              <li key={item.id}>{item.title} still unresolved.</li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
