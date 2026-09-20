import { useApp } from '../state/AppContext'
import { WorkCard } from '../components/WorkCard'
import {
  changedSinceHandover,
  interruptedItems,
  needsMeItems,
  nowItems,
  nowSummary,
  openLoopsRollup,
} from '../state/selectors'
import { PATIENTS } from '../state/initialData'

export function HomeScreen() {
  const { state, push } = useApp()
  const summary = nowSummary(state)
  const now = nowItems(state)
  const resume = interruptedItems(state)
  const changed = changedSinceHandover(state)
  const needsMe = needsMeItems(state)
  const openLoops = openLoopsRollup(state)

  return (
    <>
      <div className="home-header">
        <div className="home-brand">ENORE</div>
        <div className="home-shift">Morning Shift · 07:00–15:00</div>
        <div className="home-ward">Surgical Ward · My Space</div>
      </div>

      <div className="now-glance">
        <div className="now-glance-item now-glance-total">
          <span className="now-glance-value">{summary.patientCount}</span>
          <span className="now-glance-label">patients</span>
        </div>
        <div className="now-glance-item now-glance-attention">
          <span className="now-glance-value">{summary.needAttention}</span>
          <span className="now-glance-label">need attention</span>
        </div>
        <div className="now-glance-item now-glance-waiting">
          <span className="now-glance-value">{summary.waiting}</span>
          <span className="now-glance-label">waiting</span>
        </div>
        <div className="now-glance-item now-glance-overdue">
          <span className="now-glance-value">{summary.overdue}</span>
          <span className="now-glance-label">overdue</span>
        </div>
        <div className="now-glance-item">
          <span className="now-glance-value">{summary.unassigned}</span>
          <span className="now-glance-label">unassigned</span>
        </div>
      </div>

      <section className="home-section">
        <div className="home-section-title">NOW</div>
        {now.length === 0 && <p className="home-empty">Nothing needs you right now.</p>}
        {now.map((item) => (
          <WorkCard key={item.id} item={item} />
        ))}
      </section>

      {resume.length > 0 && (
        <section className="home-section">
          <div className="home-section-title">RESUME</div>
          {resume.map((item) => (
            <WorkCard key={item.id} item={item} />
          ))}
        </section>
      )}

      <section className="home-section">
        <div className="home-section-title">CHANGED SINCE HANDOVER</div>
        {changed.length === 0 && <p className="home-empty">Nothing has changed yet.</p>}
        {changed.map((group) => (
          <button
            key={group.patientId}
            className="changed-group"
            type="button"
            onClick={() => push({ name: 'patientDetail', patientId: group.patientId })}
          >
            <div className="changed-group-title">
              {PATIENTS[group.patientId].id} · {PATIENTS[group.patientId].bed}
            </div>
            {group.lines.map((line, i) => (
              <div className="changed-group-line" key={i}>
                {line}
              </div>
            ))}
          </button>
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">NEEDS ME</div>
        {needsMe.length === 0 && <p className="home-empty">Nothing waiting on you to start.</p>}
        {needsMe.map((item) => (
          <WorkCard key={item.id} item={item} />
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">OPEN LOOPS</div>
        {openLoops.length === 0 && <p className="home-empty">Everything is closed.</p>}
        {openLoops.map((group) => (
          <button
            key={group.patientId}
            className="open-loop-row"
            type="button"
            onClick={() => push({ name: 'patientDetail', patientId: group.patientId })}
          >
            <span className="open-loop-patient">
              {PATIENTS[group.patientId].id} · {PATIENTS[group.patientId].bed}
            </span>
            <span className="open-loop-lines">{group.lines.join(' · ')}</span>
          </button>
        ))}
      </section>
    </>
  )
}
