import { useDemo } from '../state/DemoContext'
import { getBed, getWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { ConfirmationState } from '../components/ConfirmationState'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'
import type { WorkStatus } from '../state/types'

const STATUS_VERB: Record<WorkStatus, string> = {
  TO_DO: 'Work updated',
  IN_PROGRESS: 'Update recorded',
  COMPLETED: 'Work marked completed',
  DEFERRED: 'Work marked deferred',
  ESCALATED: 'Escalation raised',
}

export function ConfirmedScreen({ bedId, workId }: { bedId: string; workId: string }) {
  const { data, goTab, push } = useDemo()
  const bed = getBed(data, bedId)
  const work = getWork(data, workId)

  const items = [STATUS_VERB[work.status], 'Team updated', 'Handover reflects the change']

  return (
    <AppShell title="Confirmed" centerContent>
      <div className="confirmed-context-chip">
        {bed.label} · {work.title}
      </div>

      <ConfirmationState items={items} />

      <div className="confirmed-actions">
        <PrimaryButton onClick={() => goTab('now')}>Back to Now</PrimaryButton>
        <SecondaryButton onClick={() => push({ name: 'teamWork' })}>View work</SecondaryButton>
      </div>
    </AppShell>
  )
}
