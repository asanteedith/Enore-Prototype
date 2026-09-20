import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type {
  AppState,
  CaptureSource,
  Connectivity,
  NewItemState,
  PaperTarget,
  PatientId,
  Screen,
  WorkItem,
} from './types'
import { INITIAL_EVENTS, INITIAL_WORK_ITEMS, PATIENTS } from './initialData'
import { INITIAL_NOW, advanceTime } from './time'
import { detectMatch } from './detectMatch'

const WOUND_ASSESSMENT_ID = 'p002-wound-assessment'

function initialState(): AppState {
  return {
    screen: { name: 'start' },
    history: [{ name: 'start' }],
    nowTime: INITIAL_NOW,
    patients: PATIENTS,
    workItems: INITIAL_WORK_ITEMS,
    events: INITIAL_EVENTS,
    paperNotes: { 'P-001': '', 'P-002': '', 'P-003': '', NONE: '' },
    handoverHiddenItemIds: [],
    handoverExtraNotes: { 'P-001': [], 'P-002': [], 'P-003': [] },
    handoverComplete: false,
    assistOpen: false,
    captureSuggestion: null,
    pendingCapture: null,
    connectivity: 'ONLINE',
    awayEventFired: false,
  }
}

type Action =
  | { type: 'GO_TAB'; screen: Screen }
  | { type: 'PUSH'; screen: Screen }
  | { type: 'BACK' }
  | { type: 'BEGIN_SHIFT' }
  | { type: 'START_WORK'; id: string; lastAction?: string; nextAction?: string }
  | { type: 'RECORD_PROGRESS'; id: string; lastAction: string; nextAction?: string }
  | { type: 'COMPLETE_WORK'; id: string }
  | { type: 'FOLLOW_UP'; id: string }
  | { type: 'ESCALATE'; id: string }
  | { type: 'RESUME_WORK'; id: string }
  | { type: 'CHECK_RESULT'; id: string; resultNote: string }
  | { type: 'REVIEW_RESULT'; id: string }
  | { type: 'CLOSE_RESULT'; id: string }
  | { type: 'CAPTURE_ANALYZE'; patientId?: PatientId; text: string; source: CaptureSource }
  | { type: 'CONFIRM_SUGGESTION'; targetState: 'COMPLETED' | 'IN_PROGRESS' }
  | { type: 'DISMISS_SUGGESTION' }
  | { type: 'CREATE_ITEM_FROM_CAPTURE'; state: NewItemState; waitingFor?: string }
  | { type: 'CANCEL_PENDING_CAPTURE' }
  | { type: 'SET_PAPER'; target: PaperTarget; html: string }
  | { type: 'TOGGLE_HANDOVER_ITEM'; itemId: string }
  | { type: 'ADD_HANDOVER_NOTE'; patientId: PatientId; text: string }
  | { type: 'REMOVE_HANDOVER_NOTE'; patientId: PatientId; index: number }
  | { type: 'COMPLETE_HANDOVER' }
  | { type: 'OPEN_ASSIST' }
  | { type: 'CLOSE_ASSIST' }
  | { type: 'TOGGLE_CONNECTIVITY' }
  | { type: 'ADVANCE_SYNC'; next: Connectivity }
  | { type: 'RESET' }

function tick(state: AppState, minutes = 1): string {
  return advanceTime(state.nowTime, minutes)
}

function addEvent(state: AppState, patientId: PatientId, label: string, time: string): AppState['events'] {
  return [
    { id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, patientId, time, label, pendingSync: state.connectivity !== 'ONLINE' },
    ...state.events,
  ]
}

function withPendingSync(item: WorkItem, state: AppState): WorkItem {
  return state.connectivity !== 'ONLINE' ? { ...item, pendingSync: true } : item
}

/**
 * Leaving a patient's screen while she has work IN_PROGRESS there is a real
 * interruption — ENORE marks it so, rather than silently losing where she was.
 * Staying within the same patient (their own detail screen, or capture scoped
 * to them) never counts as leaving.
 */
function applyInterruption(state: AppState, nextScreen: Screen): AppState {
  if (state.screen.name !== 'patientDetail') return state
  const leavingPatientId = state.screen.patientId
  const staysWithPatient =
    (nextScreen.name === 'patientDetail' && nextScreen.patientId === leavingPatientId) ||
    (nextScreen.name === 'capture' && nextScreen.patientId === leavingPatientId)
  if (staysWithPatient) return state

  const toInterrupt = state.workItems.filter((w) => w.patientId === leavingPatientId && w.state === 'IN_PROGRESS')
  if (toInterrupt.length === 0) return state
  const interruptIds = new Set(toInterrupt.map((w) => w.id))

  // Recorded at the moment she leaves — before any time passes — so "while away" events (timed after this) are ordered correctly.
  const interruptedAt = state.nowTime
  let nowTime = state.nowTime
  let events = state.events
  let awayEventFired = state.awayEventFired

  if (interruptIds.has(WOUND_ASSESSMENT_ID) && !awayEventFired) {
    nowTime = advanceTime(state.nowTime, 6)
    events = [
      { id: `evt-away-${Date.now()}`, patientId: 'P-002', time: nowTime, label: 'Temperature updated' },
      ...events,
    ]
    awayEventFired = true
  } else {
    nowTime = advanceTime(state.nowTime, 2)
  }

  const workItems = state.workItems.map((w) =>
    interruptIds.has(w.id) ? { ...w, state: 'INTERRUPTED' as const, interruptedAt } : w,
  )

  return { ...state, workItems, events, nowTime, awayEventFired }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GO_TAB': {
      const base = applyInterruption(state, action.screen)
      return { ...base, screen: action.screen, history: [action.screen] }
    }
    case 'PUSH': {
      const base = applyInterruption(state, action.screen)
      return { ...base, screen: action.screen, history: [...base.history, action.screen] }
    }
    case 'BACK': {
      if (state.history.length <= 1) return state
      const history = state.history.slice(0, -1)
      const nextScreen = history[history.length - 1]
      const base = applyInterruption(state, nextScreen)
      return { ...base, screen: nextScreen, history }
    }
    case 'BEGIN_SHIFT':
      return { ...state, screen: { name: 'home' }, history: [{ name: 'home' }] }

    case 'START_WORK': {
      const nowTime = tick(state)
      const workItems = state.workItems.map((w) =>
        w.id === action.id
          ? withPendingSync(
              {
                ...w,
                state: 'IN_PROGRESS' as const,
                startedAt: w.startedAt ?? nowTime,
                lastAction: action.lastAction ?? `Started ${w.title.toLowerCase()}`,
                nextAction: action.nextAction ?? w.nextAction,
              },
              state,
            )
          : w,
      )
      const item = state.workItems.find((w) => w.id === action.id)
      const events = item ? addEvent(state, item.patientId, `${item.title} started`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'RECORD_PROGRESS': {
      const nowTime = tick(state)
      const workItems = state.workItems.map((w) =>
        w.id === action.id
          ? withPendingSync({ ...w, lastAction: action.lastAction, nextAction: action.nextAction ?? w.nextAction }, state)
          : w,
      )
      const item = state.workItems.find((w) => w.id === action.id)
      const events = item ? addEvent(state, item.patientId, action.lastAction, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'COMPLETE_WORK': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) =>
        w.id === action.id
          ? withPendingSync(
              {
                ...w,
                state: 'COMPLETED' as const,
                completedAt: nowTime,
                nextAction: undefined,
                resultStage: w.resultStage ? 'CLOSED' : w.resultStage,
              },
              state,
            )
          : w,
      )
      const events = item ? addEvent(state, item.patientId, `${item.title} completed`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'FOLLOW_UP': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const events = item ? addEvent(state, item.patientId, `Followed up — ${item.title}`, nowTime) : state.events
      return { ...state, events, nowTime }
    }

    case 'ESCALATE': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) => (w.id === action.id ? { ...w, escalated: true } : w))
      const events = item
        ? addEvent(state, item.patientId, `${item.title} escalated${item.escalationRule ? ` — ${item.escalationRule.label}` : ''}`, nowTime)
        : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'RESUME_WORK': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) =>
        w.id === action.id ? withPendingSync({ ...w, state: 'IN_PROGRESS' as const, resumedAt: nowTime }, state) : w,
      )
      const events = item ? addEvent(state, item.patientId, `Resumed — ${item.title}`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'CHECK_RESULT': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) =>
        w.id === action.id
          ? withPendingSync({ ...w, state: 'OPEN' as const, resultStage: 'AVAILABLE' as const, resultNote: action.resultNote }, state)
          : w,
      )
      const events = item ? addEvent(state, item.patientId, `${item.title} available`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'REVIEW_RESULT': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) => (w.id === action.id ? withPendingSync({ ...w, resultStage: 'REVIEWED' as const }, state) : w))
      const events = item ? addEvent(state, item.patientId, `${item.title} reviewed`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'CLOSE_RESULT': {
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === action.id)
      const workItems = state.workItems.map((w) =>
        w.id === action.id
          ? withPendingSync({ ...w, state: 'COMPLETED' as const, resultStage: 'CLOSED' as const, completedAt: nowTime }, state)
          : w,
      )
      const events = item ? addEvent(state, item.patientId, `${item.title} closed`, nowTime) : state.events
      return { ...state, workItems, events, nowTime }
    }

    case 'CAPTURE_ANALYZE': {
      const nowTime = tick(state)
      const events = action.patientId ? addEvent(state, action.patientId, action.text.trim(), nowTime) : state.events
      const match = detectMatch(action.text, action.patientId, state.workItems)
      if (match) {
        return {
          ...state,
          events,
          nowTime,
          captureSuggestion: {
            itemId: match.id,
            itemTitle: match.title,
            patientId: match.patientId,
            itemState: match.state,
            text: action.text.trim(),
          },
          pendingCapture: null,
        }
      }
      return {
        ...state,
        events,
        nowTime,
        captureSuggestion: null,
        pendingCapture: { patientId: action.patientId, text: action.text.trim(), source: action.source },
      }
    }

    case 'CONFIRM_SUGGESTION': {
      if (!state.captureSuggestion) return state
      const { itemId, text } = state.captureSuggestion
      const nowTime = tick(state)
      const item = state.workItems.find((w) => w.id === itemId)
      let workItems = state.workItems
      let events = state.events
      if (action.targetState === 'COMPLETED') {
        workItems = state.workItems.map((w) =>
          w.id === itemId
            ? withPendingSync(
                { ...w, state: 'COMPLETED' as const, completedAt: nowTime, resultStage: w.resultStage ? 'CLOSED' : w.resultStage },
                state,
              )
            : w,
        )
        events = item ? addEvent(state, item.patientId, `${item.title} completed`, nowTime) : state.events
      } else {
        workItems = state.workItems.map((w) =>
          w.id === itemId
            ? withPendingSync({ ...w, state: 'IN_PROGRESS' as const, startedAt: w.startedAt ?? nowTime, lastAction: text }, state)
            : w,
        )
        events = item ? addEvent(state, item.patientId, `${item.title} updated`, nowTime) : state.events
      }
      return { ...state, workItems, events, nowTime, captureSuggestion: null }
    }

    case 'DISMISS_SUGGESTION':
      return { ...state, captureSuggestion: null }

    case 'CREATE_ITEM_FROM_CAPTURE': {
      if (!state.pendingCapture || !state.pendingCapture.patientId) return { ...state, pendingCapture: null }
      const { patientId, text } = state.pendingCapture
      const nowTime = tick(state)
      const newItem: WorkItem = withPendingSync(
        {
          id: `captured-${Date.now()}`,
          patientId,
          title: text,
          category: 'Captured',
          state: action.state,
          owner: 'Me',
          waitingFor: action.state === 'WAITING' ? action.waitingFor || 'Someone' : undefined,
          since: action.state === 'WAITING' ? nowTime : undefined,
          startedAt: action.state === 'IN_PROGRESS' ? nowTime : undefined,
        },
        state,
      )
      return { ...state, workItems: [...state.workItems, newItem], nowTime, pendingCapture: null }
    }

    case 'CANCEL_PENDING_CAPTURE':
      return { ...state, pendingCapture: null }

    case 'SET_PAPER':
      return { ...state, paperNotes: { ...state.paperNotes, [action.target]: action.html } }

    case 'TOGGLE_HANDOVER_ITEM': {
      const hidden = state.handoverHiddenItemIds.includes(action.itemId)
        ? state.handoverHiddenItemIds.filter((id) => id !== action.itemId)
        : [...state.handoverHiddenItemIds, action.itemId]
      return { ...state, handoverHiddenItemIds: hidden }
    }
    case 'ADD_HANDOVER_NOTE': {
      const notes = [...(state.handoverExtraNotes[action.patientId] ?? []), action.text]
      return { ...state, handoverExtraNotes: { ...state.handoverExtraNotes, [action.patientId]: notes } }
    }
    case 'REMOVE_HANDOVER_NOTE': {
      const notes = (state.handoverExtraNotes[action.patientId] ?? []).filter((_, i) => i !== action.index)
      return { ...state, handoverExtraNotes: { ...state.handoverExtraNotes, [action.patientId]: notes } }
    }
    case 'COMPLETE_HANDOVER':
      return { ...state, handoverComplete: true, screen: { name: 'handoverComplete' }, history: [{ name: 'handoverComplete' }] }

    case 'OPEN_ASSIST':
      return { ...state, assistOpen: true }
    case 'CLOSE_ASSIST':
      return { ...state, assistOpen: false }

    case 'TOGGLE_CONNECTIVITY': {
      if (state.connectivity === 'ONLINE') return { ...state, connectivity: 'OFFLINE' }
      if (state.connectivity === 'OFFLINE') {
        const hasPending = state.workItems.some((w) => w.pendingSync) || state.events.some((e) => e.pendingSync)
        return { ...state, connectivity: hasPending ? 'PENDING_SYNC' : 'ONLINE' }
      }
      return state
    }
    case 'ADVANCE_SYNC': {
      if (action.next === 'ONLINE') {
        return {
          ...state,
          connectivity: 'ONLINE',
          workItems: state.workItems.map((w) => (w.pendingSync ? { ...w, pendingSync: false } : w)),
          events: state.events.map((e) => (e.pendingSync ? { ...e, pendingSync: false } : e)),
        }
      }
      return { ...state, connectivity: action.next }
    }

    case 'RESET':
      return initialState()

    default:
      return state
  }
}

interface Ctx {
  state: AppState
  goTab: (screen: Screen) => void
  push: (screen: Screen) => void
  back: () => void
  beginShift: () => void
  startWork: (id: string, lastAction?: string, nextAction?: string) => void
  recordProgress: (id: string, lastAction: string, nextAction?: string) => void
  completeWork: (id: string) => void
  followUp: (id: string) => void
  escalate: (id: string) => void
  resumeWork: (id: string) => void
  checkResult: (id: string, resultNote: string) => void
  reviewResult: (id: string) => void
  closeResult: (id: string) => void
  captureAnalyze: (patientId: PatientId | undefined, text: string, source: CaptureSource) => void
  confirmSuggestion: (targetState: 'COMPLETED' | 'IN_PROGRESS') => void
  dismissSuggestion: () => void
  createItemFromCapture: (state: NewItemState, waitingFor?: string) => void
  cancelPendingCapture: () => void
  setPaper: (target: PaperTarget, html: string) => void
  toggleHandoverItem: (itemId: string) => void
  addHandoverNote: (patientId: PatientId, text: string) => void
  removeHandoverNote: (patientId: PatientId, index: number) => void
  completeHandover: () => void
  openAssist: () => void
  closeAssist: () => void
  toggleConnectivity: () => void
  reset: () => void
}

const AppContextInstance = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  // Simulated connectivity recovery: PENDING_SYNC -> SYNCING -> SYNCED -> ONLINE.
  useEffect(() => {
    if (state.connectivity === 'PENDING_SYNC') {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_SYNC', next: 'SYNCING' }), 700)
      return () => clearTimeout(t)
    }
    if (state.connectivity === 'SYNCING') {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_SYNC', next: 'SYNCED' }), 900)
      return () => clearTimeout(t)
    }
    if (state.connectivity === 'SYNCED') {
      const t = setTimeout(() => dispatch({ type: 'ADVANCE_SYNC', next: 'ONLINE' }), 700)
      return () => clearTimeout(t)
    }
  }, [state.connectivity])

  const value = useMemo<Ctx>(
    () => ({
      state,
      goTab: (screen) => dispatch({ type: 'GO_TAB', screen }),
      push: (screen) => dispatch({ type: 'PUSH', screen }),
      back: () => dispatch({ type: 'BACK' }),
      beginShift: () => dispatch({ type: 'BEGIN_SHIFT' }),
      startWork: (id, lastAction, nextAction) => dispatch({ type: 'START_WORK', id, lastAction, nextAction }),
      recordProgress: (id, lastAction, nextAction) => dispatch({ type: 'RECORD_PROGRESS', id, lastAction, nextAction }),
      completeWork: (id) => dispatch({ type: 'COMPLETE_WORK', id }),
      followUp: (id) => dispatch({ type: 'FOLLOW_UP', id }),
      escalate: (id) => dispatch({ type: 'ESCALATE', id }),
      resumeWork: (id) => dispatch({ type: 'RESUME_WORK', id }),
      checkResult: (id, resultNote) => dispatch({ type: 'CHECK_RESULT', id, resultNote }),
      reviewResult: (id) => dispatch({ type: 'REVIEW_RESULT', id }),
      closeResult: (id) => dispatch({ type: 'CLOSE_RESULT', id }),
      captureAnalyze: (patientId, text, source) => dispatch({ type: 'CAPTURE_ANALYZE', patientId, text, source }),
      confirmSuggestion: (targetState) => dispatch({ type: 'CONFIRM_SUGGESTION', targetState }),
      dismissSuggestion: () => dispatch({ type: 'DISMISS_SUGGESTION' }),
      createItemFromCapture: (newState, waitingFor) => dispatch({ type: 'CREATE_ITEM_FROM_CAPTURE', state: newState, waitingFor }),
      cancelPendingCapture: () => dispatch({ type: 'CANCEL_PENDING_CAPTURE' }),
      setPaper: (target, html) => dispatch({ type: 'SET_PAPER', target, html }),
      toggleHandoverItem: (itemId) => dispatch({ type: 'TOGGLE_HANDOVER_ITEM', itemId }),
      addHandoverNote: (patientId, text) => dispatch({ type: 'ADD_HANDOVER_NOTE', patientId, text }),
      removeHandoverNote: (patientId, index) => dispatch({ type: 'REMOVE_HANDOVER_NOTE', patientId, index }),
      completeHandover: () => dispatch({ type: 'COMPLETE_HANDOVER' }),
      openAssist: () => dispatch({ type: 'OPEN_ASSIST' }),
      closeAssist: () => dispatch({ type: 'CLOSE_ASSIST' }),
      toggleConnectivity: () => dispatch({ type: 'TOGGLE_CONNECTIVITY' }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  )

  return <AppContextInstance.Provider value={value}>{children}</AppContextInstance.Provider>
}

export function useApp() {
  const ctx = useContext(AppContextInstance)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
