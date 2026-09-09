import type { DemoData, WorkItem } from './types'

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
