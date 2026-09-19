import { useApp } from '../state/AppContext'
import { WorkCard } from '../components/WorkCard'
import {
  nextItems,
  nowItems,
  nowSummary,
  overdueItems,
  recentChanges,
  waitingItems,
} from '../state/selectors'
import { PATIENTS } from '../state/initialData'

export function HomeScreen() {
  const { state, push } = useApp()
  const summary = nowSummary(state)
  const now = nowItems(state)
  const next = nextItems(state)
  const waiting = waitingItems(state)
  const overdue = overdueItems(state)
  const changes = recentChanges(state, 4)

  return (
    <>
      <div className="home-header">
        <div className="home-brand">ENORE</div>
        <div className="home-shift">Morning Shift · 07:00–15:00</div>
        <div className="home-ward">Surgical Ward</div>
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
        {now.length === 0 && <p className="home-empty">Nothing urgent right now.</p>}
        {now.map((item) => (
          <WorkCard key={item.id} item={item} onClick={() => push({ name: 'patientDetail', patientId: item.patientId })} />
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">NEXT</div>
        {next.length === 0 && <p className="home-empty">Nothing upcoming.</p>}
        {next.map((item) => (
          <WorkCard key={item.id} item={item} onClick={() => push({ name: 'patientDetail', patientId: item.patientId })} />
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">WAITING</div>
        {waiting.length === 0 && <p className="home-empty">Nothing waiting.</p>}
        {waiting.map((item) => (
          <WorkCard key={item.id} item={item} onClick={() => push({ name: 'patientDetail', patientId: item.patientId })} />
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">OVERDUE</div>
        {overdue.length === 0 && <p className="home-empty">Nothing overdue.</p>}
        {overdue.map((item) => (
          <WorkCard key={item.id} item={item} onClick={() => push({ name: 'patientDetail', patientId: item.patientId })} />
        ))}
      </section>

      <section className="home-section">
        <div className="home-section-title">CHANGES</div>
        <ul className="changes-list">
          {changes.map((e) => (
            <li key={e.id} className="changes-item">
              <span className="changes-time">{e.time}</span>
              <span className="changes-label">
                {PATIENTS[e.patientId].id} {e.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
