import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ConfirmDialog, ErrorPanel, LoadingBlock, PageHeader, StatCard } from "../components/Ui";
import { displayDate, money, number, paidAmountOf } from "../utils/format";
import { useToast } from "../components/Toast";

export default function CarDetailPage() {
  const { id } = useParams();
  const { canWrite, isAdmin } = useAuth();
  const { show } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiveBusy, setArchiveBusy] = useState(false);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [car, summary, partners, earnings, expenses, reminders] = await Promise.all([
        api.get(`/cars/${id}`),
        api.get("/reports/summary", { params: { car: id } }),
        api.get(`/partners/car/${id}`),
        api.get(`/earnings/car/${id}`, { params: { page: 1, limit: 5 } }),
        api.get(`/expenses/car/${id}`, { params: { page: 1, limit: 5 } }),
        api.get("/reports/reminders", { params: { days: 365 } }),
      ]);
      setData({ car: car.data, summary: summary.data, partners: partners.data, earnings: earnings.data, expenses: expenses.data, reminders: reminders.data.filter((r) => String(r.carId) === id) });
    } catch (err) { setError(apiMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [id]);

  const toggleArchive = async () => {
    if (!data?.car || !isAdmin) return;
    setArchiveBusy(true);
    try {
      if (data.car.archived) await api.post(`/cars/${id}/restore`);
      else await api.delete(`/cars/${id}`);
      show(data.car.archived ? "Car restored" : "Car archived. Financial history retained.", "success");
      setConfirmArchive(false);
      await load();
    } catch (err) { show(apiMessage(err), "danger"); }
    finally { setArchiveBusy(false); }
  };

  if (loading) return <LoadingBlock label="Loading car…" />;
  if (error) return <ErrorPanel message={error} onRetry={load} />;
  const { car, summary, partners, earnings, expenses, reminders } = data;
  const totals = summary.totals || {};

  return <div>
    <PageHeader eyebrow={car.archived ? "Archived vehicle" : "Vehicle"} title={car.carName} description={`${car.carNumber}${car.model ? ` · ${car.model}` : ""}${car.year ? ` · ${car.year}` : ""}`}
      actions={<div className="button-row">{canWrite && <Link className="btn btn-secondary" to={`/cars/${id}/edit`}>Edit car</Link>}{isAdmin && <button className={`btn ${car.archived ? "btn-success" : "btn-danger-soft"}`} onClick={() => setConfirmArchive(true)}>{car.archived ? "Restore" : "Archive"}</button>}<Link className="btn btn-outline" to="/cars">Back to fleet</Link></div>} />

    {car.archived && <div className="alert alert-warning"><strong>This car is archived.</strong> Its historical finance is still visible. Restore it before creating or changing linked financial records.</div>}

    <div className="car-detail-hero panel">
      <div className="detail-photo">{car.image ? <img src={car.image} alt={car.carName} /> : <div className="car-placeholder big"><span>USS</span><small>{car.carNumber}</small></div>}</div>
      <div className="detail-info">
        <div className="detail-status-row"><Badge tone={car.status === "Available" ? "success" : car.status === "Rented" ? "blue" : "warning"}>{car.status}</Badge>{car.archived && <Badge>Archived</Badge>}</div>
        <div className="detail-grid">
          <div><span>Owner</span><strong>{car.owner || "—"}</strong></div>
          <div><span>Odometer</span><strong>{car.odometer != null ? `${number(car.odometer)} km` : "—"}</strong></div>
          <div><span>Next service km</span><strong>{car.nextServiceKm != null ? `${number(car.nextServiceKm)} km` : "—"}</strong></div>
          <div><span>Next service date</span><strong>{displayDate(car.nextServiceDate)}</strong></div>
          <div><span>Insurance expiry</span><strong>{displayDate(car.insuranceExpiry)}</strong></div>
          <div><span>Pollution expiry</span><strong>{displayDate(car.pollutionExpiry)}</strong></div>
        </div>
        {car.notes && <div className="note-box"><strong>Notes</strong><div>{car.notes}</div></div>}
      </div>
    </div>

    <div className="stats-grid four">
      <StatCard label="Earnings" value={money(totals.earnings)} icon="↗" tone="green" />
      <StatCard label="Expenses" value={money(totals.expenses)} icon="↘" tone="red" />
      <StatCard label="Recorded surplus" value={money(totals.recordedSurplus)} icon="◎" tone="violet" helper="Not audited profit" />
      <StatCard label="Active partners" value={partners.filter((p) => p.status === "Active").length} icon="◉" tone="blue" />
    </div>

    <div className="dashboard-grid">
      <section className="panel span-2">
        <div className="panel-heading"><div><h2>Quick actions</h2><p>Common work for this vehicle</p></div></div>
        <div className="quick-grid">
          {canWrite && !car.archived && <Link className="quick-action positive" to={`/earnings/new?car=${id}`}><span>↗</span><strong>Add earning</strong><small>Rent, trip or other income</small></Link>}
          {canWrite && !car.archived && <Link className="quick-action negative" to={`/expenses/new?car=${id}`}><span>↘</span><strong>Add expense</strong><small>Fuel, repair, insurance and more</small></Link>}
          <Link className="quick-action" to={`/earnings?car=${id}`}><span>▤</span><strong>Earning history</strong><small>View distributions and status</small></Link>
          <Link className="quick-action" to={`/expenses?car=${id}`}><span>▤</span><strong>Expense history</strong><small>View contributions and status</small></Link>
          <Link className="quick-action" to={`/partners?car=${id}`}><span>◎</span><strong>Partners</strong><small>Ownership and contact details</small></Link>
          <Link className="quick-action" to={`/reports?car=${id}`}><span>◇</span><strong>Car report</strong><small>Financial summary and warnings</small></Link>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading"><div><h2>Reminders</h2><p>Due within 365 days</p></div></div>
        <div className="stack-list compact">
          {reminders.map((item, idx) => <div className="list-row" key={`${item.type}-${idx}`}><span className={`status-dot ${item.overdue ? "danger" : "warning"}`} /><span className="row-main"><strong>{labelReminder(item.type)}</strong><small>{item.overdue ? "Overdue" : "Upcoming"}</small></span><span className="row-meta">{item.dueDate ? displayDate(item.dueDate) : `${number(item.dueKm)} km`}</span></div>)}
          {!reminders.length && <div className="success-empty">✓ No reminders in this window.</div>}
        </div>
      </section>

      <section className="panel span-2">
        <div className="panel-heading"><div><h2>Recent money movement</h2><p>Latest records for this car</p></div></div>
        <RecentTable earnings={earnings} expenses={expenses} />
      </section>

      <section className="panel">
        <div className="panel-heading"><div><h2>Partners</h2><p>Ownership setup</p></div>{isAdmin && <Link to={`/partners/new?car=${id}`} className="text-link">Add</Link>}</div>
        <div className="stack-list compact">
          {partners.map((partner) => <div className="list-row" key={partner._id}><span className={`status-dot ${partner.status === "Active" ? "success" : "neutral"}`} /><span className="row-main"><strong>{partner.name}</strong><small>{partner.status}</small></span><span className="row-meta">{partner.sharePercentage}%</span></div>)}
          {!partners.length && <div className="muted">No partners configured.</div>}
        </div>
      </section>
    </div>
    <ConfirmDialog open={confirmArchive} title={car.archived ? "Restore this car?" : "Archive this car?"} message={car.archived ? "The car will return to the active fleet." : "The car will be hidden from the active fleet, but all financial history will remain."} confirmText={car.archived ? "Restore car" : "Archive car"} tone={car.archived ? "success" : "danger"} onConfirm={toggleArchive} onCancel={() => setConfirmArchive(false)} busy={archiveBusy} />
  </div>;
}

function RecentTable({ earnings, expenses }) {
  const rows = [...earnings.map((r) => ({ ...r, kind: "earning", total: r.amount, label: r.source })), ...expenses.map((r) => ({ ...r, kind: "expense", total: r.totalAmount, label: r.category }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 7);
  return <div className="transaction-table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Description</th><th>Settlement</th><th className="right">Amount</th></tr></thead><tbody>{rows.map((r) => {
    const settled = (r.partners || []).reduce((sum, row) => sum + paidAmountOf(row), 0);
    return <tr key={`${r.kind}-${r._id}`}><td>{displayDate(r.date)}</td><td><strong>{r.label}</strong></td><td>{money(settled)} settled</td><td className={`right money-cell ${r.kind}`}>{r.kind === "earning" ? "+" : "−"}{money(r.total)}</td></tr>;
  })}{!rows.length && <tr><td colSpan="4" className="center muted">No transactions yet.</td></tr>}</tbody></table></div>;
}

function labelReminder(type) { return ({ nextServiceDate: "Service date", nextServiceKm: "Service mileage", insuranceExpiry: "Insurance", pollutionExpiry: "Pollution certificate" })[type] || type; }
