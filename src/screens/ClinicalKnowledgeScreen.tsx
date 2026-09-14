import { useDemo } from '../state/DemoContext'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { KnowledgeIcon } from '../components/icons'

export function ClinicalKnowledgeScreen() {
  const { goBack } = useDemo()

  return (
    <AppShell title="Clinical Knowledge AI" onBack={goBack}>
      <SectionHeader eyebrow="Separate from Workflow Agent" title="Clinical Knowledge AI" subtitle="Ask clinical questions, explore conditions and medicines, and use clinical calculators." />

      <div className="knowledge-panel">
        <KnowledgeIcon />
        <p>
          Clinical Knowledge AI helps with clinical questions and reference information. It does not see or change
          ward work, care context, or handover.
        </p>
      </div>

      <div className="knowledge-input-mock">
        <input disabled placeholder="Ask a clinical question…" />
      </div>

      <p className="knowledge-trust-note">Clinical Knowledge AI never modifies work or clinical records. The EHR remains the official record.</p>
    </AppShell>
  )
}
