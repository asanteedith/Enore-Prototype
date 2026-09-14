import type { TeamTabName } from '../state/types'
import { NowIcon, TeamIcon, WorkIcon } from './icons'

interface Props {
  active: TeamTabName
  onSelect: (tab: TeamTabName) => void
}

const TABS: { key: TeamTabName; label: string; Icon: typeof NowIcon }[] = [
  { key: 'teamHome', label: 'Overview', Icon: NowIcon },
  { key: 'now', label: 'My Work', Icon: TeamIcon },
  { key: 'teamWork', label: 'Work', Icon: WorkIcon },
  { key: 'handover', label: 'Handover', Icon: TeamIcon },
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
