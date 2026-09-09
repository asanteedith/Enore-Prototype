import { useDemo } from '../state/DemoContext'
import { PrimaryButton } from '../components/PrimaryButton'

export function StartScreen() {
  const { goTab } = useDemo()

  return (
    <div className="start-screen">
      <div className="start-screen-mark">Enore</div>
      <p className="start-screen-tagline">Spend less time on the phone.<br />More time with the patient.</p>
      <div className="start-screen-spacer" />
      <p className="start-screen-note">
        Follow Edith, a nurse on Medical Ward, through one moment in her shift — from noticing something, to
        acting, to the whole team seeing it reflected automatically.
      </p>
      <PrimaryButton onClick={() => goTab('now')}>Start demo</PrimaryButton>
    </div>
  )
}
