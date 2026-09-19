import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import { eventsForPatient, itemsForPatient, openLoopsForPatient } from '../state/selectors'
import type { PatientId } from '../state/types'
import { StateBadge } from '../components/StateBadge'
import { elapsedSince } from '../state/time'

export function PatientDetailScreen({ patientId }: { patientId: PatientId }) {
  const { state, push, completeWorkItem } = useApp()
  const patient = PATIENTS[patientId]
  const items = itemsForPatient(state, patientId)
  const events = eventsForPatient(state, patientId).slice().reverse()
  const openLoops = openLoopsForPatient(state, patientId)

  return (
    <>
      <div className="patient-detail-header">
        <div className="patient-detail-id">{patient.id}</div>
        <div className="patient-detail-sub">
          {patient.bed} · {patient.age} years
        </div>
        {patient.allergies.length > 0 && (
          <div className="patient-detail-allergy">Allergy: {patient.allergies.join(', ')}</div>
        )}
      </div>

      <section className="patient-block">
        <div className="patient-block-title">Current State</div>
        <ul className="current-state-list">
          {patient.currentState.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="patient-block">
        <div className="patient-block-title">Work State</div>
        <div className="work-state-list">
          {items.map((item) => (
            <div key={item.id} className="work-state-row">
              <div className="work-state-row-top">
                <span className="work-state-row-title">{item.title}</span>
                <StateBadge state={item.state} overdue={item.overdue} />
              </div>
              <div className="work-state-row-detail">Owner: {item.owner}</div>
              {item.waitingFor && (
                <div className="work-state-row-detail">
                  Waiting: {item.waitingFor}
                  {item.since && ` · since ${item.since} (${elapsedSince(item.since)})`}
                </div>
              )}
              {item.due && <div className="work-state-row-detail">Due: {item.due}</div>}
              {item.note && <div className="work-state-row-detail">{item.note}</div>}
              {item.state !== 'DONE' && (
                <button className="work-state-row-action" type="button" onClick={() => completeWorkItem(item.id)}>
                  Mark done
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="patient-block">
        <div className="patient-block-title">Recent Events</div>
        <ul className="events-list">
          {events.map((e) => (
            <li key={e.id} className="events-item">
              <span className="events-time">{e.time}</span>
              <span>{e.label}</span>
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

      <button className="btn btn-secondary btn-full" type="button" onClick={() => push({ name: 'capture', patientId })}>
        Capture update for {patient.id}
      </button>
    </>
  )
}
