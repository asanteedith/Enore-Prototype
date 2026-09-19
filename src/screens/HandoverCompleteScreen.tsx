import { useApp } from '../state/AppContext'

export function HandoverCompleteScreen() {
  const { reset } = useApp()

  return (
    <div className="handover-complete">
      <div className="handover-complete-mark">✓</div>
      <h1 className="handover-complete-title">Handover ready</h1>
      <p className="handover-complete-body">
        Your shift summary has been prepared. Share it with the next nurse when you meet — ENORE does not send
        it automatically.
      </p>
      <button className="btn btn-secondary btn-full" type="button" onClick={reset}>
        Start a new shift
      </button>
    </div>
  )
}
