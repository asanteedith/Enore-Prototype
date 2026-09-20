interface Props {
  allergies: string[]
  variant?: 'badge' | 'panel'
}

export function SafetyBanner({ allergies, variant = 'badge' }: Props) {
  if (allergies.length === 0) return null

  if (variant === 'panel') {
    return (
      <div className="safety-panel">
        <div className="safety-panel-title">⚠ Safety information</div>
        <div className="safety-panel-body">Documented allergy: {allergies.join(', ')}</div>
        <div className="safety-panel-note">Review before proceeding.</div>
      </div>
    )
  }

  return <div className="safety-badge">⚠ {allergies.join(', ')} allergy</div>
}
