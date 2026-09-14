import type { CareContext, DemoData, Dependency, Owner, SyncState, WorkItem } from './types'

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

export function getOwner(data: DemoData, ownerId: string | null | undefined): Owner | null {
  if (!ownerId) return null
  return data.owners.find((o) => o.id === ownerId) ?? null
}

export function ownerLabel(data: DemoData, ownerId: string | null | undefined): string {
  return getOwner(data, ownerId)?.name ?? 'Unassigned'
}

export function teamLabel(data: DemoData, teamId: string | null | undefined): string {
  if (!teamId) return data.ward
  return data.teams.find((team) => team.id === teamId)?.name ?? data.ward
}

export function primaryWorkForBed(data: DemoData, bedId: string) {
  return data.work.find((w) => w.bedId === bedId && w.status !== 'COMPLETED') ?? null
}

export function outstandingWork(data: DemoData) {
  return data.work.filter((w) => w.status !== 'COMPLETED')
}

export function teamActivityForBed(data: DemoData, bedId: string) {
  return data.teamActivity.find((t) => t.bedId === bedId)?.text ?? ''
}

export function needsAttention(data: DemoData) {
  return attentionItems(data)
}

export function careContextDetail(work: WorkItem | null): string {
  if (!work) return 'No active work'
  if (work.status === 'COMPLETED') return `${work.title} completed`
  if (work.status === 'ESCALATED') return `${work.title} escalated`
  if (work.waitingOn) return `Waiting on ${work.waitingOn}`
  if (work.status === 'IN_PROGRESS') return `${work.title} in progress`
  return `${work.title} due`
}

export function isJustUpdated(data: DemoData, workId: string): boolean {
  return data.recentUpdate?.workId === workId
}

export function careContextIdOf(item: WorkItem): string | null {
  return item.bedId ?? item.contextId ?? null
}

export function getCareContext(data: DemoData, contextId: string): CareContext {
  const ctx = data.careContexts.find((c) => c.id === contextId)
  if (!ctx) throw new Error(`Unknown care context: ${contextId}`)
  return ctx
}

export function contextLabelFor(data: DemoData, item: WorkItem): string {
  const id = careContextIdOf(item)
  if (!id) return item.scope === 'personal' ? 'Personal' : data.ward
  const ctx = data.careContexts.find((c) => c.id === id)
  return ctx?.label ?? data.ward
}

export function workForContext(data: DemoData, contextId: string): WorkItem[] {
  return data.work.filter((w) => careContextIdOf(w) === contextId)
}

export function teamActivityForContext(data: DemoData, contextId: string): string {
  return data.teamActivity.find((t) => t.bedId === contextId)?.text ?? 'No recent activity.'
}

export function activeDependencyForWork(data: DemoData, workId: string): Dependency | null {
  return (
    data.dependencies.find(
      (dep) => dep.workId === workId && dep.status !== 'RESOLVED',
    ) ?? null
  )
}

export function waitingDependencyForWork(data: DemoData, workId: string): Dependency | null {
  return (
    data.dependencies.find(
      (dep) => dep.workId === workId && (dep.status === 'WAITING' || dep.status === 'CHASED' || dep.status === 'REQUESTED'),
    ) ?? null
  )
}

export function responseDependencyForWork(data: DemoData, workId: string): Dependency | null {
  return data.dependencies.find((dep) => dep.workId === workId && dep.status === 'RESPONDED') ?? null
}

export function isOverdue(data: DemoData, item: WorkItem): boolean {
  return item.status !== 'COMPLETED' && item.dueAtMinutes !== null && item.dueAtMinutes < data.nowMinutes
}

export function dependencyOverdue(data: DemoData, dep: Dependency): boolean {
  return dep.status !== 'RESPONDED' && dep.status !== 'RESOLVED' && dep.expectedAtMinutes < data.nowMinutes
}

export function attentionReason(data: DemoData, item: WorkItem): string {
  const response = responseDependencyForWork(data, item.id)
  if (response) return `Response received from ${teamLabel(data, response.requestedFromTeamId)}`
  const waiting = waitingDependencyForWork(data, item.id)
  if (waiting) {
    const overdue = dependencyOverdue(data, waiting) ? 'overdue' : `expected ${waiting.expectedAtLabel}`
    return `Waiting on ${teamLabel(data, waiting.requestedFromTeamId)} - ${overdue}`
  }
  if (item.status === 'ESCALATED') return item.escalationReason ?? 'Escalated'
  if (isOverdue(data, item)) return 'Overdue'
  if (!item.ownerId) return 'Unassigned'
  if (item.scope === 'personal') return item.syncState === 'LOCAL' ? 'Saved locally' : 'Personal work'
  if (item.followUpNeeded) return 'Follow-up needed'
  return item.dueLabel
}

export function nextActionFor(data: DemoData, item: WorkItem): string {
  const response = responseDependencyForWork(data, item.id)
  if (response?.nextAction) return response.nextAction
  const waiting = waitingDependencyForWork(data, item.id)
  if (waiting) return waiting.status === 'CHASED' ? 'Await response' : 'Chase'
  if (item.scope === 'personal') return 'Connect to team'
  if (item.status === 'TO_DO') return item.ownerId ? 'Start' : 'Take responsibility'
  if (item.status === 'IN_PROGRESS') return 'Complete'
  if (item.status === 'DEFERRED') return 'Review'
  if (item.status === 'ESCALATED') return 'Review escalation'
  return 'Done'
}

function attentionRank(data: DemoData, item: WorkItem): number {
  if (responseDependencyForWork(data, item.id)) return 0
  if (item.status === 'ESCALATED') return 1
  const waiting = waitingDependencyForWork(data, item.id)
  if (waiting && dependencyOverdue(data, waiting)) return 2
  if (isOverdue(data, item)) return 3
  if (waiting) return 4
  if (!item.ownerId) return 5
  if (item.priority === 'now') return 6
  if (item.priority === 'soon') return 7
  return 8
}

export function attentionItems(data: DemoData, limit?: number): WorkItem[] {
  const items = data.work
    .filter((w) => w.status !== 'COMPLETED' && w.scope === 'team')
    .slice()
    .sort((a, b) => attentionRank(data, a) - attentionRank(data, b))
  return typeof limit === 'number' ? items.slice(0, limit) : items
}

export function workForPersona(data: DemoData, personaName: string): WorkItem[] {
  return data.work.filter((w) => w.assignedTo === personaName || (personaName === 'Edith' && w.scope === 'personal'))
}

export function teamWorkItems(data: DemoData): WorkItem[] {
  return data.work.filter((w) => w.scope === 'team')
}

export function handoverItems(data: DemoData): WorkItem[] {
  return data.work.filter((w) => w.scope === 'team' && w.status !== 'COMPLETED')
}

export interface TeamStats {
  needsAttention: number
  inProgress: number
  waiting: number
  responseReceived: number
  handoverRisk: number
}

export function teamStats(data: DemoData): TeamStats {
  const active = teamWorkItems(data).filter((w) => w.status !== 'COMPLETED')
  return {
    needsAttention: attentionItems(data).filter((w) => attentionRank(data, w) <= 5).length,
    inProgress: active.filter((w) => w.status === 'IN_PROGRESS' && !waitingDependencyForWork(data, w.id)).length,
    waiting: data.dependencies.filter((dep) => dep.status === 'WAITING' || dep.status === 'CHASED').length,
    responseReceived: data.dependencies.filter((dep) => dep.status === 'RESPONDED').length,
    handoverRisk: handoverItems(data).length,
  }
}

export function teamPriorityItems(data: DemoData, limit: number): WorkItem[] {
  return attentionItems(data, limit)
}

export function teamWorkForPersona(data: DemoData, personaName: string): WorkItem[] {
  return workForPersona(data, personaName).filter((w) => w.scope === 'team')
}

export function syncLabel(syncState: SyncState): string {
  switch (syncState) {
    case 'LOCAL':
      return 'Saved locally'
    case 'SYNCING':
      return 'Syncing'
    case 'SYNCED':
      return 'Synced'
    case 'FAILED':
      return 'Sync failed'
  }
}
