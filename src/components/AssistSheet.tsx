import { useState } from 'react'
import { useApp } from '../state/AppContext'
import { PATIENTS } from '../state/initialData'
import { activeItems, overdueItems, waitingItems } from '../state/selectors'

const PROMPTS = ['Show me what is still open', "What's waiting?", "What's overdue?", 'Handover summary'] as const

function answerFor(prompt: string, state: ReturnType<typeof useApp>['state']): string {
  const open = activeItems(state)
  const waiting = waitingItems(state)
  const overdue = overdueItems(state)

  const lineFor = (item: (typeof open)[number]) => `${PATIENTS[item.patientId].id} ${item.title.toLowerCase()}`

  if (prompt === 'Show me what is still open') {
    if (open.length === 0) return 'Nothing open right now.'
    return `${open.length} open item${open.length === 1 ? '' : 's'}:\n${open.map((i) => `- ${lineFor(i)}`).join('\n')}`
  }
  if (prompt === "What's waiting?") {
    if (waiting.length === 0) return 'Nothing is waiting on anyone.'
    return waiting.map((i) => `- ${lineFor(i)} — waiting for ${i.waitingFor}`).join('\n')
  }
  if (prompt === "What's overdue?") {
    if (overdue.length === 0) return 'Nothing is overdue.'
    return overdue.map((i) => `- ${lineFor(i)}`).join('\n')
  }
  if (prompt === 'Handover summary') {
    const patients = Object.keys(state.handoverNotes) as (keyof typeof state.handoverNotes)[]
    const parts = patients
      .filter((id) => (state.handoverNotes[id] ?? []).length > 0)
      .map((id) => `${PATIENTS[id].id}: ${(state.handoverNotes[id] ?? []).join('; ')}`)
    return parts.length > 0 ? parts.join('\n') : 'Nothing to hand over yet.'
  }
  return "I can only help organize what's already in your workflow — I don't diagnose or recommend treatment."
}

export function AssistSheet() {
  const { state, closeAssist } = useApp()
  const [answer, setAnswer] = useState<string | null>(null)

  if (!state.assistOpen) return null

  return (
    <div className="assist-overlay" onClick={closeAssist}>
      <div className="assist-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="assist-header">
          <span>ENORE Assist</span>
          <button className="assist-close" type="button" onClick={closeAssist} aria-label="Close">
            ×
          </button>
        </div>
        <p className="assist-caption">Helps you organize what's already in your workflow. It doesn't diagnose or prescribe.</p>

        {answer && <div className="assist-answer">{answer}</div>}

        <div className="assist-prompts">
          {PROMPTS.map((p) => (
            <button key={p} className="assist-prompt" type="button" onClick={() => setAnswer(answerFor(p, state))}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
