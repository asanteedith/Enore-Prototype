import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { DemoData, DetectedIntent, Persona, ScreenState, TabName, TeamTabName, WorkStatus } from './types'
import { createInitialData } from './initialData'
import { detectIntent } from './detectIntent'
import { activeDependencyForWork, getWork, responseDependencyForWork, waitingDependencyForWork } from './selectors'

export const PERSONA_INFO: Record<Persona, { name: string; role: string; ownerId: string }> = {
  edith: { name: 'Edith', role: 'Staff Nurse', ownerId: 'edith' },
  ama: { name: 'Ama', role: 'Nurse In-Charge', ownerId: 'ama' },
}

interface State {
  data: DemoData
  stack: ScreenState[]
  persona: Persona
}

type Action =
  | { type: 'RESET' }
  | { type: 'PUSH'; screen: ScreenState }
  | { type: 'POP' }
  | { type: 'GO_TAB'; tab: TabName }
  | { type: 'GO_TEAM_TAB'; tab: TeamTabName }
  | { type: 'SELECT_PERSONA'; persona: Persona }
  | { type: 'START_WORK'; workId: string; ownerId: string; ownerName: string }
  | { type: 'SUBMIT_CAPTURE'; bedId: string; workId: string; input: string; intent: DetectedIntent }
  | { type: 'CONFIRM_CAPTURE'; bedId: string; workId: string; intent: DetectedIntent; input: string }
  | { type: 'TAKE_RESPONSIBILITY'; workId: string; ownerId: string; ownerName: string }
  | { type: 'CONNECT_TO_TEAM'; workId: string; ownerId: string; ownerName: string }
  | { type: 'CHASE_WORK'; workId: string }
  | { type: 'RECORD_RESPONSE'; workId: string }
  | { type: 'RESUME_WORK'; workId: string; ownerName: string }
  | { type: 'RESOLVE_WORK'; workId: string }
  | { type: 'ADD_MEETING_ACTION' }

const CONFIRM_TIME_LABEL = '10:58 AM'

function statusForIntent(intent: DetectedIntent, fallback: WorkStatus): WorkStatus {
  switch (intent) {
    case 'COMPLETED':
      return 'COMPLETED'
    case 'DEFERRED':
      return 'DEFERRED'
    case 'ESCALATED':
      return 'ESCALATED'
    case 'IN_PROGRESS':
      return fallback
  }
}

function nextChangeId(state: State): string {
  return `c-${state.data.changes.length + 1}`
}

function appendChange(state: State, workId: string, text: string, type: DemoData['changes'][number]['type']): DemoData['changes'] {
  return [
    ...state.data.changes,
    { id: nextChangeId(state), workId, type, text, timeLabel: CONFIRM_TIME_LABEL, syncState: 'SYNCED' },
  ]
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return { data: createInitialData(), stack: [{ name: 'start' }], persona: 'edith' }

    case 'PUSH':
      return { ...state, stack: [...state.stack, action.screen] }

    case 'POP':
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1) } : state

    case 'GO_TAB':
      return { ...state, stack: [{ name: action.tab }] }

    case 'GO_TEAM_TAB':
      return { ...state, stack: [{ name: action.tab }] }

    case 'SELECT_PERSONA':
      return {
        ...state,
        persona: action.persona,
        stack: [{ name: action.persona === 'ama' ? 'teamHome' : 'now' }],
      }

    case 'START_WORK': {
      const item = getWork(state.data, action.workId)
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? {
              ...w,
              status: 'IN_PROGRESS' as WorkStatus,
              ownerId: action.ownerId,
              assignedTo: action.ownerName,
              startedAt: w.startedAt ?? 'Started just now',
              syncState: 'SYNCED' as const,
            }
          : w,
      )
      const changes = appendChange(state, action.workId, `${action.ownerName} started ${item.title.toLowerCase()}`, 'started')
      return { ...state, data: { ...state.data, work, changes, recentUpdate: { workId: action.workId, bedId: item.bedId ?? item.contextId ?? '', timeLabel: CONFIRM_TIME_LABEL } } }
    }

    case 'SUBMIT_CAPTURE':
      return {
        ...state,
        stack: [...state.stack, { name: 'detected', bedId: action.bedId, workId: action.workId, input: action.input, intent: action.intent }],
      }

    case 'CONFIRM_CAPTURE': {
      const item = getWork(state.data, action.workId)
      const nextStatus = statusForIntent(action.intent, item.status)
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? {
              ...w,
              status: nextStatus,
              completedAt: nextStatus === 'COMPLETED' ? CONFIRM_TIME_LABEL : w.completedAt,
              syncState: 'SYNCED' as const,
            }
          : w,
      )
      const changes = appendChange(state, action.workId, `${item.title} updated from capture`, nextStatus === 'COMPLETED' ? 'completed' : 'continued')
      return {
        data: { ...state.data, work, changes, recentUpdate: { workId: action.workId, bedId: item.bedId ?? item.contextId ?? '', timeLabel: CONFIRM_TIME_LABEL } },
        stack: [...state.stack, { name: 'confirmed', bedId: action.bedId, workId: action.workId }],
        persona: state.persona,
      }
    }

    case 'TAKE_RESPONSIBILITY': {
      const item = getWork(state.data, action.workId)
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? {
              ...w,
              ownerId: action.ownerId,
              assignedTo: action.ownerName,
              status: w.status === 'TO_DO' ? ('IN_PROGRESS' as WorkStatus) : w.status,
              startedAt: w.startedAt ?? 'Started just now',
            }
          : w,
      )
      const changes = appendChange(state, action.workId, `${action.ownerName} took responsibility for ${item.title.toLowerCase()}`, 'assigned')
      return { ...state, data: { ...state.data, work, changes } }
    }

    case 'CONNECT_TO_TEAM': {
      const item = getWork(state.data, action.workId)
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? {
              ...w,
              scope: 'team' as const,
              owningTeamId: 'team-medical',
              ownerId: action.ownerId,
              assignedTo: action.ownerName,
              contextId: 'bed14',
              bedId: 'bed14',
              syncState: 'SYNCING' as const,
              handoverNote: 'Connected from Edith personal work; still needs team follow-up before handover.',
            }
          : w,
      )
      const changes = appendChange(state, action.workId, `${item.title} connected to Medical Ward shared work`, 'connected')
      return { ...state, data: { ...state.data, work, changes, recentUpdate: { workId: action.workId, bedId: 'bed14', timeLabel: CONFIRM_TIME_LABEL } } }
    }

    case 'CHASE_WORK': {
      const dep = waitingDependencyForWork(state.data, action.workId)
      if (!dep) return state
      const dependencies = state.data.dependencies.map((d) =>
        d.id === dep.id ? { ...d, status: 'CHASED' as const, chasedAtLabel: CONFIRM_TIME_LABEL } : d,
      )
      const work = state.data.work.map((w) =>
        w.id === action.workId ? { ...w, chased: true, waitingSinceLabel: 'Chased just now' } : w,
      )
      const changes = appendChange(state, action.workId, `Chased ${dep.waitingOn.toLowerCase()}`, 'dependencyChased')
      return { ...state, data: { ...state.data, dependencies, work, changes } }
    }

    case 'RECORD_RESPONSE': {
      const dep = activeDependencyForWork(state.data, action.workId)
      if (!dep || dep.status === 'RESPONDED') return state
      const dependencies = state.data.dependencies.map((d) =>
        d.id === dep.id
          ? {
              ...d,
              status: 'RESPONDED' as const,
              responseSummary: 'Pharmacy review complete. Nurse can continue the operational workflow.',
              respondedAtLabel: CONFIRM_TIME_LABEL,
              nextAction: 'Edith continues and completes the medication review work.',
            }
          : d,
      )
      const work = state.data.work.map((w) =>
        w.id === action.workId ? { ...w, waitingOn: undefined, waitingSinceLabel: undefined, dueLabel: 'Response received' } : w,
      )
      const changes = appendChange(state, action.workId, `${dep.waitingOn} response received`, 'dependencyResponded')
      return { ...state, data: { ...state.data, dependencies, work, changes, recentUpdate: { workId: action.workId, bedId: 'bed11', timeLabel: CONFIRM_TIME_LABEL } } }
    }

    case 'RESUME_WORK': {
      const response = responseDependencyForWork(state.data, action.workId)
      const dependencies = response
        ? state.data.dependencies.map((d) => (d.id === response.id ? { ...d, status: 'RESOLVED' as const } : d))
        : state.data.dependencies
      const work = state.data.work.map((w) =>
        w.id === action.workId ? { ...w, status: 'IN_PROGRESS' as WorkStatus, dueLabel: 'Ready to complete' } : w,
      )
      const changes = appendChange(state, action.workId, `${action.ownerName} continued after dependency response`, 'continued')
      return { ...state, data: { ...state.data, dependencies, work, changes } }
    }

    case 'RESOLVE_WORK': {
      const item = getWork(state.data, action.workId)
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? { ...w, status: 'COMPLETED' as WorkStatus, completedAt: CONFIRM_TIME_LABEL, waitingOn: undefined, syncState: 'SYNCED' as const }
          : w,
      )
      const dependencies = state.data.dependencies.map((d) =>
        d.workId === action.workId ? { ...d, status: 'RESOLVED' as const } : d,
      )
      const changes = appendChange(state, action.workId, `${item.title} completed`, 'completed')
      return { ...state, data: { ...state.data, work, dependencies, changes, recentUpdate: { workId: action.workId, bedId: item.bedId ?? item.contextId ?? '', timeLabel: CONFIRM_TIME_LABEL } } }
    }

    case 'ADD_MEETING_ACTION':
      return state

    default:
      return state
  }
}

interface DemoContextValue {
  data: DemoData
  screen: ScreenState
  persona: Persona
  personaName: string
  personaRole: string
  personaOwnerId: string
  canGoBack: boolean
  reset: () => void
  push: (screen: ScreenState) => void
  goBack: () => void
  goTab: (tab: TabName) => void
  goTeamTab: (tab: TeamTabName) => void
  selectPersona: (persona: Persona) => void
  startWork: (bedId: string, workId: string) => void
  submitCapture: (bedId: string, workId: string, input: string) => void
  confirmCapture: (bedId: string, workId: string, intent: DetectedIntent, input: string) => void
  openQuickCapture: () => void
  takeResponsibility: (workId: string) => void
  connectToTeam: (workId: string) => void
  chaseWork: (workId: string) => void
  recordResponse: (workId: string) => void
  resumeWork: (workId: string) => void
  resolveWork: (workId: string) => void
  addMeetingAction: () => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    data: createInitialData(),
    stack: [{ name: 'start' }],
    persona: 'edith',
  }))

  const personaInfo = PERSONA_INFO[state.persona]

  const value: DemoContextValue = {
    data: state.data,
    screen: state.stack[state.stack.length - 1],
    persona: state.persona,
    personaName: personaInfo.name,
    personaRole: personaInfo.role,
    personaOwnerId: personaInfo.ownerId,
    canGoBack: state.stack.length > 1,
    reset: () => dispatch({ type: 'RESET' }),
    push: (screen) => dispatch({ type: 'PUSH', screen }),
    goBack: () => dispatch({ type: 'POP' }),
    goTab: (tab) => dispatch({ type: 'GO_TAB', tab }),
    goTeamTab: (tab) => dispatch({ type: 'GO_TEAM_TAB', tab }),
    selectPersona: (persona) => dispatch({ type: 'SELECT_PERSONA', persona }),
    startWork: (_bedId, workId) => dispatch({ type: 'START_WORK', workId, ownerId: personaInfo.ownerId, ownerName: personaInfo.name }),
    submitCapture: (bedId, workId, input) => {
      const intent = detectIntent(input)
      dispatch({ type: 'SUBMIT_CAPTURE', bedId, workId, input, intent })
    },
    confirmCapture: (bedId, workId, intent, input) => dispatch({ type: 'CONFIRM_CAPTURE', bedId, workId, intent, input }),
    openQuickCapture: () => {
      const next = state.data.work.find((w) => w.status !== 'COMPLETED')
      if (next) {
        dispatch({ type: 'PUSH', screen: { name: 'capture', bedId: next.bedId ?? next.contextId ?? 'bed11', workId: next.id } })
      }
    },
    takeResponsibility: (workId) => dispatch({ type: 'TAKE_RESPONSIBILITY', workId, ownerId: personaInfo.ownerId, ownerName: personaInfo.name }),
    connectToTeam: (workId) => dispatch({ type: 'CONNECT_TO_TEAM', workId, ownerId: personaInfo.ownerId, ownerName: personaInfo.name }),
    chaseWork: (workId) => dispatch({ type: 'CHASE_WORK', workId }),
    recordResponse: (workId) => dispatch({ type: 'RECORD_RESPONSE', workId }),
    resumeWork: (workId) => dispatch({ type: 'RESUME_WORK', workId, ownerName: personaInfo.name }),
    resolveWork: (workId) => dispatch({ type: 'RESOLVE_WORK', workId }),
    addMeetingAction: () => dispatch({ type: 'ADD_MEETING_ACTION' }),
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
