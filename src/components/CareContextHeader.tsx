interface Props {
  bedLabel: string
  status: string
  detail: string
  justUpdated?: boolean
}

export function CareContextHeader({ bedLabel, status, detail, justUpdated }: Props) {
  return (
    <div className="context-header">
      <div className="context-header-eyebrow">{bedLabel}</div>
      <h1 className="context-header-title">Current care context</h1>
      <div className="context-status-block">
        <div className="context-status-label">Current status</div>
        <div className="context-status-value">{status}</div>
        <div className="context-status-detail">{detail}</div>
        {justUpdated && <span className="just-updated-tag context-just-updated">Updated just now</span>}
      </div>
    </div>
  )
}
