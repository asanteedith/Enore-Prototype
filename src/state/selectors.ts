import type { CareContext, DemoData, WorkItem } from './types'

export function getBed(data: DemoData, bedId: string) {
  const bed = data.beds.find((b) => b.id === bedId)
  if (!bed) throw new Error(`Unknown bed: ${bedId}`)
  return bed
}

export function getWork(data: DemoData, workId: string) {
  const work = data.work.find((w) => w.id === workId)
  if (!work) throw new Error(`Unknown work item: ${workId}`)
  return work
}

export function primaryWorkForBed(data: DemoData, bedId: string) {
  return data.work.find((w) => w.bedId === bedId) ?? null
}

export function outstandingWork(data: DemoData) {
  return data.work.filter((w) => w.status !== 'COMPLETED')
}

export function teamActivityForBed(data: DemoData, bedId: string) {
  return data.teamActivity.find((t) => t.bedId === bedId)?.text ?? ''
}

export function needsAttention(data: DemoData) {
  return data.work.filter((w) => w.status === 'TO_DO' || w.status === 'IN_PROGRESS' || w.status === 'ESCALATED')
}

export function careContextDetail(work: WorkItem | null): string {
  if (!work) return 'No active work'
  switch (work.status) {
    case 'TO_DO':
      return `${work.title} due`
    case 'IN_PROGRESS':
      return `${work.title} in progress`
    case 'COMPLETED':
      return `${work.title} completed`
    case 'DEFERRED':
      return `${work.title} deferred`
    case 'ESCALATED':
      return `${work.title} escalated`
  }
}

export function isJustUpdated(data: DemoData, workId: string): boolean {
  return data.recentUpdate?.workId === workId
}

// ---------- Team Workspace: generalized care-context resolution ----------
// Bed-linked items keep using bedId/getBed above (Personal Workspace is unchanged).
// Team Workspace items may instead carry contextId, pointing into careContexts,
// which is a superset that mirrors every bed plus non-bed contexts (theatre, etc).

export function careContextIdOf(item: WorkItem): string | null {
  return item.bedId ?? item.contextId ?? null
}

export function getCareContext(data: DemoData, contextId: string): CareContext {
  const ctx = data.careContexts.find((c) => c.id === contextId)
  if (!ctx) throw new Error(`Unknown care context: ${contextId}`)
  return ctx
}

/** Safe label lookup for any work item, bed-linked or not. Never throws. */
export function contextLabelFor(data: DemoData, item: WorkItem): string {
  const id = careContextIdOf(item)
  if (!id) return data.ward
  const ctx = data.careContexts.find((c) => c.id === id)
  return ctx?.label ?? data.ward
}

export function workForContext(data: DemoData, contextId: string): WorkItem[] {
  return data.work.filter((w) => careContextIdOf(w) === contextId)
}

export function teamActivityForContext(data: DemoData, contextId: string): string {
  return data.teamActivity.find((t) => t.bedId === contextId)?.text ?? 'No recent activity.'
}

// ---------- Team Workspace: shift-level operational picture ----------

export interface TeamStats {
  needsAttention: number
  inProgress: number
  waiting: number
  escalated: number
  unassigned: number
}

export function teamStats(data: DemoData): TeamStats {
  const active = data.work.filter((w) => w.status !== 'COMPLETED')
  return {
    needsAttention: active.filter((w) => w.status === 'TO_DO' || w.status === 'ESCALATED').length,
    inProgress: active.filter((w) => w.status === 'IN_PROGRESS' && !w.waitingOn).length,
    waiting: active.filter((w) => !!w.waitingOn).length,
    escalated: active.filter((w) => w.status === 'ESCALATED').length,
    unassigned: active.filter((w) => !w.assignedTo).length,
  }
}

function priorityRank(item: WorkItem): number {
  if (item.status === 'ESCALATED') return 0
  if (item.waitingOn) return 1
  if (item.followUpNeeded) return 2
  if (!item.assignedTo) return 3
  return 4
}

export function teamPriorityItems(data: DemoData, limit: number): WorkItem[] {
  return data.work
    .filter((w) => w.status !== 'COMPLETED')
    .slice()
    .sort((a, b) => priorityRank(a) - priorityRank(b))
    .slice(0, limit)
}

export function teamWorkForPersona(data: DemoData, personaName: string): WorkItem[] {
  return data.work.filter((w) => w.assignedTo === personaName)
}
