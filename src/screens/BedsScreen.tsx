import { useDemo } from '../state/DemoContext'
import { careContextDetail, primaryWorkForBed } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { BottomNavigation } from '../components/BottomNavigation'
import { SectionHeader } from '../components/SectionHeader'

export function BedsScreen() {
  const { data, push, goTab, openQuickCapture } = useDemo()

  return (
    <AppShell
      title="Beds"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent' })}
      footer={<BottomNavigation active="beds" onSelect={goTab} />}
    >
      <SectionHeader eyebrow={data.ward} title="Beds" subtitle="Where care is happening right now." />

      <div className="bed-list">
        {data.beds.map((bed) => {
          const work = primaryWorkForBed(data, bed.id)
          return (
            <button key={bed.id} className="bed-row" onClick={() => push({ name: 'careContext', bedId: bed.id })}>
              <div className="bed-row-main">
                <span className="bed-row-label">{bed.label}</span>
                <span className="bed-row-status">{bed.status}</span>
              </div>
              <span className="bed-row-context">{careContextDetail(work)}</span>
            </button>
          )
        })}
      </div>
    </AppShell>
  )
}
