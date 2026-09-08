import type { DemoData } from './types'

export function createInitialData(): DemoData {
  return {
    nurseName: 'Edith',
    ward: 'Medical Ward',
    shiftLabel: 'Morning shift',
    beds: [
      { id: 'bed08', label: 'Bed 08', status: 'Stable', nextReview: '12:00 PM' },
      { id: 'bed11', label: 'Bed 11', status: 'Stable', nextReview: '11:20 AM' },
      { id: 'bed14', label: 'Bed 14', status: 'Stable', nextReview: '1:00 PM' },
    ],
    work: [
      {
        id: 'w1',
        bedId: 'bed08',
        title: 'Wound dressing',
        status: 'TO_DO',
        dueLabel: 'Due now',
        assignedTo: null,
        startedAt: null,
        completedAt: null,
      },
      {
        id: 'w2',
        bedId: 'bed11',
        title: 'Fluid balance review',
        status: 'IN_PROGRESS',
        dueLabel: 'Due in 20 min',
        assignedTo: 'Edith',
        startedAt: '10:05 AM',
        completedAt: null,
      },
      {
        id: 'w3',
        bedId: 'bed14',
        title: 'Medication follow-up',
        status: 'TO_DO',
        dueLabel: 'Due in 45 min',
        assignedTo: 'Kwame',
        startedAt: null,
        completedAt: null,
      },
    ],
    changes: [
      { id: 'c1', text: 'Fluid balance review started for Bed 11', timeLabel: '8:40 AM' },
      { id: 'c2', text: 'Medication follow-up flagged for Bed 14', timeLabel: '9:15 AM' },
    ],
    teamActivity: [
      { bedId: 'bed08', text: 'No one has started this yet.' },
      { bedId: 'bed11', text: 'Ama is reviewing intake and output charts.' },
      { bedId: 'bed14', text: 'Team notified. Awaiting response from pharmacy.' },
    ],
  }
}
