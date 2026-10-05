import { useEffect, useState } from "react";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { displayDateTime } from "../utils/format";

export default function AuditPage() {
  const { isAdmin } = useAuth();
  const [entity, setEntity] = useState("");
  const [entityId, setEntityId] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const limit = 50;

  const load = async () => {
    if (!isAdmin) return;
    setLoading(true); setError("");
    try { const { data } = await api.get("/reports/audit", { params: { entity: entity || undefined, entityId: entityId || undefined, page, limit } }); setRows(data); }
    catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [entity, entityId, page, isAdmin]);
  useEffect(() => setPage(1), [entity, entityId]);

  if (!isAdmin) return <ErrorPanel message="Audit history is available only to Admin users." />;
  return <div><PageHeader eyebrow="Administration" title="Audit history" description="Review who changed cars, partners and financial records, including audited payment corrections." />
    <div className="filter-bar"><select value={entity} onChange={(e) => setEntity(e.target.value)}><option value="">All entities</option><option>Car</option><option>Partner</option><option>Earning</option><option>Expense</option></select><label className="search-box"><span>#</span><input value={entityId} onChange={(e) => setEntityId(e.target.value)} placeholder="Exact entity ID (optional)" /></label></div>
    {loading ? <LoadingBlock label="Loading audit history…" /> : error ? <ErrorPanel message={error} onRetry={load} /> : <div className="audit-list">{rows.map((row) => <article className="audit-row" key={row._id}><div className="audit-time">{displayDateTime(row.createdAt)}</div><div className="audit-main"><div className="audit-title"><Badge tone={row.action === "delete" || row.action === "archive" ? "danger" : row.action === "correct-payment" ? "warning" : "blue"}>{row.action}</Badge><strong>{row.entity}</strong><code>{row.entityId}</code></div><div className="muted tiny">By {row.actor?.name || "Unknown user"}{row.actor?.role ? ` · ${row.actor.role}` : ""}</div>{row.changes && Object.keys(row.changes).length > 0 && <details><summary>View recorded changes</summary><pre>{JSON.stringify(row.changes, null, 2)}</pre></details>}</div></article>)}{!rows.length && <div className="empty-state"><h3>No audit records found</h3></div>}</div>}
    <div className="pagination"><button className="btn btn-outline btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>← Previous</button><span>Page {page}</span><button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p + 1)} disabled={rows.length < limit}>Next →</button></div>
  </div>;
}
