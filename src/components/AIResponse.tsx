import type { ReactNode } from 'react'

interface Props {
  label?: string
  children: ReactNode
}

export function AIResponse({ label = 'Enore', children }: Props) {
  return (
    <div className="ai-response">
      <div className="ai-response-label">{label}</div>
      <div className="ai-response-body">{children}</div>
    </div>
  )
}
