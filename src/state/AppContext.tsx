import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import type { AppState, PatientId, PaperTarget, Screen } from './types'
import { INITIAL_EVENTS, INITIAL_HANDOVER_NOTES, INITIAL_WORK_ITEMS, PATIENTS } from './initialData'
import { SHIFT_NOW } from './time'
import { detectCompletion } from './detectCompletion'

function initialState(): AppState {
  return {
    screen: { name: 'start' },
    history: [{ name: 'start' }],
    nowTime: SHIFT_NOW,
    patients: PATIENTS,
    workItems: INITIAL_WORK_ITEMS,
    events: INITIAL_EVENTS,
    paperNotes: { 'P-001': '', 'P-002': '', 'P-003': '', NONE: '' },
    handoverNotes: INITIAL_HANDOVER_NOTES,
    handoverComplete: false,
    assistOpen: false,
    captureSuggestion: null,
  }
}

type Action =
  | { type: 'GO_TAB'; screen: Screen }
  | { type: 'PUSH'; screen: Screen }
  | { type: 'BACK' }
  | { type: 'BEGIN_SHIFT' }
  | { type: 'COMPLETE_WORK_ITEM'; id: string }
  | { type: 'CAPTURE_SAVE'; patientId?: PatientId; text: string }
  | { type: 'CONFIRM_SUGGESTION' }
  | { type: 'DISMISS_SUGGESTION' }
  | { type: 'SET_PAPER'; target: PaperTarget; html: string }
  | { type: 'EDIT_HANDOVER_LINE'; patientId: PatientId; index: number; text: string }
  | { type: 'ADD_HANDOVER_LINE'; patientId: PatientId; text: string }
  | { type: 'REMOVE_HANDOVER_LINE'; patientId: PatientId; index: number }
  | { type: 'COMPLETE_HANDOVER' }
  | { type: 'OPEN_ASSIST' }
  | { type: 'CLOSE_ASSIST' }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'GO_TAB':
      return { ...state, screen: action.screen, history: [action.screen] }
    case 'PUSH':
      return { ...state, screen: action.screen, history: [...state.history, action.screen] }
    case 'BACK': {
      if (state.history.length <= 1) return state
      const history = state.history.slice(0, -1)
      return { ...state, screen: history[history.length - 1], history }
    }
    case 'BEGIN_SHIFT':
      return { ...state, screen: { name: 'home' }, history: [{ name: 'home' }] }
    case 'COMPLETE_WORK_ITEM': {
      const workItems = state.workItems.map((w) =>
        w.id === action.id ? { ...w, state: 'DONE' as const, overdue: false, completedAt: state.nowTime } : w,
      )
      const item = state.workItems.find((w) => w.id === action.id)
      const events = item
        ? [
            {
              id: `evt-${Date.now()}`,
              patientId: item.patientId,
              time: state.nowTime,
              label: `${item.title} completed`,
            },
            ...state.events,
          ]
        : state.events
      return { ...state, workItems, events }
    }
    case 'CAPTURE_SAVE': {
      const events = [
        {
          id: `evt-${Date.now()}`,
          patientId: action.patientId ?? ('P-001' as PatientId),
          time: state.nowTime,
          label: action.text.trim(),
        },
        ...state.events,
      ]
      const match = detectCompletion(action.text, action.patientId, state.workItems)
      const captureSuggestion = match
        ? { workItemId: match.id, workItemTitle: match.title, patientId: match.patientId }
        : null
      return { ...state, events, captureSuggestion }
    }
    case 'CONFIRM_SUGGESTION': {
      if (!state.captureSuggestion) return state
      const id = state.captureSuggestion.workItemId
      const workItems = state.workItems.map((w) =>
        w.id === id ? { ...w, state: 'DONE' as const, overdue: false, completedAt: state.nowTime } : w,
      )
      return { ...state, workItems, captureSuggestion: null }
    }
    case 'DISMISS_SUGGESTION':
      return { ...state, captureSuggestion: null }
    case 'SET_PAPER':
      return { ...state, paperNotes: { ...state.paperNotes, [action.target]: action.html } }
    case 'EDIT_HANDOVER_LINE': {
      const lines = [...(state.handoverNotes[action.patientId] ?? [])]
      lines[action.index] = action.text
      return { ...state, handoverNotes: { ...state.handoverNotes, [action.patientId]: lines } }
    }
    case 'ADD_HANDOVER_LINE': {
      const lines = [...(state.handoverNotes[action.patientId] ?? []), action.text]
      return { ...state, handoverNotes: { ...state.handoverNotes, [action.patientId]: lines } }
    }
    case 'REMOVE_HANDOVER_LINE': {
      const lines = (state.handoverNotes[action.patientId] ?? []).filter((_, i) => i !== action.index)
      return { ...state, handoverNotes: { ...state.handoverNotes, [action.patientId]: lines } }
    }
    case 'COMPLETE_HANDOVER':
      return { ...state, handoverComplete: true, screen: { name: 'handoverComplete' }, history: [{ name: 'handoverComplete' }] }
    case 'OPEN_ASSIST':
      return { ...state, assistOpen: true }
    case 'CLOSE_ASSIST':
      return { ...state, assistOpen: false }
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
  completeWorkItem: (id: string) => void
  captureSave: (patientId: PatientId | undefined, text: string) => void
  confirmSuggestion: () => void
  dismissSuggestion: () => void
  setPaper: (target: PaperTarget, html: string) => void
  editHandoverLine: (patientId: PatientId, index: number, text: string) => void
  addHandoverLine: (patientId: PatientId, text: string) => void
  removeHandoverLine: (patientId: PatientId, index: number) => void
  completeHandover: () => void
  openAssist: () => void
  closeAssist: () => void
  reset: () => void
}

const AppContextInstance = createContext<Ctx | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  const value = useMemo<Ctx>(
    () => ({
      state,
      goTab: (screen) => dispatch({ type: 'GO_TAB', screen }),
      push: (screen) => dispatch({ type: 'PUSH', screen }),
      back: () => dispatch({ type: 'BACK' }),
      beginShift: () => dispatch({ type: 'BEGIN_SHIFT' }),
      completeWorkItem: (id) => dispatch({ type: 'COMPLETE_WORK_ITEM', id }),
      captureSave: (patientId, text) => dispatch({ type: 'CAPTURE_SAVE', patientId, text }),
      confirmSuggestion: () => dispatch({ type: 'CONFIRM_SUGGESTION' }),
      dismissSuggestion: () => dispatch({ type: 'DISMISS_SUGGESTION' }),
      setPaper: (target, html) => dispatch({ type: 'SET_PAPER', target, html }),
      editHandoverLine: (patientId, index, text) => dispatch({ type: 'EDIT_HANDOVER_LINE', patientId, index, text }),
      addHandoverLine: (patientId, text) => dispatch({ type: 'ADD_HANDOVER_LINE', patientId, text }),
      removeHandoverLine: (patientId, index) => dispatch({ type: 'REMOVE_HANDOVER_LINE', patientId, index }),
      completeHandover: () => dispatch({ type: 'COMPLETE_HANDOVER' }),
      openAssist: () => dispatch({ type: 'OPEN_ASSIST' }),
      closeAssist: () => dispatch({ type: 'CLOSE_ASSIST' }),
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
