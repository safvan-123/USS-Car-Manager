import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ConfirmDialog, EmptyState, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { displayDate, number } from "../utils/format";
import { useToast } from "../components/Toast";

export default function CarsPage() {
  const { canWrite, isAdmin } = useAuth();
  const { show } = useToast();
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await api.get("/cars", { params: { search: search || undefined, status: status || undefined, includeArchived: includeArchived ? "true" : undefined } });
      setCars(data);
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(load, 250);
    return () => window.clearTimeout(timer);
  }, [search, status, includeArchived]);

  const archiveOrRestore = async () => {
    if (!confirm) return;
    setBusy(true);
    try {
      if (confirm.archived) await api.post(`/cars/${confirm._id}/restore`);
      else await api.delete(`/cars/${confirm._id}`);
      show(confirm.archived ? "Car restored" : "Car archived. Financial history was retained.", "success");
      setConfirm(null);
      load();
    } catch (err) { show(apiMessage(err), "danger"); }
    finally { setBusy(false); }
  };

  return <div>
    <PageHeader eyebrow="Fleet" title="Cars" description="Manage vehicle details, running status, documents and service dates."
      actions={canWrite && <Link className="btn btn-primary" to="/cars/new">+ Add car</Link>} />

    <div className="filter-bar">
      <label className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search car, registration or owner…" /></label>
      <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option>Available</option><option>Rented</option><option>Under Maintenance</option></select>
      <label className="check-control"><input type="checkbox" checked={includeArchived} onChange={(e) => setIncludeArchived(e.target.checked)} /> Show archived</label>
    </div>

    {loading ? <LoadingBlock label="Loading cars…" /> : error ? <ErrorPanel message={error} onRetry={load} /> : cars.length ? (
      <div className="car-card-grid">
        {cars.map((car) => <article className={`car-card ${car.archived ? "archived" : ""}`} key={car._id}>
          <Link to={`/cars/${car._id}`} className="car-photo">
            {car.image ? <img src={car.image} alt={`${car.carName}`} /> : <div className="car-placeholder"><span>USS</span><small>{car.carNumber}</small></div>}
            <div className="car-photo-badges"><Badge tone={car.archived ? "neutral" : car.status === "Available" ? "success" : car.status === "Rented" ? "blue" : "warning"}>{car.archived ? "Archived" : car.status}</Badge></div>
          </Link>
          <div className="car-card-body">
            <div className="car-title-row"><div><h3>{car.carName}</h3><div className="registration">{car.carNumber}</div></div>{car.year && <span className="year-chip">{car.year}</span>}</div>
            <div className="meta-grid">
              <div><span>Model</span><strong>{car.model || "—"}</strong></div>
              <div><span>Odometer</span><strong>{car.odometer != null ? `${number(car.odometer)} km` : "—"}</strong></div>
              <div><span>Service date</span><strong>{displayDate(car.nextServiceDate)}</strong></div>
              <div><span>Insurance</span><strong>{displayDate(car.insuranceExpiry)}</strong></div>
            </div>
            <div className="card-actions">
              <Link className="btn btn-outline btn-sm" to={`/cars/${car._id}`}>View</Link>
              {canWrite && <Link className="btn btn-secondary btn-sm" to={`/cars/${car._id}/edit`}>Edit</Link>}
              {isAdmin && <button className={`btn btn-sm ${car.archived ? "btn-success" : "btn-danger-soft"}`} onClick={() => setConfirm(car)}>{car.archived ? "Restore" : "Archive"}</button>}
            </div>
          </div>
        </article>)}
      </div>
    ) : <EmptyState title="No cars found" description={search || status ? "Try changing the filters." : "Add your first car to start tracking the fleet."} action={canWrite && !search && !status ? <Link className="btn btn-primary" to="/cars/new">Add first car</Link> : null} />}

    <ConfirmDialog open={Boolean(confirm)} title={confirm?.archived ? "Restore this car?" : "Archive this car?"} message={confirm?.archived ? "The car will return to the active fleet." : "The car will disappear from the active fleet, but all financial history will be retained."} confirmText={confirm?.archived ? "Restore car" : "Archive car"} tone={confirm?.archived ? "success" : "danger"} onConfirm={archiveOrRestore} onCancel={() => setConfirm(null)} busy={busy} />
  </div>;
}
