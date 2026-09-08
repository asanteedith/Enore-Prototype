import type { ReactNode } from 'react'

type Kind = 'wardUpdate' | 'handover' | 'escalation'

const KIND_LABEL: Record<Kind, string> = {
  wardUpdate: 'Ward update',
  handover: 'Handover',
  escalation: 'Escalation',
}

interface Props {
  kind: Kind
  title: string
  meta?: ReactNode
  onClick?: () => void
}

export function TeamUpdate({ kind, title, meta, onClick }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className={`team-update team-update-${kind}`} onClick={onClick}>
      <div className="team-update-kind">{KIND_LABEL[kind]}</div>
      <div className="team-update-title">{title}</div>
      {meta && <div className="team-update-meta">{meta}</div>}
    </Tag>
  )
}
