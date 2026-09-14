import './styles/components.css'
import './styles/screens.css'
import './styles/team.css'
import { DemoProvider, useDemo } from './state/DemoContext'
import { MobileFrame } from './components/MobileFrame'
import { StartScreen } from './screens/StartScreen'
import { NowScreen } from './screens/NowScreen'
import { BedsScreen } from './screens/BedsScreen'
import { CareContextScreen } from './screens/CareContextScreen'
import { CaptureScreen } from './screens/CaptureScreen'
import { DetectedScreen } from './screens/DetectedScreen'
import { ConfirmedScreen } from './screens/ConfirmedScreen'
import { WorkScreen } from './screens/WorkScreen'
import { TeamScreen } from './screens/TeamScreen'
import { HandoverScreen } from './screens/HandoverScreen'
import { WorkflowAgentScreen } from './screens/WorkflowAgentScreen'
import { ClinicalKnowledgeScreen } from './screens/ClinicalKnowledgeScreen'
import { JoinTeamScreen } from './screens/JoinTeamScreen'
import { TeamHomeScreen } from './screens/TeamHomeScreen'
import { TeamWorkScreen } from './screens/TeamWorkScreen'
import { TeamContextsScreen } from './screens/TeamContextsScreen'
import { TeamContextDetailScreen } from './screens/TeamContextDetailScreen'
import { TeamPeopleScreen } from './screens/TeamPeopleScreen'
import { TeamMeetingsScreen } from './screens/TeamMeetingsScreen'
import { WorkDetailScreen } from './screens/WorkDetailScreen'

function DemoRouter() {
  const { screen, reset, persona, selectPersona } = useDemo()

  let content
  switch (screen.name) {
    case 'start':
      content = <StartScreen />
      break
    case 'now':
      content = <NowScreen />
      break
    case 'beds':
      content = <BedsScreen />
      break
    case 'careContext':
      content = <CareContextScreen bedId={screen.bedId} />
      break
    case 'capture':
      content = <CaptureScreen bedId={screen.bedId} workId={screen.workId} prefill={screen.prefill} />
      break
    case 'detected':
      content = <DetectedScreen bedId={screen.bedId} workId={screen.workId} input={screen.input} intent={screen.intent} />
      break
    case 'confirmed':
      content = <ConfirmedScreen bedId={screen.bedId} workId={screen.workId} />
      break
    case 'workDetail':
      content = <WorkDetailScreen workId={screen.workId} />
      break
    case 'work':
      content = <WorkScreen />
      break
    case 'team':
      content = <TeamScreen />
      break
    case 'handover':
      content = <HandoverScreen />
      break
    case 'workflowAgent':
      content = <WorkflowAgentScreen teamMode={screen.teamMode} />
      break
    case 'clinicalKnowledge':
      content = <ClinicalKnowledgeScreen />
      break
    case 'joinTeam':
      content = <JoinTeamScreen />
      break
    case 'teamHome':
      content = <TeamHomeScreen />
      break
    case 'teamWork':
      content = <TeamWorkScreen />
      break
    case 'teamContexts':
      content = <TeamContextsScreen />
      break
    case 'teamContextDetail':
      content = <TeamContextDetailScreen contextId={screen.contextId} />
      break
    case 'teamPeople':
      content = <TeamPeopleScreen />
      break
    case 'teamMeetings':
      content = <TeamMeetingsScreen />
      break
  }

  const showSwitchRole = screen.name !== 'start' && screen.name !== 'joinTeam'
  const otherPersona = persona === 'edith' ? 'ama' : 'edith'

  return (
    <MobileFrame
      onReset={reset}
      onSwitchRole={showSwitchRole ? () => selectPersona(otherPersona) : undefined}
      switchRoleLabel={otherPersona === 'ama' ? 'Switch to Ama (Nurse In-Charge)' : 'Switch to Edith (Staff Nurse)'}
    >
      {content}
    </MobileFrame>
  )
}

function App() {
  return (
    <DemoProvider>
      <DemoRouter />
    </DemoProvider>
  )
}

export default App
