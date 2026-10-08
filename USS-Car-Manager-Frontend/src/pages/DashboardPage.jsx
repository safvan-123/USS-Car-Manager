import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Badge, ErrorPanel, LoadingBlock, PageHeader, StatCard } from '../components/Ui';
import MonthlyChart from '../components/MonthlyChart';
import { carLabel, displayDate, localToday, money, roundedMoney } from '../utils/format';
import { expenseTotal, sumMoney, validateSummary } from '../utils/finance';

export default function DashboardPage() {
  const { user, canWrite } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState('');
  const [period, setPeriod] = useState('all');
  const [rounded, setRounded] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const today = localToday();
  const from = period === 'month' ? `${today.slice(0,7)}-01` : period === 'year' ? `${today.slice(0,4)}-01-01` : undefined;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const params = { car: car || undefined, from, to: from ? today : undefined };
    const opts = { signal: controller.signal };
    Promise.all([
      api.get('/cars', { ...opts, params: { includeArchived: 'true' } }),
      api.get('/reports/summary', { ...opts, params }),
      api.get('/reports/reminders', { ...opts, params: { days: 30 } }).then(r => ({ rows: r.data })).catch(e => { if (controller.signal.aborted) throw e; return { rows: [], error: apiMessage(e) }; }),
      api.get('/earnings', { ...opts, params: { ...params, page: 1, limit: 6 } }),
      api.get('/expenses', { ...opts, params: { ...params, page: 1, limit: 6 } }),
    ]).then(([cars, summary, reminders, earnings, expenses]) => {
      if (!controller.signal.aborted) setData({ cars: cars.data, summary: validateSummary(summary.data), reminders: reminders.rows.filter(r => !car || String(r.carId) === car), reminderError: reminders.error, earnings: earnings.data, expenses: expenses.data, updated: new Date() });
    }).catch(e => { if (!controller.signal.aborted) setError(apiMessage(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [car, from, today, refresh]);
  const recent = useMemo(() => !data ? [] : [
    ...data.earnings.map(r => ({ ...r, kind: 'earnings', positive: true, total: r.amount, label: r.source })),
    ...data.expenses.map(r => ({ ...r, kind: 'expenses', positive: r.type === 'income', total: expenseTotal(r), label: r.category })),
  ].sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0,6), [data]);
  const retry = () => setRefresh(v => v + 1);
  const fmt = rounded ? roundedMoney : money;
  const totals = data?.summary.totals;
  const active = (data?.cars || []).filter(c => !c.archived && (!car || c._id === car));
  const income = totals ? sumMoney([totals.earnings, totals.legacyIncome]) : 0;
  const partners = data?.summary.partners || [];
  const payout = sumMoney(partners.map(p => sumMoney([p.earningsOutstanding, p.legacyIncomeOutstanding])));
  const contribution = sumMoney(partners.map(p => p.expensesOutstanding));
  return <div>
    <PageHeader eyebrow="Workspace overview" title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`} description="A clear view of your fleet, finances and the work ahead." actions={<div className="button-row"><button className="btn btn-outline" disabled={loading} onClick={retry}>↻ Refresh</button>{canWrite && <Link className="btn btn-primary" to="/quick-add">+ New record</Link>}</div>} />
    <div className="overview-toolbar"><div className="segmented" aria-label="Dashboard period">{[['all','All time'],['month','This month'],['year','This year']].map(([id,label]) => <button key={id} aria-pressed={period === id} className={period === id ? 'selected' : ''} onClick={() => setPeriod(id)}>{label}</button>)}</div><select aria-label="Dashboard car" value={car} onChange={e => setCar(e.target.value)}><option value="">All vehicles</option>{(data?.cars || []).map(c => <option value={c._id} key={c._id}>{carLabel(c)}{c.archived ? ' (Archived)' : ''}</option>)}</select><label className="round-toggle"><input type="checkbox" checked={rounded} onChange={e => setRounded(e.target.checked)} />Round overview values</label></div>
    {loading ? <LoadingBlock label="Reading your API records…" /> : error ? <ErrorPanel message={error} onRetry={retry} /> : data && <>
      <div className="sync-line"><span><i />Updated {data.updated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {period === 'all' ? 'All recorded dates' : `${displayDate(from)} – ${displayDate(today)}`}</span><span>{rounded ? '≈ Rounded display only; records retain exact paise.' : 'Exact amounts · INR'}</span></div>
      <div className="stats-grid"><StatCard icon="↗" label="Total income" value={fmt(income)} helper={totals.legacyIncome ? `${money(totals.earnings)} earnings + ${money(totals.legacyIncome)} legacy income` : 'Recorded earnings for this period'} tone="green" /><StatCard icon="↘" label="Total expenses" value={fmt(totals.expenses)} helper="Excludes legacy income entries" tone="red" /><StatCard icon="◎" label="Recorded surplus" value={fmt(totals.recordedSurplus)} helper="Total income minus expenses" tone="blue" /><StatCard icon="▣" label="Active vehicles" value={active.length} helper={`${active.filter(c=>c.status==='Rented').length} rented · ${active.filter(c=>c.status==='Available').length} available`} tone="violet" /></div>
      <div className="dashboard-grid"><section className="panel span-2"><div className="panel-heading"><div><div className="eyebrow">Money movement</div><h2>Income & expenses</h2><p>Last six recorded months in your selected period</p></div><Link className="text-link" to={`/reports?${new URLSearchParams({ ...(car ? {car} : {}), ...(from ? {from,to:today} : {}) })}`}>Full report ↗</Link></div><MonthlyChart monthly={data.summary.monthly} /></section>
        <section className="panel position-panel"><div className="eyebrow">Partner settlements</div><h2>Still to settle</h2><div className="position-amount"><span>Income to distribute</span><strong>{fmt(payout)}</strong></div><div className="position-amount"><span>Expense contributions due</span><strong>{fmt(contribution)}</strong></div><p>Based on allocated shares and recorded partner payments for this period.</p><Link className="btn btn-outline btn-block" to={`/reports${car ? `?car=${car}` : ''}`}>Review partner positions →</Link></section>
        <section className="panel span-2"><div className="panel-heading"><div><h2>Recent transactions</h2><p>Latest six entries for the selected filters</p></div><Link className="text-link" to="/earnings">View earnings ↗</Link></div><div className="transaction-table-wrap"><table className="data-table"><thead><tr><th>Transaction</th><th>Vehicle</th><th>Date</th><th className="right">Amount</th><th /></tr></thead><tbody>{recent.map(r => <tr key={`${r.kind}-${r._id}`}><td><strong>{r.label}</strong><div className="tiny muted">{r.positive ? 'Income' : 'Expense'} · {r.allocationStatus === 'balanced' ? 'Allocated' : r.allocationStatus === 'unallocated' ? 'No partner allocation' : 'Review allocation'}</div></td><td>{carLabel(r.car)}</td><td>{displayDate(r.date)}</td><td className={`right money-cell ${r.positive ? 'earning' : 'expense'}`}>{r.positive ? '+' : '−'}{money(r.total)}</td><td>{canWrite && !r.missingCar && <Link className="text-link" to={`/${r.kind}/${r._id}/edit`}>Open</Link>}</td></tr>)}{!recent.length && <tr><td colSpan="5" className="center muted">No records in this period.</td></tr>}</tbody></table></div></section>
        <section className="panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Vehicle reminders · next 30 days</p></div><Badge tone={data.reminders.some(r=>r.overdue) ? 'danger' : 'neutral'}>{data.reminders.length}</Badge></div>{data.reminderError ? <div className="alert alert-warning">Reminders could not load. {data.reminderError}</div> : data.reminders.length ? data.reminders.slice(0,4).map((r,i) => <Link className="list-row" to={`/cars/${r.carId}`} key={`${r.carId}-${i}`}><span className={`status-dot ${r.overdue ? 'danger' : 'warning'}`} /><span className="row-main"><strong>{({nextServiceDate:'Service due',insuranceExpiry:'Insurance expiry',pollutionExpiry:'Pollution certificate',nextServiceKm:'Service mileage'})[r.type]}</strong><small>{r.carName} · {r.dueDate ? displayDate(r.dueDate) : `${r.dueKm} km`}</small></span></Link>) : <div className="success-empty">✓ Your fleet is up to date.</div>}<Link className="text-link section-link" to="/maintenance">All reminders →</Link>{data.summary.allocationDifferences?.length > 0 && <Link className="warning-box section-link" to="/reports">{data.summary.allocationDifferences.length} allocation records need review →</Link>}</section>
        <section className="panel span-2"><div className="panel-heading"><div><h2>Your fleet</h2><p>Current status, independent of financial date filters</p></div><Link to="/cars" className="text-link">Manage vehicles ↗</Link></div><div className="fleet-mini-grid">{active.slice(0,6).map(c => <Link to={`/cars/${c._id}`} className="car-mini" key={c._id}><div className="car-thumb">{c.image ? <img src={c.image} alt="" /> : <span>USS</span>}</div><div className="car-mini-info"><strong>{c.carName}</strong><small>{c.carNumber}</small></div><Badge tone={c.status==='Available' ? 'success' : c.status==='Rented' ? 'blue' : 'warning'}>{c.status}</Badge></Link>)}{!active.length && <p className="muted">No active vehicles in this selection.</p>}</div></section>
        <section className="panel quick-panel"><div className="eyebrow">Keep things moving</div><h2>One place for every record.</h2><p>Add income, record costs and stay on top of your partner settlements.</p>{canWrite && <div className="button-row"><Link to="/earnings/new" className="btn btn-primary">+ Earning</Link><Link to="/expenses/new" className="btn btn-outline">+ Expense</Link></div>}</section></div>
      {(data.summary.warnings || []).length > 0 && <details className="report-note"><summary>Data notices ({data.summary.warnings.length})</summary><ul>{data.summary.warnings.map(w=><li key={w}>{w}</li>)}</ul></details>}<p className="report-note">Surplus is recorded income minus expenses, not a bank balance. All-car totals include retained history for archived or missing cars.</p>
    </>}
  </div>;
}
