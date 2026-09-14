import { useDemo } from '../state/DemoContext'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { TeamUpdate } from '../components/TeamUpdate'

const ON_SHIFT = [
  { name: 'Edith', role: 'Staff Nurse' },
  { name: 'Ama', role: 'Nurse In-Charge' },
  { name: 'Kwame', role: 'Staff Nurse' },
]

export function TeamPeopleScreen() {
  const { data, push, goTeamTab, openQuickCapture } = useDemo()

  return (
    <AppShell
      title="People"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent', teamMode: true })}
      footer={<TeamBottomNavigation active="teamPeople" onSelect={goTeamTab} />}
    >
      <SectionHeader eyebrow={data.ward} title="People" subtitle="On shift now." />

      <div className="people-list">
        {ON_SHIFT.map((person) => (
          <div key={person.name} className="people-row">
            <span className="people-row-name">{person.name}</span>
            <span className="people-row-role">{person.role}</span>
          </div>
        ))}
      </div>

      <div className="team-section">
        <TeamUpdate
          kind="handover"
          title={`${data.changes.length} important changes since 8:00 AM`}
          meta="Review and finalize the next-shift handover"
          onClick={() => push({ name: 'handover' })}
        />
      </div>

      <div className="team-section">
        <TeamUpdate
          kind="meeting"
          title={data.meeting.title}
          meta={data.meeting.dateLabel}
          onClick={() => push({ name: 'teamMeetings' })}
        />
      </div>
    </AppShell>
  )
}
