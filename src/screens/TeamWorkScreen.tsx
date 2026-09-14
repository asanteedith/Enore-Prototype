import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import {
  attentionReason,
  contextLabelFor,
  nextActionFor,
  ownerLabel,
  teamWorkItems,
  waitingDependencyForWork,
  responseDependencyForWork,
} from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'

type ViewMode = 'active' | 'waiting' | 'done'

export function TeamWorkScreen() {
  const { data, push, goTeamTab, openQuickCapture, takeResponsibility, chaseWork, recordResponse, resumeWork, resolveWork } = useDemo()
  const [view, setView] = useState<ViewMode>('active')
  const allItems = teamWorkItems(data)
  const items = allItems.filter((item) => {
    if (view === 'done') return item.status === 'COMPLETED'
    if (view === 'waiting') return !!waitingDependencyForWork(data, item.id)
    return item.status !== 'COMPLETED'
  })

  return (
    <AppShell
      title="Work"
      onCapture={openQuickCapture}
      footer={<TeamBottomNavigation active="teamWork" onSelect={goTeamTab} />}
    >
      <SectionHeader
        eyebrow="Shared work state"
        title="Work Items"
        subtitle="Capture once, structure once, project into personal, team, context, and handover views."
      />

      <div className="view-toggle">
        <button className={`view-toggle-option ${view === 'active' ? 'view-toggle-active' : ''}`} onClick={() => setView('active')} type="button">
          Active
        </button>
        <button className={`view-toggle-option ${view === 'waiting' ? 'view-toggle-active' : ''}`} onClick={() => setView('waiting')} type="button">
          Waiting
        </button>
        <button className={`view-toggle-option ${view === 'done' ? 'view-toggle-active' : ''}`} onClick={() => setView('done')} type="button">
          Done
        </button>
      </div>

      <div className="work-list">
        {items.map((item) => {
          const waiting = waitingDependencyForWork(data, item.id)
          const response = responseDependencyForWork(data, item.id)
          return (
            <div key={item.id} className="team-work-row">
              <button className="team-work-row-context" onClick={() => push({ name: 'workDetail', workId: item.id })} type="button">
                {contextLabelFor(data, item)}
              </button>
              <div className="team-work-row-title">{item.title}</div>
              <div className="team-work-row-meta">{attentionReason(data, item)}</div>
              <div className="team-work-row-meta">Owner: {ownerLabel(data, item.ownerId)}</div>

              <div className="team-work-row-footer">
                <StatusBadge status={item.status} />
                {!item.ownerId && item.status !== 'COMPLETED' && (
                  <button className="team-work-row-action" onClick={() => takeResponsibility(item.id)} type="button">
                    Take
                  </button>
                )}
                {waiting && waiting.status !== 'CHASED' && (
                  <button className="team-work-row-action" onClick={() => chaseWork(item.id)} type="button">
                    Chase
                  </button>
                )}
                {waiting && (
                  <button className="team-work-row-action" onClick={() => recordResponse(item.id)} type="button">
                    Simulate response
                  </button>
                )}
                {response && (
                  <button className="team-work-row-action" onClick={() => resumeWork(item.id)} type="button">
                    Continue
                  </button>
                )}
                {!waiting && !response && item.status !== 'COMPLETED' && (
                  <button className="team-work-row-action" onClick={() => resolveWork(item.id)} type="button">
                    {nextActionFor(data, item) === 'Start' ? 'Start' : 'Complete'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
