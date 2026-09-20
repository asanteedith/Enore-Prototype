import { useApp } from '../state/AppContext'

const LABELS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  PENDING_SYNC: 'Pending sync',
  SYNCING: 'Syncing…',
  SYNCED: 'Synced',
} as const

export function ConnectivityIndicator() {
  const { state, toggleConnectivity } = useApp()
  const c = state.connectivity
  const tappable = c === 'ONLINE' || c === 'OFFLINE'

  return (
    <button
      className={`connectivity-pill connectivity-${c.toLowerCase()}`}
      onClick={tappable ? toggleConnectivity : undefined}
      type="button"
      disabled={!tappable}
      aria-label={`Connectivity: ${LABELS[c]}${tappable ? ' — tap to simulate the other state' : ''}`}
    >
      <span className="connectivity-dot" />
      {LABELS[c]}
    </button>
  )
}
