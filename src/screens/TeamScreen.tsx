import { useDemo } from '../state/DemoContext'
import { getBed } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { BottomNavigation } from '../components/BottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { TeamUpdate } from '../components/TeamUpdate'

export function TeamScreen() {
  const { data, push, goTab } = useDemo()

  const wardUpdates = data.work.filter((w) => w.status === 'IN_PROGRESS')
  const escalation = data.work.find((w) => w.id === 'w3')
  const escalationBed = escalation ? getBed(data, escalation.bedId) : null

  return (
    <AppShell
      title="Team"
      onOpenAgent={() => push({ name: 'workflowAgent' })}
      footer={<BottomNavigation active="team" onSelect={goTab} />}
    >
      <SectionHeader title="Team" subtitle="Communication stays connected to work." />

      {wardUpdates.length > 0 && (
        <div className="team-section">
          {wardUpdates.map((item) => {
            const bed = getBed(data, item.bedId)
            return (
              <TeamUpdate
                key={item.id}
                kind="wardUpdate"
                title={`${bed.label} needs ${item.title.toLowerCase()}`}
                meta={`Assigned to ${item.assignedTo} · In progress`}
                onClick={() => push({ name: 'careContext', bedId: bed.id })}
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

      {escalation && escalationBed && (
        <div className="team-section">
          <TeamUpdate
            kind="escalation"
            title={`${escalationBed.label} ${escalation.title.toLowerCase()}`}
            meta="Team notified · Awaiting response"
          />
        </div>
      )}
    </AppShell>
  )
}
