import type { Screen } from '../state/types'
import { HomeIcon, PatientsIcon, WorkIcon, PaperIcon, HandoverIcon } from './icons'

type Tab = 'home' | 'patients' | 'work' | 'paper' | 'handover'

const TABS: { key: Tab; label: string; icon: typeof HomeIcon; screen: Screen }[] = [
  { key: 'home', label: 'Home', icon: HomeIcon, screen: { name: 'home' } },
  { key: 'patients', label: 'Patients', icon: PatientsIcon, screen: { name: 'patients' } },
  { key: 'work', label: 'Work', icon: WorkIcon, screen: { name: 'work' } },
  { key: 'paper', label: 'Paper', icon: PaperIcon, screen: { name: 'paper' } },
  { key: 'handover', label: 'Handover', icon: HandoverIcon, screen: { name: 'handover' } },
]

export function BottomNav({ active, onSelect }: { active: Tab; onSelect: (screen: Screen) => void }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ key, label, icon: Icon, screen }) => (
        <button
          key={key}
          className={`bottom-nav-item ${active === key ? 'bottom-nav-item-active' : ''}`}
          onClick={() => onSelect(screen)}
          type="button"
        >
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}

export type { Tab }
