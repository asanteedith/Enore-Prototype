import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useDemo } from '../state/DemoContext'
import { getBed, outstandingWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { AIResponse } from '../components/AIResponse'
import { SecondaryButton } from '../components/SecondaryButton'
import { KnowledgeIcon, SendIcon } from '../components/icons'

interface Turn {
  id: string
  from: 'nurse' | 'enore'
  node: ReactNode
}

const SUGGESTED_PROMPTS = ['What is still outstanding?', 'Prepare a handover summary.']

const FALLBACK_TEXT = 'I can help find ward work, prepare handover information, and organize outstanding items.'

function classify(text: string): 'outstanding' | 'handover' | 'fallback' {
  const t = text.toLowerCase()
  if (t.includes('outstanding') || t.includes('remaining') || t.includes('left') || t.includes('still need')) {
    return 'outstanding'
  }
  if (t.includes('handover') || t.includes('summary') || t.includes('prepare')) {
    return 'handover'
  }
  return 'fallback'
}

export function WorkflowAgentScreen() {
  const { data, goBack, push } = useDemo()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const idRef = useRef(0)

  const outstanding = outstandingWork(data)

  function nextId(prefix: string) {
    idRef.current += 1
    return `${prefix}-${idRef.current}`
  }

  function respond(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return

    const kind = classify(trimmed)

    const response: ReactNode =
      kind === 'outstanding' ? (
        <AIResponse>
          <div>
            {outstanding.length} outstanding item{outstanding.length === 1 ? '' : 's'} on the ward
          </div>
          <ul className="agent-outstanding-list">
            {outstanding.map((item) => (
              <li key={item.id}>
                <span className="agent-outstanding-bed">{getBed(data, item.bedId).label}</span>
                <span>{item.title}</span>
              </li>
            ))}
            {outstanding.length === 0 && <li>Nothing outstanding right now.</li>}
          </ul>
        </AIResponse>
      ) : kind === 'handover' ? (
        <AIResponse>
          <div>I prepared a draft from today's confirmed work.</div>
          <SecondaryButton fullWidth={false} onClick={() => push({ name: 'handover' })}>
            Review before action
          </SecondaryButton>
        </AIResponse>
      ) : (
        <AIResponse>
          <div>{FALLBACK_TEXT}</div>
        </AIResponse>
      )

    setTurns((prev) => [
      ...prev,
      { id: nextId('q'), from: 'nurse', node: trimmed },
      { id: nextId('a'), from: 'enore', node: response },
    ])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    respond(draft)
    setDraft('')
  }

  return (
    <AppShell title="Workflow Agent" onBack={goBack}>
      <SectionHeader eyebrow="Connected to this shift's work" title="Workflow Agent" subtitle="Find what's outstanding and get handover-ready." />

      <div className="agent-thread">
        {turns.length === 0 && <div className="agent-empty">AI prepares. The nurse decides.</div>}

        {turns.map((turn) =>
          turn.from === 'nurse' ? (
            <div key={turn.id} className="agent-nurse-turn">
              {turn.node}
            </div>
          ) : (
            <div key={turn.id}>{turn.node}</div>
          ),
        )}
      </div>

      <div className="agent-prompts">
        {SUGGESTED_PROMPTS.map((text) => (
          <button key={text} className="agent-prompt-chip" onClick={() => respond(text)} type="button">
            {text}
          </button>
        ))}
      </div>

      <form className="agent-input-row" onSubmit={handleSubmit}>
        <input
          className="agent-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your shift…"
        />
        <button className="agent-send" type="submit" disabled={draft.trim().length === 0} aria-label="Ask">
          <SendIcon />
        </button>
      </form>

      <button className="knowledge-entry" onClick={() => push({ name: 'clinicalKnowledge' })} type="button">
        <KnowledgeIcon />
        <div>
          <div className="knowledge-entry-title">Clinical Knowledge AI</div>
          <div className="knowledge-entry-subtitle">Ask clinical questions, explore conditions and medicines, and use clinical calculators.</div>
        </div>
      </button>
    </AppShell>
  )
}
