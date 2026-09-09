import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import { careContextIdOf, contextLabelFor } from '../state/selectors'
import type { WorkItem } from '../state/types'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'

type ViewMode = 'team' | 'mine'

function priorityRank(item: WorkItem): number {
  if (item.status === 'ESCALATED') return 0
  if (item.waitingOn) return 1
  if (item.followUpNeeded) return 2
  if (!item.assignedTo) return 3
  if (item.status === 'COMPLETED') return 5
  return 4
}

export function TeamWorkScreen() {
  const { data, push, goTeamTab, personaName, openQuickCapture, takeResponsibility, chaseWork, resolveWork } = useDemo()
  const [view, setView] = useState<ViewMode>('team')

  const items = data.work
    .filter((w) => (view === 'mine' ? w.assignedTo === personaName : true))
    .slice()
    .sort((a, b) => priorityRank(a) - priorityRank(b))

  return (
    <AppShell
      title="Team Work"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent', teamMode: true })}
      footer={<TeamBottomNavigation active="teamWork" onSelect={goTeamTab} />}
    >
      <SectionHeader eyebrow="Shared with the team" title="Work" subtitle="Belongs to the ward before it belongs to any one nurse." />

      <div className="view-toggle">
        <button className={`view-toggle-option ${view === 'team' ? 'view-toggle-active' : ''}`} onClick={() => setView('team')} type="button">
          Team work
        </button>
        <button className={`view-toggle-option ${view === 'mine' ? 'view-toggle-active' : ''}`} onClick={() => setView('mine')} type="button">
          My view
        </button>
      </div>

      <div className="work-list">
        {items.map((item) => {
          const contextId = careContextIdOf(item)
          const label = contextLabelFor(data, item)

          return (
            <div key={item.id} className="team-work-row">
              <button
                className="team-work-row-context"
                onClick={contextId ? () => push({ name: 'teamContextDetail', contextId }) : undefined}
                type="button"
                disabled={!contextId}
              >
                {label}
              </button>
              <div className="team-work-row-title">{item.title}</div>

              {item.status === 'ESCALATED' && (
                <div className="team-work-row-meta team-work-row-meta-escalated">
                  {item.escalationReason} · {item.escalatedAtLabel}
                </div>
              )}
              {item.waitingOn && (
                <div className="team-work-row-meta">
                  {item.waitingOn} · {item.waitingSinceLabel}
                </div>
              )}
              {item.followUpNeeded && !item.waitingOn && <div className="team-work-row-meta">Follow-up needed</div>}
              {!item.waitingOn && !item.followUpNeeded && item.status !== 'ESCALATED' && item.status !== 'COMPLETED' && (
                <div className="team-work-row-meta">{item.assignedTo ? `Assigned to ${item.assignedTo}` : item.dueLabel}</div>
              )}

              <div className="team-work-row-footer">
                <StatusBadge status={item.status} />
                {!item.assignedTo && item.status !== 'COMPLETED' && <span className="just-updated-tag">Unassigned</span>}

                {!item.assignedTo && item.status !== 'COMPLETED' && (
                  <button className="team-work-row-action" onClick={() => takeResponsibility(item.id)} type="button">
                    Take responsibility
                  </button>
                )}
                {item.waitingOn && !item.chased && (
                  <button className="team-work-row-action" onClick={() => chaseWork(item.id)} type="button">
                    Chase
                  </button>
                )}
                {item.assignedTo && item.status !== 'COMPLETED' && !item.waitingOn && item.status !== 'ESCALATED' && (
                  <button className="team-work-row-action" onClick={() => resolveWork(item.id)} type="button">
                    Mark done
                  </button>
                )}
              </div>
            </div>
          )
        })}
        {items.length === 0 && <div className="context-empty">Nothing assigned to you right now.</div>}
      </div>
    </AppShell>
  )
}
