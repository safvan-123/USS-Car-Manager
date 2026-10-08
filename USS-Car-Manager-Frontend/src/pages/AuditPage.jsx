import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, apiMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { Badge, EmptyState, ErrorPanel, LoadingBlock, PageHeader } from '../components/Ui';
import { displayDateTime, money, paidAmountOf, partnerNameOf } from '../utils/format';
const labels = { carName:'Vehicle name', carNumber:'Registration', amount:'Amount', totalAmount:'Total amount', source:'Income source', category:'Category', date:'Date', status:'Status', notes:'Notes', sharePercentage:'Ownership share', partners:'Partner allocations', archived:'Archived', paidAmount:'Paid amount' };
const moneyKeys = ['amount','totalAmount','paidAmount'];
function valueLabel(key, value) {
  if (value == null) return '—';
  if (moneyKeys.includes(key)) return money(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'partners' && Array.isArray(value)) return value.length ? value.map(r => `${partnerNameOf(r)} · allocated ${money(r.amount)} · paid ${money(paidAmountOf(r))}`).join('\n') : 'No allocations';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
export default function AuditPage() {
  const { isAdmin } = useAuth();
  const [params] = useSearchParams();
  const [entity, setEntity] = useState(params.get('entity') || '');
  const [entityId, setEntityId] = useState(params.get('entityId') || '');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const limit = 25;
  const invalidId = entityId && !/^[a-f\d]{24}$/i.test(entityId.trim());
  useEffect(() => {
    if (!isAdmin || invalidId) { setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError('');
    const timer = setTimeout(() => api.get('/reports/audit', { signal: controller.signal, params: {entity:entity || undefined,entityId:entityId.trim() || undefined,page,limit} })
      .then(({data}) => { if (!controller.signal.aborted) { if (!Array.isArray(data)) throw new Error('The audit endpoint returned an invalid response. Check that the supplied backend is deployed.'); setRows(data); } })
      .catch(e=>{ if (!controller.signal.aborted) setError(apiMessage(e)); })
      .finally(()=>{if (!controller.signal.aborted) setLoading(false);}),200);
    return ()=>{ clearTimeout(timer); controller.abort(); };
  },[entity,entityId,page,isAdmin,refresh,invalidId]);
  if (!isAdmin) return <ErrorPanel message="Audit history is available to admin accounts only." />;
  const clear = ()=>{setEntity('');setEntityId('');setPage(1);};
  return <div><PageHeader eyebrow="Accountability" title="Activity & audit history" description="A record of who changed what, and when. Readable changes with the original snapshots available." actions={<button className="btn btn-outline" disabled={loading} onClick={()=>setRefresh(v=>v+1)}>↻ Refresh</button>} />
    <div className="info-strip">New creates, edits, archives, deletions and payment corrections are logged by the backend. Records created before audit logging was introduced have no retrospective history.</div>
    <div className="filter-bar"><select aria-label="Audit entity" value={entity} onChange={e=>{setEntity(e.target.value);setPage(1);}}><option value="">All record types</option>{['Car','Partner','Earning','Expense'].map(x=><option key={x}>{x}</option>)}</select><label className="search-box"><span>#</span><input aria-label="Exact record ID" value={entityId} onChange={e=>{setEntityId(e.target.value);setPage(1);}} placeholder="Exact record ID (optional)" /></label><button className="btn btn-ghost" onClick={clear}>Clear filters</button></div>
    {invalidId ? <div className="alert alert-warning">Enter the full 24-character record ID, or clear this filter to see all activity.</div> : loading ? <LoadingBlock label="Reading audit records…" /> : error ? <ErrorPanel message={error} onRetry={()=>setRefresh(v=>v+1)} /> : rows.length ? <div className="audit-list">{rows.map(row=><AuditEntry row={row} key={row._id} />)}</div> : <EmptyState title={entity || entityId || page > 1 ? 'No matching activity' : 'No audit activity recorded yet'} description={entity || entityId || page > 1 ? 'Clear the filters or go back to the previous page.' : 'This API returned an empty history. Save a legitimate record change and refresh. If it is still empty, check that the deployed API uses the supplied v2 backend and the same database.'} action={entity || entityId || page > 1 ? <button className="btn btn-outline" onClick={clear}>Show all activity</button> : <Link className="btn btn-primary" to="/cars">View fleet</Link>} />}
    {!invalidId && !error && <div className="pagination"><button className="btn btn-outline btn-sm" disabled={page <= 1 || loading} onClick={()=>setPage(p=>p-1)}>← Previous</button><span>Page {page} · {rows.length} events</span><button className="btn btn-outline btn-sm" disabled={rows.length < limit || loading} onClick={()=>setPage(p=>p+1)}>Next →</button></div>}
  </div>;
}
function AuditEntry({row}) {
  const changes = row.changes || {}, before = changes.before || {}, after = changes.after || {};
  const keys = [...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>!['_id','__v','createdAt','updatedAt','financialVersion'].includes(k) && JSON.stringify(before[k]) !== JSON.stringify(after[k]));
  const name = after.carName || after.name || after.source || after.category || before.carName || before.name || before.source || before.category;
  const route = ({Car:'cars',Partner:'partners',Earning:'earnings',Expense:'expenses'})[row.entity];
  return <article className="audit-row"><div className="audit-time"><span className="timeline-dot" />{displayDateTime(row.createdAt)}</div><div className="audit-main"><div className="audit-title"><Badge tone={['delete','archive'].includes(row.action) ? 'danger' : row.action === 'correct-payment' ? 'warning' : 'blue'}>{row.action?.replaceAll('-',' ') || 'Change'}</Badge><strong>{row.entity}{name ? ` · ${name}` : ''}</strong></div><p className="tiny muted">{row.actor?.name || 'Former / unavailable user'}{row.actor?.role ? ` · ${row.actor.role}` : ''}</p>{changes.reason && <div className="info-strip">Reason: {changes.reason}</div>}{keys.length > 0 && <details><summary>View {keys.length} changed fields</summary><div className="transaction-table-wrap"><table className="data-table audit-changes"><thead><tr><th>Field</th><th>Before</th><th>After</th></tr></thead><tbody>{keys.map(k=><tr key={k}><th>{labels[k] || k}</th><td>{valueLabel(k,before[k])}</td><td>{valueLabel(k,after[k])}</td></tr>)}</tbody></table></div></details>}<div className="audit-record-link"><code>{row.entityId}</code>{route && row.action !== 'delete' && <Link className="text-link" to={row.entity === 'Car' ? `/cars/${row.entityId}` : `/${route}/${row.entityId}/edit`}>Open record ↗</Link>}</div><details><summary>Original audit data</summary><pre>{JSON.stringify(changes,null,2)}</pre></details></div></article>;
}
