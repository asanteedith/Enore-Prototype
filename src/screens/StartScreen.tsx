import { useApp } from '../state/AppContext'
import { PrimaryButton } from '../components/PrimaryButton'

export function StartScreen() {
  const { beginShift } = useApp()

  return (
    <div className="start-screen">
      <div className="start-screen-mark">ENORE</div>
      <p className="start-screen-tagline">
        Spend more time with patients.
        <br />
        Less time documenting, chasing, and remembering.
      </p>
      <div className="start-screen-spacer" />
      <div className="start-screen-shift">
        <div className="start-screen-shift-row">Morning Shift · 07:00–15:00</div>
        <div className="start-screen-shift-row">Surgical Ward</div>
      </div>
      <PrimaryButton onClick={beginShift}>Begin shift</PrimaryButton>
      <p className="synthetic-note">SYNTHETIC DATA · NOT FOR CLINICAL USE</p>
    </div>
  )
}
