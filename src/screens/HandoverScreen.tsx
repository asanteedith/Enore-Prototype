import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import { attentionReason, contextLabelFor, handoverItems, ownerLabel } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { PrimaryButton } from '../components/PrimaryButton'
import { StatusBadge } from '../components/StatusBadge'

export function HandoverScreen() {
  const { data, push, goTeamTab } = useDemo()
  const [reviewed, setReviewed] = useState(false)
  const items = handoverItems(data)

  return (
    <AppShell title="Handover" footer={<TeamBottomNavigation active="handover" onSelect={goTeamTab} />}>
      <SectionHeader
        eyebrow="Derived from unfinished work"
        title="Next shift can continue"
        subtitle="No separate handover task store. If work is not completed, it stays visible."
      />

      <div className="work-list">
        {items.map((item) => (
          <button key={item.id} className="attention-card" onClick={() => push({ name: 'workDetail', workId: item.id })} type="button">
            <div className="attention-card-top">
              <span>{contextLabelFor(data, item)}</span>
              <StatusBadge status={item.status} />
            </div>
            <div className="attention-card-title">{item.title}</div>
            <div className="attention-card-reason">{attentionReason(data, item)}</div>
            <div className="attention-card-footer">
              <span>Owner: {ownerLabel(data, item.ownerId)}</span>
              <strong>{item.handoverNote}</strong>
            </div>
          </button>
        ))}
      </div>

      {reviewed ? (
        <div className="handover-reviewed">Reviewed. Unfinished work remains live for the next shift.</div>
      ) : (
        <PrimaryButton onClick={() => setReviewed(true)}>Review handover</PrimaryButton>
      )}

      <p className="handover-trust-note">Human review remains required. Enore carries operational work forward.</p>
    </AppShell>
  )
}
