import { useApp } from '../state/AppContext'
import { WorkCard } from '../components/WorkCard'
import { completedItems, interruptedItems, myActionItems, waitingOnOthers, watchingItems } from '../state/selectors'

export function WorkScreen() {
  const { state } = useApp()

  const groups = [
    { key: 'mine', label: 'MY ACTIONS', items: myActionItems(state) },
    { key: 'waiting', label: 'WAITING ON OTHERS', items: waitingOnOthers(state) },
    { key: 'watching', label: 'WATCHING', items: watchingItems(state) },
    { key: 'interrupted', label: 'INTERRUPTED / RESUME', items: interruptedItems(state) },
    { key: 'completed', label: 'COMPLETED', items: completedItems(state) },
  ]

  return (
    <>
      <div className="screen-title">Work</div>
      {groups.map((group) => (
        <section className="home-section" key={group.key}>
          <div className="home-section-title">{group.label}</div>
          {group.items.length === 0 && <p className="home-empty">Nothing here.</p>}
          {group.items.map((item) => (
            <WorkCard key={`${group.key}-${item.id}`} item={item} />
          ))}
        </section>
      ))}
    </>
  )
}
