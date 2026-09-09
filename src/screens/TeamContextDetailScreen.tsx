import { useDemo } from '../state/DemoContext'
import { getCareContext, teamActivityForContext, workForContext } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { CareContextHeader } from '../components/CareContextHeader'
import { StatusBadge } from '../components/StatusBadge'
import { SecondaryButton } from '../components/SecondaryButton'

export function TeamContextDetailScreen({ contextId }: { contextId: string }) {
  const { data, push, goBack, personaName, takeResponsibility, chaseWork, resolveWork } = useDemo()
  const context = getCareContext(data, contextId)
  const items = workForContext(data, contextId)
  const activity = teamActivityForContext(data, contextId)

  const openItems = items.filter((w) => w.status !== 'COMPLETED')
  const detail =
    openItems.length === 0
      ? 'No open work'
      : openItems.length === 1
        ? '1 item needs attention'
        : `${openItems.length} items need attention`

  return (
    <AppShell title={context.label} onBack={goBack} onOpenAgent={() => push({ name: 'workflowAgent', teamMode: true })}>
      <CareContextHeader bedLabel={context.label} status={context.status} detail={detail} />

      <div className="context-section">
        <div className="context-section-title">Work around this context</div>

        {items.length === 0 && <div className="context-empty">No work recorded for this context.</div>}

        {items.map((item) => (
          <div key={item.id} className="context-work-card team-context-work-card">
            <div className="context-work-card-top">
              <span className="context-work-title">{item.title}</span>
              <StatusBadge status={item.status} />
            </div>

            {item.status === 'ESCALATED' && (
              <div className="context-work-meta">
                {item.escalationReason} · {item.escalatedAtLabel}
              </div>
            )}
            {item.waitingOn && (
              <div className="context-work-meta">
                {item.waitingOn} · {item.waitingSinceLabel}
              </div>
            )}
            {!item.waitingOn && item.status === 'TO_DO' && <div className="context-work-meta">{item.assignedTo ? `Assigned to ${item.assignedTo}` : 'Unassigned'}</div>}
            {item.status === 'IN_PROGRESS' && !item.waitingOn && <div className="context-work-meta">Being handled by {item.assignedTo}</div>}

            {item.status !== 'COMPLETED' && (
              <div className="context-work-actions">
                {!item.assignedTo && (
                  <SecondaryButton fullWidth={false} onClick={() => takeResponsibility(item.id)}>
                    Take responsibility
                  </SecondaryButton>
                )}
                {item.waitingOn && !item.chased && (
                  <SecondaryButton fullWidth={false} onClick={() => chaseWork(item.id)}>
                    Chase
                  </SecondaryButton>
                )}
                {item.assignedTo && !item.waitingOn && item.status !== 'ESCALATED' && (
                  <SecondaryButton fullWidth={false} onClick={() => resolveWork(item.id)}>
                    Mark done
                  </SecondaryButton>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="context-section">
        <div className="context-section-title">Team activity</div>
        <div className="context-team-activity">{activity}</div>
      </div>

      <p className="capture-trust-note">Viewing as {personaName}.</p>
    </AppShell>
  )
}
