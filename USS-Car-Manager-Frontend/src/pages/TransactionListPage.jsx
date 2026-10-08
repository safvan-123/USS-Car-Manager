import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, apiMessage, downloadCsv } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ConfirmDialog, EmptyState, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { useToast } from "../components/Toast";
import { sumMoney, subtractMoney, expenseTotal } from "../utils/finance";
import { carLabel, displayDate, money, paidAmountOf } from "../utils/format";

export default function TransactionListPage({ kind }) {
  const earning = kind === "earning";
  const base = earning ? "earnings" : "expenses";
  const { canWrite, isAdmin } = useAuth();
  const { show } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [car, setCar] = useState(searchParams.get("car") || "");
  const [from, setFrom] = useState(searchParams.get("from") || "");
  const [to, setTo] = useState(searchParams.get("to") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);
  const limit = 25;
  const requestId = useRef(0);
  const invalidate = useCallback(() => { requestId.current++; }, []);

  const currentParams = useCallback(() => ({
    car: car || undefined,
    search: search || undefined,
    from: from || undefined,
    to: to || undefined,
    ...(!earning && type ? { type } : {}),
  }), [car, search, from, to, earning, type]);

  const load = useCallback(async () => {
    const request = ++requestId.current;
    setLoading(true); setError("");
    try {
      const [records, carRes] = await Promise.all([
        api.get(`/${base}`, { params: { ...currentParams(), page, limit } }),
        api.get("/cars", { params: { includeArchived: "true" } }),
      ]);
      if (request !== requestId.current) return;
      setRows(records.data);
      setTotal(Number(records.headers["x-total-count"] || records.data.length));
      setCars(carRes.data);
      const next = {};
      if (car) next.car = car; if (search) next.search = search; if (from) next.from = from; if (to) next.to = to; if (!earning && type) next.type = type; if (page > 1) next.page = String(page);
      setSearchParams(next, { replace: true });
    } catch (err) { if (request === requestId.current) setError(apiMessage(err)); }
    finally { if (request === requestId.current) setLoading(false); }
  }, [base, currentParams, page, car, search, from, to, earning, type, setSearchParams]);

  useEffect(() => { const t = setTimeout(load, 220); return () => { clearTimeout(t); invalidate(); }; }, [load, invalidate]);
  useEffect(() => { setPage(1); }, [search, car, from, to, type]);

  const remove = async () => {
    setBusy(true);
    try { await api.delete(`/${base}/${confirm._id}`); show(`${earning ? "Earning" : "Expense"} deleted. Audit history retained.`, "success"); setConfirm(null); load(); }
    catch (err) { show(apiMessage(err), "danger"); }
    finally { setBusy(false); }
  };

  const exportFile = async () => {
    try { await downloadCsv(base, currentParams()); show(`${earning ? "Earnings" : "Expenses"} CSV downloaded`, "success"); }
    catch (err) { show(apiMessage(err, "Could not export CSV"), "danger"); }
  };

  const pages = Math.max(1, Math.ceil(total / limit));
  const visibleTotal = sumMoney(rows.map(r => earning ? r.amount : expenseTotal(r)));

  return <div>
    <PageHeader eyebrow="Finance" title={earning ? "Earnings" : "Expenses"} description={earning ? "Income records, partner distributions and settlement progress." : "Costs, partner contributions and historical expense records."}
      actions={<div className="button-row"><button className="btn btn-outline" onClick={exportFile}>Export CSV</button>{canWrite && <Link className="btn btn-primary" to={`/${base}/new${car ? `?car=${car}` : ""}`}>+ Add {earning ? "earning" : "expense"}</Link>}</div>} />

    <div className="filter-bar wide">
      <label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${earning ? "source" : "category"} or notes…`} /></label>
      <select value={car} onChange={(e) => setCar(e.target.value)}><option value="">All cars</option>{cars.map((c) => <option key={c._id} value={c._id}>{c.carName} · {c.carNumber}{c.archived ? " (Archived)" : ""}</option>)}</select>
      {!earning && <select value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option><option value="expense">Expense</option><option value="income">Legacy income</option></select>}
      <label className="date-filter"><span>From</span><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
      <label className="date-filter"><span>To</span><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
    </div>

    <div className="button-row filter-reset"><button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setCar(""); setFrom(""); setTo(""); setType(""); setPage(1); }}>Clear filters</button><button className="btn btn-outline btn-sm" disabled={loading} onClick={load}>↻ Refresh</button><Link className="text-link" to={`/reports?${new URLSearchParams({ ...(car ? {car} : {}), ...(from ? {from} : {}), ...(to ? {to} : {}) })}`}>Date / vehicle totals →</Link></div>
    <div className="list-summary"><span><strong>{total}</strong> records</span><span>{!earning && !type ? "Page amounts (includes legacy income)" : "This page total"} <strong>{money(visibleTotal)}</strong></span></div>

    {loading ? <LoadingBlock label={`Loading ${base}…`} /> : error ? <ErrorPanel message={error} onRetry={load} /> : rows.length ? <>
      <div className="transaction-list">
        {rows.map((row) => <TransactionCard key={row._id} row={row} earning={earning} canWrite={canWrite} isAdmin={isAdmin} onDelete={() => setConfirm(row)} />)}
      </div>
      <div className="pagination"><button className="btn btn-outline btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>← Previous</button><span>Page {page} of {pages}</span><button className="btn btn-outline btn-sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next →</button></div>
    </> : <EmptyState title={`No ${base} found`} description="Try changing the filters or add a new record." action={canWrite ? <Link className="btn btn-primary" to={`/${base}/new`}>Add {earning ? "earning" : "expense"}</Link> : null} />}

    <ConfirmDialog open={Boolean(confirm)} title={`Delete this ${earning ? "earning" : "expense"}?`} message="A transaction with recorded partner payments cannot be deleted. If deletion succeeds, the audit record is still retained." confirmText="Delete record" onConfirm={remove} onCancel={() => setConfirm(null)} busy={busy} />
  </div>;
}

function TransactionCard({ row, earning, canWrite, isAdmin, onDelete }) {
  const total = Number(earning ? row.amount : expenseTotal(row));
  const allocated = sumMoney((row.partners || []).map(p => p.amount));
  const settled = sumMoney((row.partners || []).map(paidAmountOf));
  const description = earning ? row.source : row.category;
  const legacyIncome = !earning && row.type === "income";
  const statusTone = row.allocationStatus === "balanced" ? "success" : row.allocationStatus === "unallocated" ? "neutral" : "warning";
  const archivedCar = Boolean(row.car?.archived);
  const canEdit = canWrite && !row.missingCar && !archivedCar;
  const canAdminReview = isAdmin && !row.missingCar && archivedCar;
  return <article className={`transaction-card ${row.missingCar || row.allocationStatus === "needs-review" ? "needs-review" : ""}`}>
    <div className="transaction-card-main">
      <div className={`money-mark ${earning || legacyIncome ? "positive" : "negative"}`}>{earning || legacyIncome ? "↗" : "↘"}</div>
      <div className="transaction-primary"><div className="transaction-title-row"><h3>{description}</h3><Badge tone={legacyIncome ? "violet" : statusTone}>{legacyIncome ? "Legacy income" : row.allocationStatus === "needs-review" ? "Allocation review" : row.allocationStatus}</Badge>{row.usesLegacyAmount && <Badge>Legacy amount</Badge>}</div><div className="transaction-meta"><span>{displayDate(row.date)}</span><span>•</span><span>{carLabel(row.car)}</span>{row.missingCar && <><span>•</span><Badge tone="danger">Missing car</Badge></>}</div>{row.notes && <p>{row.notes}</p>}</div>
      <div className={`transaction-amount ${earning || legacyIncome ? "positive" : "negative"}`}>{earning || legacyIncome ? "+" : "−"}{money(total)}</div>
    </div>
    <div className="transaction-settlement">
      <div><span>Allocated</span><strong>{money(allocated)}</strong></div><div><span>{earning ? "Distributed" : "Contributed"}</span><strong>{money(settled)}</strong></div><div><span>Outstanding</span><strong>{money(Math.max(0, subtractMoney(allocated, settled)))}</strong></div>{Number(row.allocationDifference || 0) !== 0 && <div className="review-metric"><span>Allocation difference</span><strong>{money(row.allocationDifference)}</strong></div>}
    </div>
    {(row.dataWarnings || []).length > 0 && <div className="inline-warning">{row.dataWarnings.join(" ")}</div>}
    <div className="card-actions">
      {canEdit && <Link className="btn btn-secondary btn-sm" to={`/${earning ? "earnings" : "expenses"}/${row._id}/edit`}>Edit & settle</Link>}
      {canAdminReview && <Link className="btn btn-outline btn-sm" to={`/${earning ? "earnings" : "expenses"}/${row._id}/edit`}>Review / correct payment</Link>}
      {!canEdit && row.missingCar && <span className="muted tiny">Historical missing-car record is review-only.</span>}
      {!canEdit && archivedCar && !isAdmin && <span className="muted tiny">Restore the archived car before editing this record.</span>}
      {isAdmin && <Link className="btn btn-ghost btn-sm" to={`/audit?entity=${earning ? "Earning" : "Expense"}&entityId=${row._id}`}>History</Link>}
      {isAdmin && !row.missingCar && <button className="btn btn-danger-soft btn-sm" onClick={onDelete}>Delete</button>}
    </div>
  </article>;
}
