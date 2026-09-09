import { useDemo } from '../state/DemoContext'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { PrimaryButton } from '../components/PrimaryButton'

export function TeamMeetingsScreen() {
  const { data, goBack, push, addMeetingAction } = useDemo()
  const meeting = data.meeting

  return (
    <AppShell title="Meetings" onBack={goBack}>
      <SectionHeader eyebrow="Recorded · transcribed" title={meeting.title} subtitle={meeting.dateLabel} />

      <div className="meeting-block">
        <div className="meeting-block-title">Key discussion</div>
        <div className="meeting-block-body">{meeting.discussion}</div>
      </div>

      <div className="meeting-block">
        <div className="meeting-block-title">Decision</div>
        <div className="meeting-block-body">{meeting.decision}</div>
      </div>

      <div className="meeting-block meeting-block-action">
        <div className="meeting-block-title">Action</div>
        <div className="meeting-block-body">{meeting.actionTitle}</div>
        <div className="meeting-block-meta">Responsible: {meeting.actionOwner}</div>

        {meeting.actionAdded ? (
          <div className="agent-approved">✓ Added to Team Work</div>
        ) : (
          <PrimaryButton onClick={addMeetingAction}>Add to Team Work</PrimaryButton>
        )}
      </div>

      <div className="meeting-block">
        <div className="meeting-block-title">Follow-up</div>
        <div className="meeting-block-body">{meeting.followUp}</div>
      </div>

      {meeting.actionAdded && (
        <PrimaryButton onClick={() => push({ name: 'teamWork' })}>View in Team Work</PrimaryButton>
      )}

      <p className="capture-trust-note">Recorded and transcribed automatically. The nurse in-charge reviews before anything becomes work.</p>
    </AppShell>
  )
}
