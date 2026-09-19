import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import { activeItems } from '../state/selectors'
import type { PatientId } from '../state/types'
import { StateBadge } from '../components/StateBadge'

const ORDER: PatientId[] = ['P-001', 'P-002', 'P-003']

export function HandoverScreen() {
  const { state, editHandoverLine, addHandoverLine, removeHandoverLine, completeHandover } = useApp()
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
            <StateBadge state={item.state} overdue={item.overdue} />
          </div>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">Handover Ready</div>
        <p className="paper-intro">Grouped by patient. Edit before you complete the shift.</p>
        {ORDER.map((id) => {
          const patient = PATIENTS[id]
          const lines = state.handoverNotes[id] ?? []
          return (
            <div key={id} className="handover-group">
              <div className="handover-group-title">
                {patient.id} · {patient.bed}
              </div>
              {lines.length === 0 && <p className="home-empty">Nothing to hand over.</p>}
              {lines.map((line, index) => (
                <div key={index} className="handover-line-edit">
                  <input
                    className="handover-line-input"
                    value={line}
                    onChange={(e) => editHandoverLine(id, index, e.target.value)}
                  />
                  <button
                    className="handover-line-remove"
                    type="button"
                    aria-label="Remove line"
                    onClick={() => removeHandoverLine(id, index)}
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
                    addHandoverLine(id, draft[id].trim())
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
