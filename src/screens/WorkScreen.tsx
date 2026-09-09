import { useDemo } from '../state/DemoContext'
import { getBed, isJustUpdated, needsAttention } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { BottomNavigation } from '../components/BottomNavigation'
import { SectionHeader } from '../components/SectionHeader'
import { WorkItemRow } from '../components/WorkItemRow'

export function WorkScreen() {
  const { data, push, goTab, openQuickCapture } = useDemo()
  const attention = needsAttention(data)

  return (
    <AppShell
      title="Work"
      onCapture={openQuickCapture}
      onOpenAgent={() => push({ name: 'workflowAgent' })}
      footer={<BottomNavigation active="work" onSelect={goTab} />}
    >
      <SectionHeader eyebrow="Shared with the care team" title="Today" subtitle={`${data.work.length} items · ${attention.length} need attention`} />

      <div className="work-list">
        {data.work.map((item) => {
          const bed = getBed(data, item.bedId)
          const meta =
            item.status === 'TO_DO'
              ? item.dueLabel
              : item.status === 'IN_PROGRESS'
                ? `Being handled by ${item.assignedTo}`
                : undefined

          return (
            <WorkItemRow
              key={item.id}
              bedLabel={bed.label}
              title={item.title}
              status={item.status}
              meta={meta}
              justUpdated={isJustUpdated(data, item.id)}
              onClick={() => push({ name: 'careContext', bedId: item.bedId })}
            />
          )
        })}
      </div>
    </AppShell>
  )
}
