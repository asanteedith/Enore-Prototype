import { CaptureIcon } from './icons'

export function CaptureFAB({ onClick }: { onClick: () => void }) {
  return (
    <button className="capture-fab" onClick={onClick} type="button" aria-label="Capture">
      <CaptureIcon />
      <span>Capture</span>
    </button>
  )
}
