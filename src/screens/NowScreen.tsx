import { useDemo } from '../state/DemoContext'
import { contextLabelFor, needsAttention } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { BottomNavigation } from '../components/BottomNavigation'
import { SectionHeader } from '../components/SectionHeader'

export function NowScreen() {
  const { data, push, goTab, openQuickCapture } = useDemo()
  const attention = needsAttention(data)
  const focus = attention.slice(0, 2)

  return (
    <AppShell
      title="Now"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent' })}
      footer={<BottomNavigation active="now" onSelect={goTab} />}
    >
      <div className="now-greeting">
        <h1>Good morning, {data.nurseName}</h1>
        <p>
          {data.ward} · {data.shiftLabel}
        </p>
      </div>

      <SectionHeader
        eyebrow="What matters right now"
        title={`${focus.length} thing${focus.length === 1 ? '' : 's'} need attention`}
      />

      <div className="now-focus-list">
        {focus.map((item) => {
          const label = contextLabelFor(data, item)
          const bedId = item.bedId
          const meta =
            item.status === 'TO_DO'
              ? `${item.dueLabel} · ${item.assignedTo ? `Assigned to ${item.assignedTo}` : 'Unassigned'}`
              : `${item.dueLabel} · Assigned to ${item.assignedTo === data.nurseName ? 'you' : item.assignedTo}`

          return (
            <button
              key={item.id}
              className="now-focus-card"
              onClick={() => bedId && push({ name: 'careContext', bedId })}
            >
              <div className="now-focus-card-top">
                <span className="now-focus-bed">{label}</span>
                {item.status === 'TO_DO' && !item.assignedTo && <span className="now-focus-cta">Start</span>}
              </div>
              <div className="now-focus-title">{item.title}</div>
              <div className="now-focus-meta">{meta}</div>
            </button>
          )
        })}
      </div>

      <button className="now-team-card" onClick={() => goTab('team')}>
        <div className="now-team-card-kind">Team update</div>
        <div className="now-team-card-title">Handover updated</div>
        <div className="now-team-card-meta">{data.changes.length} important changes since last review</div>
      </button>
    </AppShell>
  )
}
