import type { TabName } from '../state/types'
import { NowIcon, TeamIcon, WorkIcon } from './icons'

interface Props {
  active: TabName
  onSelect: (tab: TabName) => void
}

const TABS: { key: TabName; label: string; Icon: typeof NowIcon }[] = [
  { key: 'teamHome', label: 'Overview', Icon: NowIcon },
  { key: 'now', label: 'My Work', Icon: TeamIcon },
  { key: 'teamWork', label: 'Work', Icon: WorkIcon },
  { key: 'handover', label: 'Handover', Icon: TeamIcon },
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
