interface Props {
  bedLabel: string
  status: string
  detail: string
}

export function CareContextHeader({ bedLabel, status, detail }: Props) {
  return (
    <div className="context-header">
      <div className="context-header-eyebrow">{bedLabel}</div>
      <h1 className="context-header-title">Current care context</h1>
      <div className="context-status-block">
        <div className="context-status-label">Current status</div>
        <div className="context-status-value">{status}</div>
        <div className="context-status-detail">{detail}</div>
      </div>
    </div>
  )
}
