export const SHIFT_NOW = '07:32'

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function elapsedSince(hhmm: string, now: string = SHIFT_NOW): string {
  const diff = toMinutes(now) - toMinutes(hhmm)
  if (diff <= 0) return 'just now'
  const h = Math.floor(diff / 60)
  const m = diff % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function minutesUntil(hhmm: string, now: string = SHIFT_NOW): number {
  return toMinutes(hhmm) - toMinutes(now)
}
