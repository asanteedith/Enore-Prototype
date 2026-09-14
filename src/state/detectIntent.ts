import type { DetectedIntent } from './types'

const COMPLETE_WORDS = ['complet', 'done', 'finish', 'closed']
const DEFER_WORDS = ['defer', 'postpone', 'later', 'delay']
const ESCALATE_WORDS = ['escalat', 'urgent', 'concern', 'notify']

export function detectIntent(rawInput: string): DetectedIntent {
  const input = rawInput.toLowerCase()

  if (ESCALATE_WORDS.some((word) => input.includes(word))) return 'ESCALATED'
  if (DEFER_WORDS.some((word) => input.includes(word))) return 'DEFERRED'
  if (COMPLETE_WORDS.some((word) => input.includes(word))) return 'COMPLETED'
  return 'IN_PROGRESS'
}

export function intentLabel(intent: DetectedIntent): string {
  switch (intent) {
    case 'COMPLETED':
      return 'Work completed'
    case 'DEFERRED':
      return 'Work deferred'
    case 'ESCALATED':
      return 'Escalation raised'
    case 'IN_PROGRESS':
      return 'Progress noted'
  }
}
