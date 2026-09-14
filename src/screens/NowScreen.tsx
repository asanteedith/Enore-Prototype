import { useDemo } from '../state/DemoContext'
import { attentionReason, contextLabelFor, nextActionFor, syncLabel, workForPersona } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'

export function NowScreen() {
  const { data, push, goTeamTab, personaName, personaRole, connectToTeam, resolveWork } = useDemo()
  const items = workForPersona(data, personaName).filter((item) => item.status !== 'COMPLETED')

  return (
    <AppShell title="My Work" footer={<TeamBottomNavigation active="now" onSelect={goTeamTab} />}>
      <SectionHeader
        eyebrow={`${personaName} - ${personaRole}`}
        title="What I need to do or know"
        subtitle="A personal projection of the shared work state, plus local work that can connect to the team."
      />

      <div className="work-list">
        {items.map((item) => (
          <div key={item.id} className="team-work-row">
            <button className="team-work-row-context" onClick={() => push({ name: 'workDetail', workId: item.id })} type="button">
              {contextLabelFor(data, item)}
            </button>
            <div className="team-work-row-title">{item.title}</div>
            <div className="team-work-row-meta">{attentionReason(data, item)}</div>
            <div className="team-work-row-meta">{item.sourceSummary}</div>
            <div className="team-work-row-footer">
              <StatusBadge status={item.status} />
              <span className="just-updated-tag">{syncLabel(item.syncState)}</span>
              {item.scope === 'personal' && (
                <button className="team-work-row-action" onClick={() => connectToTeam(item.id)} type="button">
                  Connect to team
                </button>
              )}
              {item.scope === 'team' && nextActionFor(data, item) === 'Complete' && (
                <button className="team-work-row-action" onClick={() => resolveWork(item.id)} type="button">
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  )
}
