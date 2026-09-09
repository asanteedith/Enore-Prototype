import type { TeamTabName } from '../state/types'
import { ContextsIcon, NowIcon, TeamIcon, WorkIcon } from './icons'

interface Props {
  active: TeamTabName
  onSelect: (tab: TeamTabName) => void
}

const TABS: { key: TeamTabName; label: string; Icon: typeof NowIcon }[] = [
  { key: 'teamHome', label: 'Home', Icon: NowIcon },
  { key: 'teamWork', label: 'Work', Icon: WorkIcon },
  { key: 'teamContexts', label: 'Contexts', Icon: ContextsIcon },
  { key: 'teamPeople', label: 'People', Icon: TeamIcon },
]

export function TeamBottomNavigation({ active, onSelect }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, Icon }) => (
        <button
          key={key}
          className={`bottom-nav-item ${active === key ? 'bottom-nav-item-active' : ''}`}
          onClick={() => onSelect(key)}
          type="button"
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
