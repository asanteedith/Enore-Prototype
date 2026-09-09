import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import { getBed, outstandingWork } from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { HandoverSummary } from '../components/HandoverSummary'
import { PrimaryButton } from '../components/PrimaryButton'

export function HandoverScreen() {
  const { data, goBack, goTab } = useDemo()
  const [reviewed, setReviewed] = useState(false)
  const outstanding = outstandingWork(data).map((w) => ({ bedLabel: getBed(data, w.bedId).label, title: w.title }))

  return (
    <AppShell title="Handover" onBack={goBack}>
      <SectionHeader eyebrow="Shift summary" title="Handover" subtitle="Prepared from the work already captured." />

      <HandoverSummary
        changesCount={data.changes.length}
        outstandingCount={outstanding.length}
        changes={data.changes.map((c) => ({
          id: c.id,
          text: c.text,
          justUpdated: data.recentUpdate !== null && c.id === data.changes[data.changes.length - 1].id,
        }))}
        outstanding={outstanding}
      />

      {reviewed ? (
        <>
          <div className="handover-reviewed">✓ Handover reviewed and finalized</div>
          <PrimaryButton onClick={() => goTab('team')}>Back to Team</PrimaryButton>
        </>
      ) : (
        <PrimaryButton onClick={() => setReviewed(true)}>Review & finalize</PrimaryButton>
      )}

      <p className="handover-trust-note">Nothing is finalized without nurse review.</p>
    </AppShell>
  )
}
