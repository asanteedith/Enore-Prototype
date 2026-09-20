import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import { activeItems, handoverLinesForPatient, PATIENT_ORDER } from '../state/selectors'
import type { PatientId } from '../state/types'
import { StateBadge } from '../components/StateBadge'

export function HandoverScreen() {
  const { state, toggleHandoverItem, addHandoverNote, removeHandoverNote, completeHandover } = useApp()
  const openWork = activeItems(state)
  const [draft, setDraft] = useState<Record<PatientId, string>>({ 'P-001': '', 'P-002': '', 'P-003': '' })

  return (
    <>
      <div className="screen-title">Handover</div>

      <section className="home-section">
        <div className="home-section-title">My Open Work</div>
        {openWork.length === 0 && <p className="home-empty">All work is resolved.</p>}
        {openWork.map((item) => (
          <div key={item.id} className="handover-open-row">
            <div className="handover-open-row-main">
              <span className="handover-open-row-patient">{PATIENTS[item.patientId].id}</span>
              <span className="handover-open-row-title">{item.title}</span>
            </div>
            <StateBadge state={item.state} />
          </div>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">Handover Ready</div>
        <p className="paper-intro">
          Generated from live work state. Completed work never appears here — remove a line only if it shouldn't
          carry into handover.
        </p>
        {PATIENT_ORDER.map((id) => {
          const patient = PATIENTS[id]
          const lines = handoverLinesForPatient(state, id)
          return (
            <div key={id} className="handover-group">
              <div className="handover-group-title">
                {patient.id} · {patient.bed}
              </div>
              {lines.length === 0 && <p className="home-empty">Nothing to hand over.</p>}
              {lines.map((line) => (
                <div key={line.id} className={`handover-line-row ${line.derived ? 'handover-line-derived' : ''}`}>
                  <span className="handover-line-text">{line.text}</span>
                  <button
                    className="handover-line-remove"
                    type="button"
                    aria-label="Remove from handover"
                    onClick={() =>
                      line.derived && line.itemId
                        ? toggleHandoverItem(line.itemId)
                        : removeHandoverNote(id, Number(line.id.split('-').pop()))
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="handover-add-row">
                <input
                  className="handover-line-input"
                  placeholder="Add a note for the next nurse"
                  value={draft[id]}
                  onChange={(e) => setDraft({ ...draft, [id]: e.target.value })}
                />
                <button
                  className="handover-line-add"
                  type="button"
                  onClick={() => {
                    if (!draft[id].trim()) return
                    addHandoverNote(id, draft[id].trim())
                    setDraft({ ...draft, [id]: '' })
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <button className="btn btn-primary btn-full" type="button" onClick={completeHandover}>
        Complete shift
      </button>
    </>
  )
}
