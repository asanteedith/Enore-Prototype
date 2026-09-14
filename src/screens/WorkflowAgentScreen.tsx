import { useRef, useState, type FormEvent } from 'react'
import { useDemo } from '../state/DemoContext'
import { contextLabelFor, outstandingWork, teamStats } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { AIResponse } from '../components/AIResponse'
import { SecondaryButton } from '../components/SecondaryButton'
import { StatTile } from '../components/StatTile'
import { SendIcon } from '../components/icons'

type Intent = 'outstanding' | 'handover' | 'workStatus' | 'announce' | 'fallback'

interface Turn {
  id: string
  from: 'nurse' | 'enore'
  text?: string
  intent?: Intent
}

const PERSONAL_PROMPTS = ['What is still outstanding?', 'Prepare a handover summary.']
const TEAM_PROMPTS = ['Prepare the work status for this shift.', 'Prepare the next-shift handover.', 'Announce tomorrow’s ward meeting at 2 PM.']

const FALLBACK_TEXT = 'I can help find ward work, prepare handover information, and organize outstanding items.'

function classify(text: string): Intent {
  const t = text.toLowerCase()
  if (t.includes('work status') || t.includes('status report') || t.includes('status for')) return 'workStatus'
  if (t.includes('announce')) return 'announce'
  if (t.includes('handover') || t.includes('summary') || t.includes('prepare')) return 'handover'
  if (t.includes('outstanding') || t.includes('remaining') || t.includes('left') || t.includes('still need')) {
    return 'outstanding'
  }
  return 'fallback'
}

export function WorkflowAgentScreen({ teamMode = false }: { teamMode?: boolean } = {}) {
  const { data, goBack, push } = useDemo()
  const [turns, setTurns] = useState<Turn[]>([])
  const [draft, setDraft] = useState('')
  const [approvedIds, setApprovedIds] = useState<Record<string, boolean>>({})
  const idRef = useRef(0)

  const outstanding = outstandingWork(data)
  const stats = teamStats(data)

  function nextId(prefix: string) {
    idRef.current += 1
    return `${prefix}-${idRef.current}`
  }

  function respond(text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const intent = classify(trimmed)
    setTurns((prev) => [
      ...prev,
      { id: nextId('q'), from: 'nurse', text: trimmed },
      { id: nextId('a'), from: 'enore', intent },
    ])
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    respond(draft)
    setDraft('')
  }

  function renderResponse(turn: Turn) {
    const approved = !!approvedIds[turn.id]
    const approve = () => setApprovedIds((prev) => ({ ...prev, [turn.id]: true }))

    switch (turn.intent) {
      case 'workStatus':
        return (
          <AIResponse>
            <div>Work status — {data.shiftLabel}</div>
            <div className="agent-stat-grid">
              <StatTile label="Needs attention" value={stats.needsAttention} />
              <StatTile label="In progress" value={stats.inProgress} />
              <StatTile label="Waiting" value={stats.waiting} tone="waiting" />
              <StatTile label="Handover risk" value={stats.handoverRisk} tone="escalated" />
            </div>
            {approved ? (
              <div className="agent-approved">✓ Approved</div>
            ) : (
              <div className="agent-response-actions">
                <SecondaryButton fullWidth={false} onClick={() => push({ name: 'teamWork' })}>
                  Review
                </SecondaryButton>
                <SecondaryButton fullWidth={false} onClick={approve}>
                  Approve
                </SecondaryButton>
              </div>
            )}
          </AIResponse>
        )

      case 'announce':
        return (
          <AIResponse>
            <div className="agent-announcement-title">Ward announcement</div>
            <div>Ward meeting tomorrow at 2:00 PM. Please submit reports before the meeting.</div>
            {approved ? (
              <div className="agent-approved">✓ Posted</div>
            ) : (
              <div className="agent-response-actions">
                <SecondaryButton fullWidth={false} onClick={() => {}}>
                  Edit
                </SecondaryButton>
                <SecondaryButton fullWidth={false} onClick={approve}>
                  Post
                </SecondaryButton>
              </div>
            )}
          </AIResponse>
        )

      case 'outstanding':
        return (
          <AIResponse>
            <div>
              {outstanding.length} outstanding item{outstanding.length === 1 ? '' : 's'} on the ward
            </div>
            <ul className="agent-outstanding-list">
              {outstanding.map((item) => (
                <li key={item.id}>
                  <span className="agent-outstanding-bed">{contextLabelFor(data, item)}</span>
                  <span>{item.title}</span>
                </li>
              ))}
              {outstanding.length === 0 && <li>Nothing outstanding right now.</li>}
            </ul>
          </AIResponse>
        )

      case 'handover':
        return (
          <AIResponse>
            <div>I prepared a draft from today's confirmed work.</div>
            <SecondaryButton fullWidth={false} onClick={() => push({ name: 'handover' })}>
              Review before action
            </SecondaryButton>
          </AIResponse>
        )

      default:
        return (
          <AIResponse>
            <div>{FALLBACK_TEXT}</div>
          </AIResponse>
        )
    }
  }

  const prompts = teamMode ? TEAM_PROMPTS : PERSONAL_PROMPTS

  return (
    <AppShell title="Workflow Agent" onBack={goBack}>
      <SectionHeader eyebrow="Connected to this shift's work" title="Workflow Agent" subtitle="Find what's outstanding and get handover-ready." />

      <div className="agent-thread">
        {turns.length === 0 && <div className="agent-empty">AI prepares. The nurse decides.</div>}

        {turns.map((turn) =>
          turn.from === 'nurse' ? (
            <div key={turn.id} className="agent-nurse-turn">
              {turn.text}
            </div>
          ) : (
            <div key={turn.id}>{renderResponse(turn)}</div>
          ),
        )}
      </div>

      <div className="agent-prompts">
        {prompts.map((text) => (
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
    </AppShell>
  )
}
