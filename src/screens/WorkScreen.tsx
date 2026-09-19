import { useApp } from '../state/AppContext'
import { WorkCard } from '../components/WorkCard'
import { doneItems, nextItems, nowItems, overdueItems, waitingItems } from '../state/selectors'

export function WorkScreen() {
  const { state, push, completeWorkItem } = useApp()

  const groups: { key: string; label: string; items: ReturnType<typeof nowItems> }[] = [
    { key: 'now', label: 'NOW', items: nowItems(state) },
    { key: 'next', label: 'NEXT', items: nextItems(state) },
    { key: 'waiting', label: 'WAITING', items: waitingItems(state) },
    { key: 'overdue', label: 'OVERDUE', items: overdueItems(state) },
    { key: 'done', label: 'DONE', items: doneItems(state) },
  ]

  return (
    <>
      <div className="screen-title">Work</div>
      {groups.map((group) => (
        <section className="home-section" key={group.key}>
          <div className="home-section-title">{group.label}</div>
          {group.items.length === 0 && <p className="home-empty">Nothing here.</p>}
          {group.items.map((item) => (
            <WorkCard
              key={`${group.key}-${item.id}`}
              item={item}
              onClick={() => push({ name: 'patientDetail', patientId: item.patientId })}
              onComplete={group.key !== 'done' ? () => completeWorkItem(item.id) : undefined}
            />
          ))}
        </section>
      ))}
    </>
  )
}
