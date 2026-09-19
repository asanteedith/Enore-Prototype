import type { ReactNode } from 'react'
import { AgentIcon, BackIcon, CaptureIcon } from './icons'

interface Props {
  title?: string
  onBack?: () => void
  onOpenAgent?: () => void
  onCapture?: () => void
  children: ReactNode
  footer?: ReactNode
  centerContent?: boolean
}

export function AppShell({ title, onBack, onOpenAgent, onCapture, children, footer, centerContent }: Props) {
  return (
    <div className="app-shell">
      <div className="synthetic-strip">SYNTHETIC DATA · NOT FOR CLINICAL USE</div>
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
          {onCapture && (
            <button className="app-header-capture" onClick={onCapture} type="button" aria-label="Quick capture">
              <CaptureIcon />
            </button>
          )}
          {onOpenAgent && (
            <button className="app-header-agent" onClick={onOpenAgent} type="button" aria-label="ENORE Assist">
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
