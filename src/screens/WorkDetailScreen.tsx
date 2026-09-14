import { useDemo } from '../state/DemoContext'
import {
  activeDependencyForWork,
  attentionReason,
  contextLabelFor,
  getWork,
  ownerLabel,
  responseDependencyForWork,
  syncLabel,
  teamLabel,
  waitingDependencyForWork,
} from '../state/selectors'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { StatusBadge } from '../components/StatusBadge'
import { PrimaryButton } from '../components/PrimaryButton'
import { SecondaryButton } from '../components/SecondaryButton'

export function WorkDetailScreen({ workId }: { workId: string }) {
  const { data, goBack, push, chaseWork, recordResponse, resumeWork, resolveWork, connectToTeam } = useDemo()
  const item = getWork(data, workId)
  const dependency = activeDependencyForWork(data, workId)
  const waiting = waitingDependencyForWork(data, workId)
  const response = responseDependencyForWork(data, workId)
  const activity = data.changes.filter((change) => change.workId === workId).slice().reverse()
  const external = data.externalCommunications.find((event) => event.workId === workId)

  return (
    <AppShell title="Work Detail" onBack={goBack}>
      <SectionHeader eyebrow={contextLabelFor(data, item)} title={item.title} subtitle={attentionReason(data, item)} />

      <div className="detail-panel">
        <div className="detail-row">
          <span>Status</span>
          <StatusBadge status={item.status} />
        </div>
        <div className="detail-row">
          <span>Owner</span>
          <strong>{ownerLabel(data, item.ownerId)}</strong>
        </div>
        <div className="detail-row">
          <span>Scope</span>
          <strong>{item.scope === 'personal' ? 'Personal work' : teamLabel(data, item.owningTeamId)}</strong>
        </div>
        <div className="detail-row">
          <span>Sync</span>
          <strong>{syncLabel(item.syncState)}</strong>
        </div>
      </div>

      <div className="context-section">
        <div className="context-section-title">Why this exists</div>
        <div className="context-work-card">
          <div className="context-work-meta">{item.description}</div>
          <div className="context-work-meta">{item.sourceSummary}</div>
        </div>
      </div>

      {dependency && (
        <div className="context-section">
          <div className="context-section-title">Cross-team dependency</div>
          <div className="context-work-card">
            <div className="context-work-title">
              {teamLabel(data, dependency.requestedByTeamId)} to {teamLabel(data, dependency.requestedFromTeamId)}
            </div>
            <div className="context-work-meta">
              {dependency.waitingOn} - expected {dependency.expectedAtLabel}
            </div>
            {dependency.responseSummary && <div className="context-work-meta">Response: {dependency.responseSummary}</div>}
            {dependency.nextAction && <div className="context-work-meta">Next: {dependency.nextAction}</div>}
          </div>
        </div>
      )}

      {external && (
        <div className="context-section">
          <div className="context-section-title">External communication boundary</div>
          <div className="context-work-card">
            <div className="context-work-meta">{external.summary}</div>
            <div className="context-work-meta">{external.outcome}</div>
          </div>
        </div>
      )}

      <div className="context-section">
        <div className="context-section-title">Handover note</div>
        <div className="context-team-activity">{item.handoverNote}</div>
      </div>

      <div className="detail-actions">
        {item.scope === 'personal' && <PrimaryButton onClick={() => connectToTeam(item.id)}>Connect to Team</PrimaryButton>}
        {waiting && <PrimaryButton onClick={() => chaseWork(item.id)}>Chase dependency</PrimaryButton>}
        {waiting && <SecondaryButton onClick={() => recordResponse(item.id)}>Simulate response</SecondaryButton>}
        {response && <PrimaryButton onClick={() => resumeWork(item.id)}>Continue work</PrimaryButton>}
        {!waiting && !response && item.status !== 'COMPLETED' && <PrimaryButton onClick={() => resolveWork(item.id)}>Complete work</PrimaryButton>}
        {item.contextId && <SecondaryButton onClick={() => push({ name: 'teamContextDetail', contextId: item.contextId ?? item.bedId ?? '' })}>Open Care Context</SecondaryButton>}
      </div>

      <div className="context-section">
        <div className="context-section-title">Activity history</div>
        <div className="activity-list">
          {activity.map((change) => (
            <div key={change.id} className="activity-row">
              <span>{change.timeLabel}</span>
              <strong>{change.text}</strong>
              <em>{change.syncState ? syncLabel(change.syncState) : 'Synced'}</em>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
