import { useDemo } from '../state/DemoContext'
import { attentionItems, attentionReason, contextLabelFor, nextActionFor, ownerLabel, syncLabel, teamStats } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { StatTile } from '../components/StatTile'
import { StatusBadge } from '../components/StatusBadge'

export function TeamHomeScreen() {
  const { data, push, goTeamTab, personaName, personaRole, openQuickCapture } = useDemo()
  const stats = teamStats(data)
  const attention = attentionItems(data, 5)
  const latest = data.changes.slice(-3).reverse()

  return (
    <AppShell
      title="Overview"
      onCapture={openQuickCapture}
      footer={<TeamBottomNavigation active="teamHome" onSelect={goTeamTab} />}
    >
      <SectionHeader
        eyebrow={`${personaName} - ${personaRole}`}
        title="What needs attention now"
        subtitle="Operational urgency only. Enore is not making clinical decisions."
      />

      <div className="sync-strip">
        <span>Shared work state</span>
        <strong>{syncLabel('SYNCED')}</strong>
      </div>

      <div className="stat-grid">
        <StatTile label="Needs now" value={stats.needsAttention} />
        <StatTile label="Waiting" value={stats.waiting} tone="waiting" />
        <StatTile label="Responses" value={stats.responseReceived} />
        <StatTile label="Handover risk" value={stats.handoverRisk} tone="escalated" />
      </div>

      <div className="work-list">
        {attention.map((item) => (
          <button key={item.id} className="attention-card" onClick={() => push({ name: 'workDetail', workId: item.id })} type="button">
            <div className="attention-card-top">
              <span>{contextLabelFor(data, item)}</span>
              <StatusBadge status={item.status} />
            </div>
            <div className="attention-card-title">{item.title}</div>
            <div className="attention-card-reason">{attentionReason(data, item)}</div>
            <div className="attention-card-footer">
              <span>Owner: {ownerLabel(data, item.ownerId)}</span>
              <strong>{nextActionFor(data, item)}</strong>
            </div>
          </button>
        ))}
      </div>

      <SectionHeader eyebrow="Changed recently" title="Activity" />
      <div className="activity-list">
        {latest.map((change) => (
          <button key={change.id} className="activity-row" onClick={() => change.workId && push({ name: 'workDetail', workId: change.workId })} type="button">
            <span>{change.timeLabel}</span>
            <strong>{change.text}</strong>
            <em>{change.syncState ? syncLabel(change.syncState) : 'Synced'}</em>
          </button>
        ))}
      </div>
    </AppShell>
  )
}
