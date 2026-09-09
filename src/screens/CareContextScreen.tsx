import { useDemo } from '../state/DemoContext'
import { careContextDetail, getBed, isJustUpdated, primaryWorkForBed, teamActivityForBed } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { CareContextHeader } from '../components/CareContextHeader'
import { PrimaryButton } from '../components/PrimaryButton'
import { StatusBadge } from '../components/StatusBadge'

export function CareContextScreen({ bedId }: { bedId: string }) {
  const { data, push, goBack, startWork } = useDemo()
  const bed = getBed(data, bedId)
  const work = primaryWorkForBed(data, bedId)
  const teamActivity = teamActivityForBed(data, bedId)
  const justUpdated = work ? isJustUpdated(data, work.id) : false

  return (
    <AppShell title={bed.label} onBack={goBack} onOpenAgent={() => push({ name: 'workflowAgent' })}>
      <CareContextHeader bedLabel={bed.label} status={bed.status} detail={careContextDetail(work)} justUpdated={justUpdated} />

      {work && work.status === 'COMPLETED' && (
        <div className="context-updated-meta">Last update: {work.completedAt}</div>
      )}

      <div className="context-section">
        <div className="context-section-title">Work around this context</div>

        {work && work.status !== 'COMPLETED' ? (
          <div className="context-work-card">
            <div className="context-work-card-top">
              <span className="context-work-title">{work.title}</span>
              <StatusBadge status={work.status} />
            </div>
            {work.status === 'TO_DO' && <div className="context-work-meta">{work.dueLabel}</div>}
            {work.status === 'IN_PROGRESS' && (
              <div className="context-work-meta">
                {work.startedAt ?? 'In progress'} · Being handled by {work.assignedTo}
              </div>
            )}
          </div>
        ) : (
          <div className="context-empty">No outstanding work</div>
        )}

        {work && work.status === 'COMPLETED' && <div className="context-next-review">Next review: {bed.nextReview}</div>}
      </div>

      <div className="context-section">
        <div className="context-section-title">Team activity</div>
        <div className="context-team-activity">{teamActivity}</div>
      </div>

      {work && work.status === 'TO_DO' && (
        <PrimaryButton onClick={() => startWork(bed.id, work.id)}>Start work</PrimaryButton>
      )}

      {work && work.status === 'IN_PROGRESS' && (
        <PrimaryButton onClick={() => push({ name: 'capture', bedId: bed.id, workId: work.id })}>
          Capture update
        </PrimaryButton>
      )}
    </AppShell>
  )
}
