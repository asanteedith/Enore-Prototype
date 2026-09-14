import type { ReactNode } from 'react'
import type { WorkStatus } from '../state/types'
import { StatusBadge } from './StatusBadge'

interface Props {
  bedLabel: string
  title: string
  status: WorkStatus
  meta?: string
  justUpdated?: boolean
  onClick?: () => void
  trailing?: ReactNode
}

export function WorkItemRow({ bedLabel, title, status, meta, justUpdated, onClick, trailing }: Props) {
  const Tag = onClick ? 'button' : 'div'
  return (
    <Tag className="work-row" onClick={onClick}>
      <div className="work-row-main">
        <span className="work-row-bed">{bedLabel}</span>
        <span className="work-row-title">{title}</span>
        {meta && <span className="work-row-meta">{meta}</span>}
      </div>
      <div className="work-row-trailing">
        {trailing ?? <StatusBadge status={status} />}
        {justUpdated && <span className="just-updated-tag">Updated just now</span>}
      </div>
    </Tag>
  )
}
