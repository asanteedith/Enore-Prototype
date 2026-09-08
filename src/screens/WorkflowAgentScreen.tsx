import { useState, type ReactNode } from 'react'
import { useDemo } from '../state/DemoContext'
import { getBed, outstandingWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { AIResponse } from '../components/AIResponse'
import { SecondaryButton } from '../components/SecondaryButton'
import { KnowledgeIcon } from '../components/icons'

type PromptKey = 'outstanding' | 'handover'

interface Turn {
  id: string
  from: 'nurse' | 'enore'
  node: ReactNode
}

const PROMPTS: { key: PromptKey; text: string }[] = [
  { key: 'outstanding', text: 'What is still outstanding?' },
  { key: 'handover', text: 'Prepare a handover summary.' },
]

export function WorkflowAgentScreen() {
  const { data, goBack, push } = useDemo()
  const [turns, setTurns] = useState<Turn[]>([])
  const [asked, setAsked] = useState<Set<PromptKey>>(new Set())

  const outstanding = outstandingWork(data)

  function ask(key: PromptKey, text: string) {
    setAsked((prev) => new Set(prev).add(key))

    const nurseTurn: Turn = { id: `${key}-q`, from: 'nurse', node: text }

    const response: ReactNode =
      key === 'outstanding' ? (
        <AIResponse>
          <div>{outstanding.length} outstanding item{outstanding.length === 1 ? '' : 's'} on the ward</div>
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
      ) : (
        <AIResponse>
          <div>I prepared a draft from today's confirmed work.</div>
          <SecondaryButton fullWidth={false} onClick={() => push({ name: 'handover' })}>
            Review before action
          </SecondaryButton>
        </AIResponse>
      )

    const enoreTurn: Turn = { id: `${key}-a`, from: 'enore', node: response }
    setTurns((prev) => [...prev, nurseTurn, enoreTurn])
  }

  return (
    <AppShell title="Workflow Agent" onBack={goBack}>
      <SectionHeader eyebrow="Connected to Enore's work state" title="Workflow Agent" subtitle="Find information and help get things done." />

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
        {PROMPTS.filter((p) => !asked.has(p.key)).map((p) => (
          <button key={p.key} className="agent-prompt-chip" onClick={() => ask(p.key, p.text)} type="button">
            {p.text}
          </button>
        ))}
      </div>

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
