import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { DemoData, DetectedIntent, ScreenState, TabName, WorkStatus } from './types'
import { createInitialData } from './initialData'
import { detectIntent } from './detectIntent'

interface State {
  data: DemoData
  stack: ScreenState[]
}

type Action =
  | { type: 'RESET' }
  | { type: 'PUSH'; screen: ScreenState }
  | { type: 'POP' }
  | { type: 'GO_TAB'; tab: TabName }
  | { type: 'START_WORK'; bedId: string; workId: string }
  | { type: 'SUBMIT_CAPTURE'; bedId: string; workId: string; input: string; intent: DetectedIntent }
  | { type: 'CONFIRM_CAPTURE'; bedId: string; workId: string; intent: DetectedIntent; input: string }

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

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'RESET':
      return { data: createInitialData(), stack: [{ name: 'start' }] }

    case 'PUSH':
      return { ...state, stack: [...state.stack, action.screen] }

    case 'POP':
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1) } : state

    case 'GO_TAB':
      return { ...state, stack: [{ name: action.tab }] }

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
      const changes = [...state.data.changes, { id: `c-${Date.now()}`, text: changeText, timeLabel: CONFIRM_TIME_LABEL }]

      return {
        data: { ...state.data, work, teamActivity, changes },
        stack: [...state.stack, { name: 'confirmed', bedId: action.bedId, workId: action.workId }],
      }
    }

    default:
      return state
  }
}

interface DemoContextValue {
  data: DemoData
  screen: ScreenState
  canGoBack: boolean
  reset: () => void
  push: (screen: ScreenState) => void
  goBack: () => void
  goTab: (tab: TabName) => void
  startWork: (bedId: string, workId: string) => void
  submitCapture: (bedId: string, workId: string, input: string) => void
  confirmCapture: (bedId: string, workId: string, intent: DetectedIntent, input: string) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): State => ({
    data: createInitialData(),
    stack: [{ name: 'start' }],
  }))

  const value: DemoContextValue = {
    data: state.data,
    screen: state.stack[state.stack.length - 1],
    canGoBack: state.stack.length > 1,
    reset: () => dispatch({ type: 'RESET' }),
    push: (screen) => dispatch({ type: 'PUSH', screen }),
    goBack: () => dispatch({ type: 'POP' }),
    goTab: (tab) => dispatch({ type: 'GO_TAB', tab }),
    startWork: (bedId, workId) => dispatch({ type: 'START_WORK', bedId, workId }),
    submitCapture: (bedId, workId, input) => {
      const intent = detectIntent(input)
      dispatch({ type: 'SUBMIT_CAPTURE', bedId, workId, input, intent })
    },
    confirmCapture: (bedId, workId, intent, input) => dispatch({ type: 'CONFIRM_CAPTURE', bedId, workId, intent, input }),
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
