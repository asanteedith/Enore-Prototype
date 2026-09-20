import type { EventEntry, Patient, PatientId, WorkItem } from './types'

export const PATIENTS: Record<PatientId, Patient> = {
  'P-001': {
    id: 'P-001',
    bed: 'Bed 4',
    age: 41,
    admissionNote: 'Day 2 after open appendicectomy',
    allergies: [],
    currentState: [
      'Comfortable overnight',
      'Last pain score 3/10',
      'Wound dry',
      'Eating and drinking',
      'Cannula — left hand',
    ],
  },
  'P-002': {
    id: 'P-002',
    bed: 'Bed 9',
    age: 63,
    admissionNote: 'Day 1 after bowel resection',
    allergies: [],
    currentState: [
      'Restless',
      'Pain 7/10 at 05:00',
      'Morphine given 05:15',
      'Temperature 37.9°C at 06:00',
      'NPO',
      'Catheter draining',
    ],
  },
  'P-003': {
    id: 'P-003',
    bed: 'Bed 12',
    age: 28,
    admissionNote: 'Admitted overnight with abdominal pain',
    allergies: ['Penicillin'],
    currentState: [
      'NPO since midnight',
      'Anxious',
      'Asking when she will be seen',
      'Possible theatre later if surgeon agrees',
    ],
  },
}

export const INITIAL_WORK_ITEMS: WorkItem[] = [
  // --- P-001 : Me, not yet started ---
  {
    id: 'p001-observations',
    patientId: 'P-001',
    title: 'Morning observations',
    category: 'Observations',
    state: 'OPEN',
    owner: 'Me',
    dueAt: '12:00',
    note: '6-hourly · last taken 06:00',
    completeLabel: 'Record observations done',
  },
  {
    id: 'p001-mobilisation',
    patientId: 'P-001',
    title: 'Mobilisation',
    category: 'Physiotherapy',
    state: 'OPEN',
    owner: 'Me',
    dueNote: 'Today',
    note: 'Physiotherapy asked her to walk this morning',
    completeLabel: 'Record mobilised',
  },

  // --- P-002 : waiting on doctor, no real due time — must never read OVERDUE ---
  {
    id: 'p002-wound-review',
    patientId: 'P-002',
    title: 'Pain / wound review',
    category: 'Clinical review',
    state: 'WAITING',
    owner: 'Doctor',
    waitingFor: 'Doctor',
    since: '05:30',
    note: 'Requested by night nurse',
    escalationRule: { afterMinutes: 60, label: 'Consider escalating to charge nurse' },
  },
  // --- P-002 : the nurse's own task — this is the interruption/resume demo item ---
  {
    id: 'p002-wound-assessment',
    patientId: 'P-002',
    title: 'Wound assessment',
    category: 'Assessment',
    state: 'OPEN',
    owner: 'Me',
    supportsInProgress: true,
    startLabel: 'Start assessment',
    completeLabel: 'Complete assessment',
    nextAction: 'Inspect wound',
  },
  {
    id: 'p002-iv-fluids',
    patientId: 'P-002',
    title: 'IV fluids review',
    category: 'Fluids',
    state: 'WATCHING',
    owner: 'Me',
    since: '07:00',
    note: 'Running 1L / 8h',
  },

  // --- P-003 : result lifecycle + dependency chain ---
  {
    id: 'p003-blood-result',
    patientId: 'P-003',
    title: 'Blood result',
    category: 'Investigation',
    state: 'WAITING',
    owner: 'Lab',
    waitingFor: 'Lab',
    since: '04:00',
    note: 'Taken 04:00',
    resultStage: 'WAITING',
  },
  {
    id: 'p003-theatre-decision',
    patientId: 'P-003',
    title: 'Theatre decision',
    category: 'Plan',
    state: 'OPEN',
    owner: 'Surgeon',
    dependsOn: 'p003-blood-result',
    note: 'Pending surgeon review',
  },
  {
    id: 'p003-consent',
    patientId: 'P-003',
    title: 'Consent',
    category: 'Admin',
    state: 'OPEN',
    owner: 'Me',
    note: 'Not yet signed',
    completeLabel: 'Record signed',
  },
]

export const SYNTHETIC_BLOOD_RESULT_NOTE = 'FBC: WBC 11.2, Hb 13.1, Platelets 240 — no critical flags.'

export const INITIAL_EVENTS: EventEntry[] = [
  { id: 'e1', patientId: 'P-002', time: '07:00', label: 'Morning shift started' },
  { id: 'e2', patientId: 'P-001', time: '06:00', label: 'Observations recorded' },
  { id: 'e3', patientId: 'P-002', time: '06:00', label: 'Temperature 37.9°C' },
  { id: 'e4', patientId: 'P-002', time: '05:15', label: 'Morphine administered' },
  { id: 'e5', patientId: 'P-002', time: '05:00', label: 'Pain 7/10' },
  { id: 'e6', patientId: 'P-003', time: '04:00', label: 'Bloods taken' },
]
