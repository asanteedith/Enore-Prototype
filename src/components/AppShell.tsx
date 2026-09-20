import type { ReactNode } from 'react'
import { AgentIcon, BackIcon } from './icons'
import { CaptureFAB } from './CaptureFAB'
import { ConnectivityIndicator } from './ConnectivityIndicator'

interface Props {
  title?: string
  onBack?: () => void
  onOpenAgent?: () => void
  onCapture?: () => void
  children: ReactNode
  footer?: ReactNode
  centerContent?: boolean
  showConnectivity?: boolean
}

export function AppShell({ title, onBack, onOpenAgent, onCapture, children, footer, centerContent, showConnectivity = true }: Props) {
  return (
    <div className={`app-shell ${footer ? 'app-shell-has-footer' : ''}`}>
      <div className="synthetic-strip">
        <span>SYNTHETIC DATA · NOT FOR CLINICAL USE</span>
        {showConnectivity && <ConnectivityIndicator />}
      </div>
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
            <button className="app-header-agent" onClick={onOpenAgent} type="button" aria-label="ENORE Assist">
              <AgentIcon />
            </button>
          )}
        </div>
      </header>

      <main className={`app-content ${centerContent ? 'app-content-center' : ''}`}>{children}</main>

      {onCapture && <CaptureFAB onClick={onCapture} />}

      {footer}
    </div>
  )
}
