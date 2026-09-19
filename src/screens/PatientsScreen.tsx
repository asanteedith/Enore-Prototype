import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import { itemsForPatient } from '../state/selectors'
import type { PatientId } from '../state/types'

const ORDER: PatientId[] = ['P-001', 'P-002', 'P-003']

export function PatientsScreen() {
  const { state, push } = useApp()

  return (
    <>
      <div className="screen-title">Patients</div>
      <div className="patients-list">
        {ORDER.map((id) => {
          const patient = PATIENTS[id]
          const items = itemsForPatient(state, id).filter((w) => w.state !== 'DONE')
          const waiting = items.filter((w) => w.state === 'WAITING').length
          const overdue = items.filter((w) => w.overdue).length
          return (
            <button
              key={id}
              className="patient-card"
              type="button"
              onClick={() => push({ name: 'patientDetail', patientId: id })}
            >
              <div className="patient-card-top">
                <span className="patient-card-id">
                  {patient.id} · {patient.bed}
                </span>
                <span className="patient-card-age">{patient.age}y</span>
              </div>
              <div className="patient-card-note">{patient.admissionNote}</div>
              <div className="patient-card-flags">
                {overdue > 0 && <span className="chip chip-overdue">{overdue} overdue</span>}
                {waiting > 0 && <span className="chip chip-waiting">{waiting} waiting</span>}
                {overdue === 0 && waiting === 0 && (
                  <span className="chip chip-neutral">{items.length} open</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
