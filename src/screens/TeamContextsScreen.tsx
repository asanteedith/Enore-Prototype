import { useDemo } from '../state/DemoContext'
import { workForContext } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { TeamBottomNavigation } from '../components/TeamBottomNavigation'
import { SectionHeader } from '../components/SectionHeader'

const KIND_LABEL: Record<string, string> = {
  bed: 'Bed',
  theatre: 'Theatre',
  community: 'Community',
  dialysis: 'Dialysis',
  outpatient: 'Outpatient',
  emergency: 'Emergency',
  maternity: 'Maternity',
}

export function TeamContextsScreen() {
  const { data, push, goTeamTab, openQuickCapture } = useDemo()

  return (
    <AppShell
      title="Care Contexts"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent', teamMode: true })}
      footer={<TeamBottomNavigation active="teamContexts" onSelect={goTeamTab} />}
    >
      <SectionHeader eyebrow={data.ward} title="Care Contexts" subtitle="Where care is happening — not only beds." />

      <div className="bed-list">
        {data.careContexts.map((ctx) => {
          const openCount = workForContext(data, ctx.id).filter((w) => w.status !== 'COMPLETED').length
          return (
            <button key={ctx.id} className="bed-row" onClick={() => push({ name: 'teamContextDetail', contextId: ctx.id })}>
              <div className="bed-row-main">
                <span className="bed-row-label">{ctx.label}</span>
                <span className="bed-row-status">
                  {KIND_LABEL[ctx.kind]} · {ctx.status}
                </span>
              </div>
              <span className="bed-row-context">{openCount === 0 ? 'No open work' : `${openCount} open`}</span>
            </button>
          )
        })}
      </div>
    </AppShell>
  )
}
