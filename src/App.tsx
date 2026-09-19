import './styles/components.css'
import './styles/screens.css'
import { AppProvider, useApp } from './state/AppContext'
import { MobileFrame } from './components/MobileFrame'
import { AppShell } from './components/AppShell'
import { BottomNav, type Tab } from './components/BottomNav'
import { AssistSheet } from './components/AssistSheet'
import { PATIENTS } from './state/initialData'
import { StartScreen } from './screens/StartScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PatientsScreen } from './screens/PatientsScreen'
import { PatientDetailScreen } from './screens/PatientDetailScreen'
import { WorkScreen } from './screens/WorkScreen'
import { PaperScreen } from './screens/PaperScreen'
import { HandoverScreen } from './screens/HandoverScreen'
import { HandoverCompleteScreen } from './screens/HandoverCompleteScreen'
import { CaptureScreen } from './screens/CaptureScreen'

const TAB_ROOTS: Record<string, Tab> = {
  home: 'home',
  patients: 'patients',
  work: 'work',
  paper: 'paper',
  handover: 'handover',
}

function Router() {
  const { state, goTab, push, back, openAssist, reset } = useApp()
  const { screen } = state

  let content
  let title: string | undefined
  let onBack: (() => void) | undefined
  let showCapture = true
  let showAssist = true

  switch (screen.name) {
    case 'start':
      content = <StartScreen />
      showCapture = false
      showAssist = false
      break
    case 'home':
      content = <HomeScreen />
      title = ''
      break
    case 'patients':
      content = <PatientsScreen />
      title = 'Patients'
      break
    case 'patientDetail': {
      const patient = PATIENTS[screen.patientId]
      content = <PatientDetailScreen patientId={screen.patientId} />
      title = patient.bed
      onBack = back
      break
    }
    case 'work':
      content = <WorkScreen />
      title = 'Work'
      break
    case 'paper':
      content = <PaperScreen />
      title = 'Paper'
      break
    case 'handover':
      content = <HandoverScreen />
      title = 'Handover'
      break
    case 'handoverComplete':
      content = <HandoverCompleteScreen />
      showCapture = false
      showAssist = false
      break
    case 'capture':
      content = <CaptureScreen patientId={screen.patientId} prefillText={screen.prefillText} />
      title = 'Capture'
      onBack = back
      showCapture = false
      break
  }

  const tab = TAB_ROOTS[screen.name]
  const footer = tab ? <BottomNav active={tab} onSelect={goTab} /> : undefined
  const capturePatientId = screen.name === 'patientDetail' ? screen.patientId : undefined

  return (
    <MobileFrame onReset={reset}>
      <AppShell
        title={title}
        onBack={onBack}
        onCapture={showCapture ? () => push({ name: 'capture', patientId: capturePatientId }) : undefined}
        onOpenAgent={showAssist ? openAssist : undefined}
        footer={footer}
      >
        {content}
      </AppShell>
      <AssistSheet />
    </MobileFrame>
  )
}

function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}

export default App
