import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, apiMessage, downloadCsv } from "../api/client";
import { Badge, ErrorPanel, LoadingBlock, PageHeader, StatCard } from "../components/Ui";
import { useToast } from "../components/Toast";
import { money } from "../utils/format";

export default function ReportsPage() {
  const { show } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [car, setCar] = useState(searchParams.get("car") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = () => ({ car: car || undefined, from: from || undefined, to: to || undefined });
  const load = async () => {
    setLoading(true); setError("");
    try {
      const [s, c] = await Promise.all([api.get("/reports/summary", { params: filters() }), api.get("/cars", { params: { includeArchived: "true" } })]);
      setSummary(s.data); setCars(c.data);
      const next = {}; if (car) next.car = car; if (from) next.from = from; if (to) next.to = to; setSearchParams(next, { replace: true });
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 150); return () => clearTimeout(t); }, [car, from, to]);

  const exportKind = async (kind) => {
    try { await downloadCsv(kind, filters()); show(`${kind} CSV downloaded`, "success"); } catch (err) { show(apiMessage(err), "danger"); }
  };

  if (loading && !summary) return <LoadingBlock label="Building report…" />;
  if (error && !summary) return <ErrorPanel message={error} onRetry={load} />;
  const totals = summary?.totals || {};
  const maxMonth = Math.max(1, ...(summary?.monthly || []).flatMap((m) => [Number(m.earnings || 0) + Number(m.legacyIncome || 0), Number(m.expenses || 0)]));

  return <div>
    <PageHeader eyebrow="Financial intelligence" title="Reports" description="Recorded surplus, partner positions, monthly movement and historical-data warnings." actions={<div className="button-row"><button className="btn btn-outline" onClick={() => exportKind("earnings")}>Earnings CSV</button><button className="btn btn-outline" onClick={() => exportKind("expenses")}>Expenses CSV</button></div>} />
    <div className="filter-bar"><select value={car} onChange={(e) => setCar(e.target.value)}><option value="">All cars</option>{cars.map((c) => <option key={c._id} value={c._id}>{c.carName} · {c.carNumber}{c.archived ? " (Archived)" : ""}</option>)}</select><label className="date-filter"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="date-filter"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label><button className="btn btn-ghost btn-sm" onClick={() => { setCar(""); setFrom(""); setTo(""); }}>Clear</button></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="stats-grid four"><StatCard label="Earnings" value={money(totals.earnings)} icon="↗" tone="green" /><StatCard label="Legacy income" value={money(totals.legacyIncome)} icon="+" tone="violet" helper="Stored historically in Expense" /><StatCard label="Expenses" value={money(totals.expenses)} icon="↘" tone="red" /><StatCard label="Recorded surplus" value={money(totals.recordedSurplus)} icon="◎" tone={Number(totals.recordedSurplus) >= 0 ? "blue" : "red"} helper="Not audited profit or cash balance" /></div>

    {(summary?.warnings || []).length > 0 && <section className="panel warning-panel"><div className="panel-heading"><div><h2>Data review notices</h2><p>The report preserves historical records rather than silently rewriting them.</p></div><Badge tone="warning">{summary.warnings.length}</Badge></div><ul className="warning-list">{summary.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></section>}

    <div className="dashboard-grid section-gap">
      <section className="panel span-2"><div className="panel-heading"><div><h2>Monthly movement</h2><p>Earnings (including legacy income) versus expenses</p></div></div><div className="month-chart">{(summary?.monthly || []).map((m) => { const income = Number(m.earnings || 0) + Number(m.legacyIncome || 0), expense = Number(m.expenses || 0); return <div className="month-row" key={m.month}><div className="month-name">{m.month}</div><div className="bar-area"><div className="bar-line"><span>Income</span><div className="bar-track"><i className="bar income" style={{ width: `${Math.max(1, (income / maxMonth) * 100)}%` }} /></div><strong>{money(income)}</strong></div><div className="bar-line"><span>Expense</span><div className="bar-track"><i className="bar expense" style={{ width: `${Math.max(1, (expense / maxMonth) * 100)}%` }} /></div><strong>{money(expense)}</strong></div></div></div>; })}{!(summary?.monthly || []).length && <div className="muted">No monthly data in this period.</div>}</div></section>
      <section className="panel"><div className="panel-heading"><div><h2>Allocation health</h2><p>Amounts not matching partner allocations</p></div></div><div className="metric-stack"><div><span>Unallocated earnings</span><strong>{money(totals.unallocatedEarnings)}</strong></div><div><span>Unallocated expenses</span><strong>{money(totals.unallocatedExpenses)}</strong></div><div><span>Allocation differences</span><strong>{summary?.allocationDifferences?.length || 0}</strong></div><div><span>Orphaned records</span><strong>{summary?.orphanedRecords?.length || 0}</strong></div><div><span>Legacy amount records</span><strong>{summary?.legacyAmountRecords || 0}</strong></div></div></section>
    </div>

    <section className="panel section-gap"><div className="panel-heading"><div><h2>Partner position</h2><p>Allocated, settled and outstanding amounts from recorded transactions.</p></div></div><div className="transaction-table-wrap"><table className="data-table report-table"><thead><tr><th>Partner</th><th className="right">Earnings allocated</th><th className="right">Received</th><th className="right">Outstanding</th><th className="right">Expenses allocated</th><th className="right">Contributed</th><th className="right">Outstanding</th></tr></thead><tbody>{(summary?.partners || []).map((p) => <tr key={p.partnerId}><td><strong>{p.name}</strong></td><td className="right">{money(p.earningsAllocated)}</td><td className="right">{money(p.earningsReceived)}</td><td className="right">{money(p.earningsOutstanding)}</td><td className="right">{money(p.expensesAllocated)}</td><td className="right">{money(p.expensesContributed)}</td><td className="right">{money(p.expensesOutstanding)}</td></tr>)}{!(summary?.partners || []).length && <tr><td colSpan="7" className="center muted">No partner allocation data.</td></tr>}</tbody></table></div></section>

    {(summary?.allocationDifferences || []).length > 0 && <section className="panel section-gap"><div className="panel-heading"><div><h2>Records needing allocation review</h2><p>These differences are preserved from stored data.</p></div></div><div className="review-grid">{summary.allocationDifferences.slice(0, 50).map((r) => <div className="review-item" key={`${r.entity}-${r.id}`}><span><Badge tone="warning">{r.entity}</Badge><code>{r.id}</code></span><strong>{money(r.difference)}</strong></div>)}</div></section>}

    <div className="report-note">{summary?.note}</div>
  </div>;
}
