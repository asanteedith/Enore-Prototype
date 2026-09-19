import type { PatientId, WorkItem } from './types'

const STOPWORDS = new Set(['the', 'for', 'and', 'with', 'from'])

function keywordsFor(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}

export function detectCompletion(
  text: string,
  patientId: PatientId | undefined,
  items: WorkItem[],
): WorkItem | null {
  const lower = text.toLowerCase()
  const candidates = items.filter(
    (w) => w.state !== 'DONE' && (patientId ? w.patientId === patientId : true),
  )
  for (const item of candidates) {
    const keywords = keywordsFor(item.title)
    if (keywords.some((k) => lower.includes(k))) {
      return item
    }
  }
  return null
}
