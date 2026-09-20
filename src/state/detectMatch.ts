import type { PatientId, WorkItem } from './types'

const STOPWORDS = new Set(['the', 'for', 'and', 'with', 'from', 'this', 'that', 'have', 'need'])

function keywordsFor(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
}

/**
 * Finds the active work item a piece of captured text most plausibly describes.
 * Used to route capture into an existing item's state transition rather than
 * silently creating a duplicate — the nurse still confirms the transition.
 *
 * Scores each candidate by how many of its title keywords appear in the text,
 * rather than stopping at the first overlap — two items can share one word
 * (e.g. "Pain / wound review" and "Wound assessment" both contain "wound"),
 * and the one matching more of the described work wins.
 */
export function detectMatch(text: string, patientId: PatientId | undefined, items: WorkItem[]): WorkItem | null {
  const lower = text.toLowerCase()
  const candidates = items.filter(
    (w) => w.state !== 'COMPLETED' && (patientId ? w.patientId === patientId : true),
  )

  let best: WorkItem | null = null
  let bestScore = 0
  for (const item of candidates) {
    const keywords = keywordsFor(item.title)
    const score = keywords.filter((k) => lower.includes(k)).length
    if (score > bestScore) {
      best = item
      bestScore = score
    }
  }
  return best
}
