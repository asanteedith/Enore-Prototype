import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { DemoData, DetectedIntent, Persona, ScreenState, TabName, TeamTabName, WorkStatus } from './types'
import { createInitialData } from './initialData'
import { detectIntent } from './detectIntent'

export const PERSONA_INFO: Record<Persona, { name: string; role: string }> = {
  edith: { name: 'Edith', role: 'Staff Nurse' },
  ama: { name: 'Ama', role: 'Nurse In-Charge' },
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
  | { type: 'START_WORK'; bedId: string; workId: string }
  | { type: 'SUBMIT_CAPTURE'; bedId: string; workId: string; input: string; intent: DetectedIntent }
  | { type: 'CONFIRM_CAPTURE'; bedId: string; workId: string; intent: DetectedIntent; input: string }
  | { type: 'TAKE_RESPONSIBILITY'; workId: string; byWhom: string }
  | { type: 'CHASE_WORK'; workId: string }
  | { type: 'RESOLVE_WORK'; workId: string }
  | { type: 'ADD_MEETING_ACTION' }

const CONFIRM_TIME_LABEL = '10:42 AM'

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

function changeTextForIntent(intent: DetectedIntent, bedLabel: string, workTitle: string): string {
  switch (intent) {
    case 'COMPLETED':
      return `${bedLabel} ${workTitle.toLowerCase()} completed`
    case 'DEFERRED':
      return `${bedLabel} ${workTitle.toLowerCase()} deferred`
    case 'ESCALATED':
      return `${bedLabel} ${workTitle.toLowerCase()} escalated to team`
    case 'IN_PROGRESS':
      return `${bedLabel} ${workTitle.toLowerCase()} updated`
  }
}

function nextChangeId(state: State): string {
  return `c-${state.data.changes.length + 1}`
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
      const work = state.data.work.map((item) =>
        item.id === action.workId
          ? { ...item, status: 'IN_PROGRESS' as WorkStatus, assignedTo: state.data.nurseName, startedAt: 'Started just now' }
          : item,
      )
      const teamActivity = state.data.teamActivity.map((entry) =>
        entry.bedId === action.bedId ? { ...entry, text: `${state.data.nurseName} started this just now.` } : entry,
      )
      return { ...state, data: { ...state.data, work, teamActivity } }
    }

    case 'SUBMIT_CAPTURE':
      return {
        ...state,
        stack: [...state.stack, { name: 'detected', bedId: action.bedId, workId: action.workId, input: action.input, intent: action.intent }],
      }

    case 'CONFIRM_CAPTURE': {
      const workItem = state.data.work.find((item) => item.id === action.workId)
      const bed = state.data.beds.find((item) => item.id === action.bedId)
      if (!workItem || !bed) return state

      const nextStatus = statusForIntent(action.intent, workItem.status)
      const work = state.data.work.map((item) =>
        item.id === action.workId
          ? {
              ...item,
              status: nextStatus,
              completedAt: nextStatus === 'COMPLETED' ? CONFIRM_TIME_LABEL : item.completedAt,
            }
          : item,
      )

      const teamActivity = state.data.teamActivity.map((entry) =>
        entry.bedId === action.bedId ? { ...entry, text: `Update confirmed by ${state.data.nurseName}` } : entry,
      )

      const changeText = changeTextForIntent(action.intent, bed.label, workItem.title)
      const changes = [...state.data.changes, { id: nextChangeId(state), text: changeText, timeLabel: CONFIRM_TIME_LABEL }]

      const recentUpdate = { workId: action.workId, bedId: action.bedId, timeLabel: CONFIRM_TIME_LABEL }

      return {
        data: { ...state.data, work, teamActivity, changes, recentUpdate },
        stack: [...state.stack, { name: 'confirmed', bedId: action.bedId, workId: action.workId }],
        persona: state.persona,
      }
    }

    case 'TAKE_RESPONSIBILITY': {
      const item = state.data.work.find((w) => w.id === action.workId)
      if (!item) return state
      const work = state.data.work.map((w) =>
        w.id === action.workId
          ? { ...w, assignedTo: action.byWhom, status: w.status === 'TO_DO' ? ('IN_PROGRESS' as WorkStatus) : w.status, startedAt: w.startedAt ?? 'Started just now' }
          : w,
      )
      const changes = [
        ...state.data.changes,
        { id: nextChangeId(state), text: `${action.byWhom} took responsibility for ${item.title.toLowerCase()}`, timeLabel: CONFIRM_TIME_LABEL },
      ]
      return { ...state, data: { ...state.data, work, changes } }
    }

    case 'CHASE_WORK': {
      const item = state.data.work.find((w) => w.id === action.workId)
      if (!item || !item.waitingOn) return state
      const work = state.data.work.map((w) => (w.id === action.workId ? { ...w, chased: true, waitingSinceLabel: 'Chased just now' } : w))
      const changes = [
        ...state.data.changes,
        { id: nextChangeId(state), text: `Chased: ${item.waitingOn.toLowerCase()} (${item.title.toLowerCase()})`, timeLabel: CONFIRM_TIME_LABEL },
      ]
      return { ...state, data: { ...state.data, work, changes } }
    }

    case 'RESOLVE_WORK': {
      const item = state.data.work.find((w) => w.id === action.workId)
      if (!item) return state
      const work = state.data.work.map((w) =>
        w.id === action.workId ? { ...w, status: 'COMPLETED' as WorkStatus, completedAt: CONFIRM_TIME_LABEL, waitingOn: undefined } : w,
      )
      const changes = [
        ...state.data.changes,
        { id: nextChangeId(state), text: `${item.title} completed`, timeLabel: CONFIRM_TIME_LABEL },
      ]
      const recentUpdate = { workId: action.workId, bedId: item.bedId ?? item.contextId ?? '', timeLabel: CONFIRM_TIME_LABEL }
      return { ...state, data: { ...state.data, work, changes, recentUpdate } }
    }

    case 'ADD_MEETING_ACTION': {
      if (state.data.meeting.actionAdded) return state
      const newItem = {
        id: 'w10',
        bedId: null,
        title: state.data.meeting.actionTitle,
        status: 'TO_DO' as WorkStatus,
        dueLabel: 'This week',
        assignedTo: null,
        startedAt: null,
        completedAt: null,
      }
      const work = [...state.data.work, newItem]
      const changes = [
        ...state.data.changes,
        { id: nextChangeId(state), text: `Meeting action added to Team Work: ${newItem.title.toLowerCase()}`, timeLabel: CONFIRM_TIME_LABEL },
      ]
      return { ...state, data: { ...state.data, work, changes, meeting: { ...state.data.meeting, actionAdded: true } } }
    }

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
  chaseWork: (workId: string) => void
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

  const value: DemoContextValue = {
    data: state.data,
    screen: state.stack[state.stack.length - 1],
    persona: state.persona,
    personaName: PERSONA_INFO[state.persona].name,
    personaRole: PERSONA_INFO[state.persona].role,
    canGoBack: state.stack.length > 1,
    reset: () => dispatch({ type: 'RESET' }),
    push: (screen) => dispatch({ type: 'PUSH', screen }),
    goBack: () => dispatch({ type: 'POP' }),
    goTab: (tab) => dispatch({ type: 'GO_TAB', tab }),
    goTeamTab: (tab) => dispatch({ type: 'GO_TEAM_TAB', tab }),
    selectPersona: (persona) => dispatch({ type: 'SELECT_PERSONA', persona }),
    startWork: (bedId, workId) => dispatch({ type: 'START_WORK', bedId, workId }),
    submitCapture: (bedId, workId, input) => {
      const intent = detectIntent(input)
      dispatch({ type: 'SUBMIT_CAPTURE', bedId, workId, input, intent })
    },
    confirmCapture: (bedId, workId, intent, input) => dispatch({ type: 'CONFIRM_CAPTURE', bedId, workId, intent, input }),
    openQuickCapture: () => {
      const inProgress =
        state.data.work.find((w) => w.status === 'IN_PROGRESS' && w.assignedTo === state.data.nurseName && w.bedId) ??
        state.data.work.find((w) => w.status === 'IN_PROGRESS' && w.bedId)

      if (inProgress && inProgress.bedId) {
        dispatch({ type: 'PUSH', screen: { name: 'capture', bedId: inProgress.bedId, workId: inProgress.id } })
        return
      }

      const next = state.data.work.find((w) => w.status !== 'COMPLETED' && w.bedId)
      if (next && next.bedId) {
        dispatch({ type: 'PUSH', screen: { name: 'careContext', bedId: next.bedId } })
      }
    },
    takeResponsibility: (workId) => dispatch({ type: 'TAKE_RESPONSIBILITY', workId, byWhom: PERSONA_INFO[state.persona].name }),
    chaseWork: (workId) => dispatch({ type: 'CHASE_WORK', workId }),
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
