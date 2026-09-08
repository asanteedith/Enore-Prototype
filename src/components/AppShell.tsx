import type { ReactNode } from 'react'
import { AgentIcon, BackIcon } from './icons'

interface Props {
  title?: string
  onBack?: () => void
  onOpenAgent?: () => void
  children: ReactNode
  footer?: ReactNode
  centerContent?: boolean
}

export function AppShell({ title, onBack, onOpenAgent, children, footer, centerContent }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-side">
          {onBack && (
            <button className="app-header-back" onClick={onBack} type="button" aria-label="Back">
              <BackIcon />
            </button>
          )}
        </div>
        <div className="app-header-title">{title}</div>
        <div className="app-header-side app-header-side-right">
          {onOpenAgent && (
            <button className="app-header-agent" onClick={onOpenAgent} type="button" aria-label="Workflow Agent">
              <AgentIcon />
            </button>
          )}
        </div>
      </header>

      <main className={`app-content ${centerContent ? 'app-content-center' : ''}`}>{children}</main>

      {footer}
    </div>
  )
}
