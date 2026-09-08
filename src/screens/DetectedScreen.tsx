import { useDemo } from '../state/DemoContext'
import type { DetectedIntent } from '../state/types'
import { getBed, getWork } from '../state/selectors'
import { intentLabel } from '../state/detectIntent'
import { AppShell } from '../components/AppShell'
import { AIResponse } from '../components/AIResponse'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'

interface Props {
  bedId: string
  workId: string
  input: string
  intent: DetectedIntent
}

export function DetectedScreen({ bedId, workId, input, intent }: Props) {
  const { data, goBack, push, confirmCapture } = useDemo()
  const bed = getBed(data, bedId)
  const work = getWork(data, workId)

  return (
    <AppShell title="Quick capture" onBack={goBack} centerContent>
      <div className="capture-input-echo">“{input}”</div>

      <AIResponse label="Enore detected">
        <div className="detected-intent">{intentLabel(intent)}</div>
        <div className="detected-context">
          {bed.label} · {work.title}
        </div>
      </AIResponse>

      <PrimaryButton onClick={() => confirmCapture(bedId, workId, intent, input)}>Confirm</PrimaryButton>
      <SecondaryButton onClick={() => push({ name: 'capture', bedId, workId, prefill: input })}>Edit</SecondaryButton>

      <p className="capture-trust-note">The nurse stays in control.</p>
    </AppShell>
  )
}
