import { useDemo } from '../state/DemoContext'
import { contextLabelFor, getWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { BottomNavigation } from '../components/BottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { TeamUpdate } from '../components/TeamUpdate'

export function TeamScreen() {
  const { data, push, goTab, openQuickCapture } = useDemo()

  const wardUpdates = data.work.filter((w) => w.status === 'IN_PROGRESS' && !w.waitingOn && w.bedId)
  const escalation = data.work.find((w) => w.id === 'w3')
  const escalationBedId = escalation?.bedId ?? null

  const recentWork = data.recentUpdate ? getWork(data, data.recentUpdate.workId) : null
  const recentLabel = recentWork ? contextLabelFor(data, recentWork) : null

  return (
    <AppShell
      title="Team"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent' })}
      footer={<BottomNavigation active="team" onSelect={goTab} />}
    >
      <SectionHeader eyebrow={data.ward} title="Team" subtitle="What the ward needs to know, tied to the work — not a separate chat." />

      {recentWork && recentLabel && (
        <div className="team-section">
          <TeamUpdate
            kind="wardUpdate"
            title={`${recentLabel} ${recentWork.title.toLowerCase()} completed`}
            meta={`Confirmed by ${data.nurseName} · Updated just now`}
            onClick={recentWork.bedId ? () => push({ name: 'careContext', bedId: recentWork.bedId! }) : undefined}
          />
        </div>
      )}

      {wardUpdates.length > 0 && (
        <div className="team-section">
          {wardUpdates.map((item) => {
            const label = contextLabelFor(data, item)
            return (
              <TeamUpdate
                key={item.id}
                kind="wardUpdate"
                title={`${label} needs ${item.title.toLowerCase()}`}
                meta={`Assigned to ${item.assignedTo} · In progress`}
                onClick={item.bedId ? () => push({ name: 'careContext', bedId: item.bedId! }) : undefined}
              />
            )
          })}
        </div>
      )}

      <div className="team-section">
        <TeamUpdate
          kind="handover"
          title={`${data.changes.length} important changes since 8:00 AM`}
          meta="Review and finalize handover"
          onClick={() => push({ name: 'handover' })}
        />
      </div>

      {escalation && escalationBedId && (
        <div className="team-section">
          <TeamUpdate
            kind="escalation"
            title={`${contextLabelFor(data, escalation)} ${escalation.title.toLowerCase()}`}
            meta="Team notified · Awaiting response"
            onClick={() => push({ name: 'careContext', bedId: escalationBedId })}
          />
        </div>
      )}

      <button className="team-workspace-entry" onClick={() => push({ name: 'teamHome' })} type="button">
        <div className="team-workspace-entry-title">Team Workspace</div>
        <div className="team-workspace-entry-subtitle">See the full ward picture — unassigned work, escalations, and what the team is waiting on.</div>
      </button>
    </AppShell>
  )
}
