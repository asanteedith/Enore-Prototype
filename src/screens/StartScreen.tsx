import { useDemo } from '../state/DemoContext'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'

export function StartScreen() {
  const { selectPersona, push } = useDemo()

  return (
    <div className="start-screen">
      <div className="start-screen-mark">Enore</div>
      <p className="start-screen-tagline">Spend less time on the phone.<br />More time with the patient.</p>
      <div className="start-screen-spacer" />
      <p className="start-screen-note">
        Follow one nurse through her shift on Medical Ward, or step into the shared Team Workspace as the nurse
        in-charge — from noticing something, to acting, to the whole team seeing it reflected automatically.
      </p>
      <PrimaryButton onClick={() => selectPersona('edith')}>Continue as Edith — Staff Nurse</PrimaryButton>
      <PrimaryButton onClick={() => selectPersona('ama')}>Continue as Ama — Nurse In-Charge</PrimaryButton>
      <SecondaryButton onClick={() => push({ name: 'joinTeam' })}>Join a Team Workspace</SecondaryButton>
    </div>
  )
}
