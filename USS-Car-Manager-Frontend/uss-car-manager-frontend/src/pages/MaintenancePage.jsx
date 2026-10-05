import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { displayDate, number } from "../utils/format";

export default function MaintenancePage() {
  const { canWrite } = useAuth();
  const [days, setDays] = useState(30);
  const [reminders, setReminders] = useState([]);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [r, c] = await Promise.all([api.get("/reports/reminders", { params: { days } }), api.get("/cars")]);
      setReminders(r.data); setCars(c.data);
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [days]);

  const overdue = useMemo(() => reminders.filter((r) => r.overdue), [reminders]);
  const upcoming = useMemo(() => reminders.filter((r) => !r.overdue), [reminders]);
  const maintenanceCars = cars.filter((c) => c.status === "Under Maintenance");

  return <div>
    <PageHeader eyebrow="Vehicle care" title="Maintenance & renewals" description="See service, insurance and pollution-certificate items before they become a problem." actions={canWrite && <Link className="btn btn-primary" to="/cars">Update a car</Link>} />
    <div className="segmented-control"><button className={days === 30 ? "active" : ""} onClick={() => setDays(30)}>30 days</button><button className={days === 60 ? "active" : ""} onClick={() => setDays(60)}>60 days</button><button className={days === 90 ? "active" : ""} onClick={() => setDays(90)}>90 days</button><button className={days === 365 ? "active" : ""} onClick={() => setDays(365)}>1 year</button></div>
    {loading ? <LoadingBlock label="Checking reminders…" /> : error ? <ErrorPanel message={error} onRetry={load} /> : <>
      <div className="stats-grid three"><div className="stat-card tone-red"><div className="stat-label">Overdue / due by mileage</div><div className="stat-value">{overdue.length}</div></div><div className="stat-card tone-yellow"><div className="stat-label">Upcoming in window</div><div className="stat-value">{upcoming.length}</div></div><div className="stat-card tone-blue"><div className="stat-label">Cars under maintenance</div><div className="stat-value">{maintenanceCars.length}</div></div></div>
      <div className="dashboard-grid">
        <section className="panel span-2"><div className="panel-heading"><div><h2>Due items</h2><p>Sorted with overdue items first</p></div></div><div className="reminder-grid">{[...overdue, ...upcoming].map((item, index) => <ReminderCard item={item} canWrite={canWrite} key={`${item.carId}-${item.type}-${index}`} />)}{!reminders.length && <div className="success-empty large">✓ No reminders due in the selected period.</div>}</div></section>
        <section className="panel"><div className="panel-heading"><div><h2>Under maintenance</h2><p>Current vehicle status</p></div></div><div className="stack-list compact">{maintenanceCars.map((car) => <Link to={`/cars/${car._id}`} className="list-row" key={car._id}><span className="status-dot warning" /><span className="row-main"><strong>{car.carName}</strong><small>{car.carNumber}</small></span><span className="row-meta">{car.odometer != null ? `${number(car.odometer)} km` : ""}</span></Link>)}{!maintenanceCars.length && <div className="muted">No car is currently marked Under Maintenance.</div>}</div></section>
      </div>
    </>}
  </div>;
}

function ReminderCard({ item, canWrite }) {
  const labels = { nextServiceDate: "Service date", nextServiceKm: "Service mileage", insuranceExpiry: "Insurance renewal", pollutionExpiry: "Pollution certificate" };
  return <article className={`reminder-card ${item.overdue ? "overdue" : ""}`}><div className="reminder-icon">{item.overdue ? "!" : "◷"}</div><div className="reminder-content"><div className="reminder-title"><strong>{labels[item.type] || item.type}</strong><Badge tone={item.overdue ? "danger" : "warning"}>{item.overdue ? "Overdue" : "Upcoming"}</Badge></div><div>{item.carName} · {item.carNumber}</div><small>{item.dueDate ? `Due ${displayDate(item.dueDate)}` : `Service at ${number(item.dueKm)} km · current ${number(item.odometer)} km`}</small></div><div className="reminder-actions"><Link className="btn btn-outline btn-sm" to={`/cars/${item.carId}`}>View</Link>{canWrite && <Link className="btn btn-secondary btn-sm" to={`/cars/${item.carId}/edit`}>Update</Link>}</div></article>;
}
