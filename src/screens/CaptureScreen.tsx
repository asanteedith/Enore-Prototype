import { useEffect, useState } from 'react'
import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import type { CaptureSource, NewItemState, PatientId } from '../state/types'
import { SafetyBanner } from '../components/SafetyBanner'

const ORDER: PatientId[] = ['P-001', 'P-002', 'P-003']

const VOICE_TRANSCRIPT =
  "I'm halfway through Bed 9's wound assessment. I've inspected the wound but haven't completed the assessment yet. I need to finish it after I check Bed 12."

const NEW_STATE_OPTIONS: { key: NewItemState; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'WAITING', label: 'Waiting' },
  { key: 'WATCHING', label: 'Watching' },
]

export function CaptureScreen({
  patientId,
  prefillText,
  source,
}: {
  patientId?: PatientId
  prefillText?: string
  source?: CaptureSource
}) {
  const { state, captureAnalyze, confirmSuggestion, dismissSuggestion, createItemFromCapture, cancelPendingCapture, back, goTab } =
    useApp()

  const [mode, setMode] = useState<'manual' | 'voice'>('manual')
  const [voicePhase, setVoicePhase] = useState<'idle' | 'listening' | 'transcribed'>('idle')
  const [text, setText] = useState(prefillText ?? '')
  const [selected, setSelected] = useState<PatientId | undefined>(patientId)
  const [newStateChoice, setNewStateChoice] = useState<NewItemState>('OPEN')
  const [waitingFor, setWaitingFor] = useState('')
  const [done, setDone] = useState<string | null>(null)

  useEffect(() => {
    if (voicePhase !== 'listening') return
    const t = setTimeout(() => {
      setText(VOICE_TRANSCRIPT)
      setSelected('P-002')
      setVoicePhase('transcribed')
    }, 1100)
    return () => clearTimeout(t)
  }, [voicePhase])

  const allergies = selected ? PATIENTS[selected].allergies : []

  if (done) {
    return (
      <div className="capture-confirm">
        <p className="capture-confirm-lead">{done}</p>
        <button className="btn btn-primary btn-full" type="button" onClick={() => goTab({ name: 'home' })}>
          Back to Home
        </button>
      </div>
    )
  }

  if (state.captureSuggestion) {
    const { itemTitle } = state.captureSuggestion
    return (
      <div className="capture-confirm">
        <p className="capture-confirm-lead">This looks like it relates to:</p>
        <div className="capture-confirm-item">{itemTitle}</div>
        <button
          className="btn btn-primary btn-full"
          type="button"
          onClick={() => {
            confirmSuggestion('COMPLETED')
            setDone(`${itemTitle} marked completed.`)
          }}
        >
          Mark completed
        </button>
        <button
          className="btn btn-secondary btn-full"
          type="button"
          onClick={() => {
            confirmSuggestion('IN_PROGRESS')
            setDone(`${itemTitle} updated.`)
          }}
        >
          Just update progress
        </button>
        <button
          className="btn btn-secondary btn-full"
          type="button"
          onClick={() => {
            dismissSuggestion()
            setDone(`Logged — ${itemTitle} left unchanged.`)
          }}
        >
          Not now
        </button>
      </div>
    )
  }

  if (state.pendingCapture) {
    return (
      <>
        <div className="screen-title">Capture</div>
        <p className="capture-question">What's the state of this work?</p>
        <div className="capture-patient-picker">
          {NEW_STATE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`capture-patient-chip ${newStateChoice === opt.key ? 'capture-patient-chip-active' : ''}`}
              type="button"
              onClick={() => setNewStateChoice(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {newStateChoice === 'WAITING' && (
          <input
            className="handover-line-input"
            placeholder="Waiting for (optional)"
            value={waitingFor}
            onChange={(e) => setWaitingFor(e.target.value)}
          />
        )}
        <button
          className="btn btn-primary btn-full"
          type="button"
          onClick={() => {
            createItemFromCapture(newStateChoice, waitingFor.trim() || undefined)
            setDone(`Added to Work as ${NEW_STATE_OPTIONS.find((o) => o.key === newStateChoice)?.label}.`)
          }}
        >
          Add to Work
        </button>
        <button
          className="btn btn-secondary btn-full"
          type="button"
          onClick={() => {
            cancelPendingCapture()
            setDone('Logged as an event only.')
          }}
        >
          Just log it, don't track it
        </button>
      </>
    )
  }

  return (
    <>
      <div className="screen-title">Capture</div>

      {source === 'paper' ? (
        <span className="capture-source-tag">From Paper</span>
      ) : (
        <div className="capture-source-picker">
          <button
            className={`capture-source-chip ${mode === 'manual' ? 'capture-source-chip-active' : ''}`}
            type="button"
            onClick={() => setMode('manual')}
          >
            Manual
          </button>
          <button
            className={`capture-source-chip ${mode === 'voice' ? 'capture-source-chip-active' : ''}`}
            type="button"
            onClick={() => {
              setMode('voice')
              setVoicePhase('idle')
            }}
          >
            Voice
          </button>
        </div>
      )}

      {mode === 'voice' && voicePhase !== 'transcribed' ? (
        <div className="voice-capture">
          <button
            className={`voice-mic ${voicePhase === 'listening' ? 'voice-mic-active' : ''}`}
            type="button"
            onClick={() => setVoicePhase('listening')}
          >
            🎙
          </button>
          <p className="voice-hint">{voicePhase === 'listening' ? 'Listening… (simulated)' : 'Tap to record a voice note'}</p>
        </div>
      ) : (
        <>
          {mode === 'voice' && <p className="capture-question">Transcript — review and edit before saving</p>}
          {mode === 'manual' && <p className="capture-question">What's this about?</p>}
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

          {allergies.length > 0 && <SafetyBanner allergies={allergies} variant="panel" />}

          <button
            className="btn btn-primary btn-full"
            type="button"
            onClick={() => selected && captureAnalyze(selected, text, mode)}
            disabled={!text.trim() || !selected}
          >
            Save
          </button>
          <button className="btn btn-secondary btn-full" type="button" onClick={back}>
            Cancel
          </button>
        </>
      )}

      <div className="capture-future-sources">
        <span className="capture-future-label">Also becomes work from:</span>
        <span className="chip chip-neutral chip-disabled">Verbal handover</span>
        <span className="chip chip-neutral chip-disabled">Phone / bleep</span>
        <span className="chip chip-neutral chip-disabled">Referral</span>
        <span className="chip chip-neutral chip-disabled">Results</span>
      </div>
    </>
  )
}
