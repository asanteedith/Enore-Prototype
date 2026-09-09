interface ChangeLine {
  id: string
  text: string
  justUpdated?: boolean
}

interface Props {
  changesCount: number
  outstandingCount: number
  changes: ChangeLine[]
  outstanding: { bedLabel: string; title: string }[]
  compact?: boolean
}

export function HandoverSummary({ changesCount, outstandingCount, changes, outstanding, compact }: Props) {
  return (
    <div className={`handover-summary ${compact ? 'handover-summary-compact' : ''}`}>
      <div className="handover-summary-stats">
        <div className="handover-stat">
          <div className="handover-stat-value">{changesCount}</div>
          <div className="handover-stat-label">important changes</div>
        </div>
        <div className="handover-stat">
          <div className="handover-stat-value">{outstandingCount}</div>
          <div className="handover-stat-label">outstanding items</div>
        </div>
      </div>

      <div className="handover-block">
        <div className="handover-block-title">Changes</div>
        {changes.map((c) => (
          <div key={c.id} className="handover-line handover-line-row">
            <span>{c.text}</span>
            {c.justUpdated && <span className="just-updated-tag">Just now</span>}
          </div>
        ))}
      </div>

      <div className="handover-block">
        <div className="handover-block-title">Outstanding</div>
        {outstanding.map((item) => (
          <div key={item.bedLabel + item.title} className="handover-line">
            {item.bedLabel} · {item.title}
          </div>
        ))}
        {outstanding.length === 0 && <div className="handover-line handover-line-muted">Nothing outstanding.</div>}
      </div>
    </div>
  )
}
