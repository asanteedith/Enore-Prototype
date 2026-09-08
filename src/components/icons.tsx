import type { SVGProps } from 'react'

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  )
}

export function NowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5v4.8l3.2 1.9" />
    </Base>
  )
}

export function BedsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
      <path d="M3 15h18" />
      <path d="M6 11V7.5A1.5 1.5 0 0 1 7.5 6H10a1.5 1.5 0 0 1 1.5 1.5V11" />
      <path d="M3 18v2M21 18v2" />
    </Base>
  )
}

export function WorkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="4" y="4.5" width="16" height="15" rx="2.2" />
      <path d="M8 9.5h8M8 13h8M8 16.5h5" />
    </Base>
  )
}

export function TeamIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="9" cy="9" r="2.6" />
      <path d="M4 19c0-2.9 2.2-5 5-5s5 2.1 5 5" />
      <circle cx="17" cy="8.5" r="2" />
      <path d="M15.5 14.2c1.8.3 3.5 1.9 3.5 4.3" />
    </Base>
  )
}

export function BackIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M15 5l-7 7 7 7" />
    </Base>
  )
}

export function AgentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="4.5" y="6" width="15" height="12" rx="3" />
      <path d="M9 12h.01M15 12h.01" />
      <path d="M12 3v3" />
    </Base>
  )
}

export function KnowledgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M12 5.5C10.5 4 8.3 3.6 6 4.2v13.3c2.3-.6 4.5-.2 6 1.3 1.5-1.5 3.7-1.9 6-1.3V4.2c-2.3-.6-4.5-.2-6 1.3z" />
      <path d="M12 5.5v13.3" />
    </Base>
  )
}
