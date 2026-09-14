import { useState } from 'react'
import { useDemo } from '../state/DemoContext'
import { AppShell } from '../components/AppShell'
import { SectionHeader } from '../components/SectionHeader'
import { PrimaryButton } from '../components/PrimaryButton'

type Step = 'choose' | 'found' | 'requested' | 'member'

const JOIN_METHODS = ['Scan QR code', 'Use invite link', 'Search workspace by code']

export function JoinTeamScreen() {
  const { data, goBack, selectPersona } = useDemo()
  const [step, setStep] = useState<Step>('choose')

  return (
    <AppShell title="Join a Team Workspace" onBack={goBack} centerContent={step !== 'choose'}>
      {step === 'choose' && (
        <>
          <SectionHeader eyebrow="Team Workspace" title="Find your ward" subtitle="A workspace belongs to the care team, not to one nurse." />
          <div className="join-methods">
            {JOIN_METHODS.map((method) => (
              <button key={method} className="agent-prompt-chip" onClick={() => setStep('found')} type="button">
                {method}
              </button>
            ))}
          </div>
          <p className="capture-trust-note">No workspace yet? You can keep using Enore in Personal Workspace.</p>
        </>
      )}

      {step === 'found' && (
        <>
          <div className="join-status-title">Workspace found</div>
          <div className="join-status-body">{data.ward} · Team Workspace</div>
          <PrimaryButton onClick={() => setStep('requested')}>Request to join</PrimaryButton>
          <p className="capture-trust-note">A QR code or link finds a workspace — it doesn't grant membership on its own.</p>
        </>
      )}

      {step === 'requested' && (
        <>
          <div className="join-status-title">Request sent</div>
          <div className="join-status-body">Waiting for a Nurse In-Charge to approve your request to join {data.ward}.</div>
          <PrimaryButton onClick={() => setStep('member')}>Simulate approval</PrimaryButton>
        </>
      )}

      {step === 'member' && (
        <>
          <div className="join-status-title">✓ You're a member</div>
          <div className="join-status-body">You've joined {data.ward} Team Workspace. Your existing Enore account — no second login needed.</div>
          <PrimaryButton onClick={() => selectPersona('edith')}>Continue</PrimaryButton>
        </>
      )}
    </AppShell>
  )
}
