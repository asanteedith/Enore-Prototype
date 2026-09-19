import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import type { PatientId } from '../state/types'

const ORDER: PatientId[] = ['P-001', 'P-002', 'P-003']

export function CaptureScreen({ patientId, prefillText }: { patientId?: PatientId; prefillText?: string }) {
  const { state, captureSave, confirmSuggestion, dismissSuggestion, back, goTab } = useApp()
  const [text, setText] = useState(prefillText ?? '')
  const [selected, setSelected] = useState<PatientId | undefined>(patientId)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    if (!text.trim()) return
    captureSave(selected, text)
    setSaved(true)
  }

  if (saved) {
    if (state.captureSuggestion) {
      const { workItemTitle, patientId: suggestPatientId } = state.captureSuggestion
      return (
        <div className="capture-confirm">
          <p className="capture-confirm-lead">This looks like it completes:</p>
          <div className="capture-confirm-item">
            {PATIENTS[suggestPatientId].id} · {workItemTitle}
          </div>
          <button
            className="btn btn-primary btn-full"
            type="button"
            onClick={() => {
              confirmSuggestion()
            }}
          >
            Mark as done
          </button>
          <button
            className="btn btn-secondary btn-full"
            type="button"
            onClick={() => {
              dismissSuggestion()
              goTab({ name: 'home' })
            }}
          >
            Not now
          </button>
        </div>
      )
    }
    return (
      <div className="capture-confirm">
        <p className="capture-confirm-lead">Saved to the record.</p>
        <button className="btn btn-primary btn-full" type="button" onClick={() => goTab({ name: 'home' })}>
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="screen-title">Capture</div>
      <p className="capture-question">What happened?</p>
      <textarea
        className="capture-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Doctor reviewed the wound"
        rows={4}
        autoFocus
      />

      <p className="capture-question">Patient</p>
      <div className="capture-patient-picker">
        {ORDER.map((id) => (
          <button
            key={id}
            className={`capture-patient-chip ${selected === id ? 'capture-patient-chip-active' : ''}`}
            type="button"
            onClick={() => setSelected(id)}
          >
            {id} · {PATIENTS[id].bed}
          </button>
        ))}
      </div>

      <button className="btn btn-primary btn-full" type="button" onClick={handleSave} disabled={!text.trim() || !selected}>
        Save
      </button>
      <button className="btn btn-secondary btn-full" type="button" onClick={back}>
        Cancel
      </button>
    </>
  )
}
