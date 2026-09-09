import { useDemo } from '../state/DemoContext'
import { careContextIdOf, contextLabelFor, teamPriorityItems, teamStats } from '../state/selectors'
import type { WorkItem } from '../state/types'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { StatTile } from '../components/StatTile'
import { WorkItemRow } from '../components/WorkItemRow'

function itemMeta(item: WorkItem): string | undefined {
  if (item.status === 'ESCALATED') return item.escalationReason ? `${item.escalationReason} · ${item.escalatedAtLabel}` : item.escalatedAtLabel
  if (item.waitingOn) return `${item.waitingOn} · ${item.waitingSinceLabel}`
  if (item.followUpNeeded) return 'Follow-up needed'
  if (!item.assignedTo) return 'Unassigned'
  return item.dueLabel
}

export function TeamHomeScreen() {
  const { data, push, goTeamTab, personaName, personaRole, openQuickCapture } = useDemo()
  const stats = teamStats(data)
  const priority = teamPriorityItems(data, 4)

  return (
    <AppShell
      title="Team Workspace"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent', teamMode: true })}
      footer={<TeamBottomNavigation active="teamHome" onSelect={goTeamTab} />}
    >
      <SectionHeader eyebrow={`${personaName} · ${personaRole}`} title={data.ward} subtitle={data.shiftLabel} />

      <div className="stat-grid">
        <StatTile label="Needs attention" value={stats.needsAttention} onClick={() => push({ name: 'teamWork' })} />
        <StatTile label="In progress" value={stats.inProgress} onClick={() => push({ name: 'teamWork' })} />
        <StatTile label="Waiting" value={stats.waiting} tone="waiting" onClick={() => push({ name: 'teamWork' })} />
        <StatTile label="Escalated" value={stats.escalated} tone="escalated" onClick={() => push({ name: 'teamWork' })} />
        <StatTile label="Unassigned" value={stats.unassigned} onClick={() => push({ name: 'teamWork' })} />
      </div>

      <SectionHeader eyebrow="This shift" title="Needs your attention" />

      <div className="work-list">
        {priority.map((item) => {
          const contextId = careContextIdOf(item)
          return (
            <WorkItemRow
              key={item.id}
              bedLabel={contextLabelFor(data, item)}
              title={item.title}
              status={item.status}
              meta={itemMeta(item)}
              onClick={
                contextId
                  ? () => push({ name: 'teamContextDetail', contextId })
                  : () => push({ name: 'teamWork' })
              }
            />
          )
        })}
        {priority.length === 0 && <div className="context-empty">Nothing needs attention right now.</div>}
      </div>
    </AppShell>
  )
}
