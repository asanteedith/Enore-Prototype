import { useDemo } from '../state/DemoContext'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'

export function StartScreen() {
  const { selectPersona } = useDemo()

  return (
    <div className="start-screen">
      <div className="start-screen-mark">Enore</div>
      <p className="start-screen-tagline">
        Open. Glance.
        <br />
        Keep work moving.
      </p>
      <div className="start-screen-spacer" />
      <p className="start-screen-note">
        Demonstrate one shared work state: personal work can connect to the team, ward work can wait on Pharmacy or
        Laboratory, and unfinished work carries into handover.
      </p>
      <PrimaryButton onClick={() => selectPersona('ama')}>Team Overview - Ama</PrimaryButton>
      <PrimaryButton onClick={() => selectPersona('edith')}>My Work - Edith</PrimaryButton>
      <SecondaryButton onClick={() => selectPersona('edith')}>Start with personal work</SecondaryButton>
    </div>
  )
}
