import type { TabName } from '../state/types'
import { BedsIcon, NowIcon, TeamIcon, WorkIcon } from './icons'

interface Props {
  active: TabName
  onSelect: (tab: TabName) => void
}

const TABS: { key: TabName; label: string; Icon: typeof NowIcon }[] = [
  { key: 'now', label: 'Now', Icon: NowIcon },
  { key: 'beds', label: 'Beds', Icon: BedsIcon },
  { key: 'work', label: 'Work', Icon: WorkIcon },
  { key: 'team', label: 'Team', Icon: TeamIcon },
]

export function BottomNavigation({ active, onSelect }: Props) {
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
