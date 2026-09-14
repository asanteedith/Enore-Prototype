import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import { getBed, getWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { CaptureInput } from '../components/CaptureInput'

export function CaptureScreen({ bedId, workId, prefill }: { bedId: string; workId: string; prefill?: string }) {
  const { data, goBack, submitCapture } = useDemo()
  const bed = getBed(data, bedId)
  const work = getWork(data, workId)
  const [input, setInput] = useState(prefill ?? '')

  return (
    <AppShell title="Quick capture" onBack={goBack}>
      <div className="capture-context-chip">
        {bed.label} · {work.title}
      </div>

      <h1 className="capture-question">What happened?</h1>

      <CaptureInput
        value={input}
        onChange={setInput}
        onSubmit={() => submitCapture(bedId, workId, input.trim())}
        placeholder={`e.g. "${bed.label} ${work.title.toLowerCase()} completed."`}
      />

      <p className="capture-trust-note">
        Enore already knows the bed and the work. No need to choose where this goes.
      </p>
    </AppShell>
  )
}
