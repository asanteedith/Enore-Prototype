export const SHIFT_START = '07:00'
export const INITIAL_NOW = '07:32'
const DUE_SOON_MINUTES = 30

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function advanceTime(now: string, minutes: number): string {
  return toHHMM(toMinutes(now) + minutes)
}

export function elapsedSince(hhmm: string, now: string): string {
  const diff = toMinutes(now) - toMinutes(hhmm)
  if (diff <= 0) return 'just now'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function minutesBetween(from: string, to: string): number {
  return toMinutes(to) - toMinutes(from)
}

export type DueStatus = 'NONE' | 'DUE' | 'OVERDUE'

/** Only ever DUE/OVERDUE when a real dueAt exists — never manufactured from a wait time. */
export function dueStatus(dueAt: string | undefined, now: string): DueStatus {
  if (!dueAt) return 'NONE'
  const remaining = minutesBetween(now, dueAt)
  if (remaining < 0) return 'OVERDUE'
  if (remaining <= DUE_SOON_MINUTES) return 'DUE'
  return 'NONE'
}

/** True only once a configured escalation rule's threshold has actually elapsed. */
export function isEscalationDue(since: string | undefined, now: string, afterMinutes: number | undefined): boolean {
  if (!since || !afterMinutes) return false
  return minutesBetween(since, now) >= afterMinutes
}
