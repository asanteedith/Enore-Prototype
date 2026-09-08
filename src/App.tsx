import './styles/components.css'
import './styles/screens.css'
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

function DemoRouter() {
  const { screen, reset } = useDemo()

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
      content = <WorkflowAgentScreen />
      break
    case 'clinicalKnowledge':
      content = <ClinicalKnowledgeScreen />
      break
  }

  return <MobileFrame onReset={reset}>{content}</MobileFrame>
}

function App() {
  return (
    <DemoProvider>
      <DemoRouter />
    </DemoProvider>
  )
}

export default App
