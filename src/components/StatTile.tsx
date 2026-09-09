type Tone = 'neutral' | 'escalated' | 'waiting'

interface Props {
  label: string
  value: number
  tone?: Tone
  onClick?: () => void
}

export function StatTile({ label, value, tone = 'neutral', onClick }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`stat-tile stat-tile-${tone}`} onClick={onClick}>
      <div className="stat-tile-value">{value}</div>
      <div className="stat-tile-label">{label}</div>
    </Tag>
  )
}
