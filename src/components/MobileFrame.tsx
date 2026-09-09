import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset: () => void
  switchRoleLabel?: string
  onSwitchRole?: () => void
}

export function MobileFrame({ children, onReset, switchRoleLabel, onSwitchRole }: Props) {
  return (
    <div className="frame-viewport">
      <div className="frame-device">
        <div className="frame-statusbar">
          <span>9:41</span>
          <span className="frame-statusbar-dot" aria-hidden="true" />
        </div>
        <div className="frame-screen">{children}</div>
        <div className="frame-home-indicator" />
      </div>
      <div className="frame-controls">
        {onSwitchRole && (
          <button className="frame-switch-role" onClick={onSwitchRole} type="button">
            {switchRoleLabel}
          </button>
        )}
        <button className="frame-reset" onClick={onReset} type="button">
          Reset demo
        </button>
      </div>
    </div>
  )
}
