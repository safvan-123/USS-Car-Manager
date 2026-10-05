import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ConfirmDialog, EmptyState, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { useToast } from "../components/Toast";
import { carLabel } from "../utils/format";

export default function PartnersPage() {
  const { isAdmin } = useAuth();
  const { show } = useToast();
  const [params] = useSearchParams();
  const presetCar = params.get("car") || "";
  const [partners, setPartners] = useState([]);
  const [cars, setCars] = useState([]);
  const [allPartners, setAllPartners] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [car, setCar] = useState(presetCar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [p, all, c] = await Promise.all([
        api.get("/partners", { params: { search: search || undefined, status: status || undefined, car: car || undefined } }),
        api.get("/partners"),
        api.get("/cars", { params: { includeArchived: "true" } }),
      ]);
      setPartners(p.data); setAllPartners(all.data); setCars(c.data);
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [search, status, car]);

  const sharesByCar = useMemo(() => allPartners.filter((p) => p.status === "Active").reduce((map, p) => {
    const id = p.car?._id || p.car;
    map[id] = (map[id] || 0) + Number(p.sharePercentage || 0);
    return map;
  }, {}), [allPartners]);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/partners/${confirm._id}`);
      show("Partner deleted", "success"); setConfirm(null); load();
    } catch (err) { show(apiMessage(err), "danger"); }
    finally { setBusy(false); }
  };

  const setInactive = async (partner) => {
    try {
      const next = partner.status === "Active" ? "Inactive" : "Active";
      await api.put(`/partners/${partner._id}`, { status: next, __v: partner.__v });
      show(`Partner set to ${next}`, "success"); load();
    } catch (err) { show(apiMessage(err), "danger"); }
  };

  return <div>
    <PageHeader eyebrow="Ownership" title="Partners" description="Manage partner shares and settlement participants. Existing transaction shares remain historical snapshots." actions={isAdmin && <Link className="btn btn-primary" to={`/partners/new${car ? `?car=${car}` : ""}`}>+ Add partner</Link>} />
    <div className="info-strip"><strong>Automatic allocations:</strong> active partner shares for a car must total 100%. Changing a percentage affects future transactions only.</div>
    <div className="filter-bar">
      <label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search partner…" /></label>
      <select value={car} onChange={(e) => setCar(e.target.value)}><option value="">All cars</option>{cars.map((c) => <option key={c._id} value={c._id}>{c.carName} · {c.carNumber}</option>)}</select>
      <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>Active</option><option>Inactive</option></select>
    </div>
    {loading ? <LoadingBlock label="Loading partners…" /> : error ? <ErrorPanel message={error} onRetry={load} /> : partners.length ? <div className="partner-grid">
      {partners.map((partner) => {
        const carId = partner.car?._id || partner.car;
        return <article className="partner-card panel" key={partner._id}>
          <div className="partner-head"><div className="avatar large-avatar">{partner.name.slice(0, 1).toUpperCase()}</div><div><h3>{partner.name}</h3><div className="muted">{carLabel(partner.car)}</div></div><Badge tone={partner.status === "Active" ? "success" : "neutral"}>{partner.status}</Badge></div>
          <div className="partner-share"><span>{partner.sharePercentage}%</span><small>Ownership share</small></div>
          <div className="meta-list"><div><span>Phone</span><strong>{partner.contactDetails?.phone || "—"}</strong></div><div><span>Email</span><strong>{partner.contactDetails?.email || "—"}</strong></div><div><span>Active share total</span><strong className={Math.abs((sharesByCar[carId] || 0) - 100) < 0.000001 ? "text-success" : "text-warning"}>{Number(sharesByCar[carId] || 0).toFixed(4).replace(/0+$/, "").replace(/\.$/, "")}%</strong></div></div>
          {isAdmin && <div className="card-actions">{partner.car?.archived ? <span className="muted tiny">Restore the archived car before editing this partner.</span> : <><Link className="btn btn-secondary btn-sm" to={`/partners/${partner._id}/edit`}>Edit</Link><button className="btn btn-outline btn-sm" onClick={() => setInactive(partner)}>{partner.status === "Active" ? "Set inactive" : "Activate"}</button></>}<button className="btn btn-danger-soft btn-sm" onClick={() => setConfirm(partner)}>Delete</button></div>}
        </article>;
      })}
    </div> : <EmptyState title="No partners found" description="Add partners only where ownership or settlement allocation is needed." action={isAdmin ? <Link className="btn btn-primary" to="/partners/new">Add partner</Link> : null} />}
    <ConfirmDialog open={Boolean(confirm)} title="Delete this partner?" message="Deletion is allowed only when this partner has no financial history. If history exists, set the partner to Inactive instead." confirmText="Delete partner" onConfirm={remove} onCancel={() => setConfirm(null)} busy={busy} />
  </div>;
}
