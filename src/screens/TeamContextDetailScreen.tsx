import { useDemo } from '../state/DemoContext'
import { attentionReason, getCareContext, ownerLabel, teamActivityForContext, workForContext } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { CareContextHeader } from '../components/CareContextHeader'
import { StatusBadge } from '../components/StatusBadge'

export function TeamContextDetailScreen({ contextId }: { contextId: string }) {
  const { data, push, goBack } = useDemo()
  const context = getCareContext(data, contextId)
  const items = workForContext(data, contextId)
  const activity = teamActivityForContext(data, contextId)
  const openItems = items.filter((w) => w.status !== 'COMPLETED')

  return (
    <AppShell title={context.label} onBack={goBack}>
      <CareContextHeader
        bedLabel={context.label}
        status={context.status}
        detail={openItems.length === 0 ? 'No open work' : `${openItems.length} open work item${openItems.length === 1 ? '' : 's'}`}
      />

      <div className="context-section">
        <div className="context-section-title">Work around this care context</div>
        {items.map((item) => (
          <button key={item.id} className="context-work-card team-context-work-card context-work-button" onClick={() => push({ name: 'workDetail', workId: item.id })} type="button">
            <div className="context-work-card-top">
              <span className="context-work-title">{item.title}</span>
              <StatusBadge status={item.status} />
            </div>
            <div className="context-work-meta">{attentionReason(data, item)}</div>
            <div className="context-work-meta">Owner: {ownerLabel(data, item.ownerId)}</div>
          </button>
        ))}
        {items.length === 0 && <div className="context-empty">No work recorded for this context.</div>}
      </div>

      <div className="context-section">
        <div className="context-section-title">Context activity</div>
        <div className="context-team-activity">{activity}</div>
      </div>
    </AppShell>
  )
}
