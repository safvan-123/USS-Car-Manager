import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Badge, ErrorPanel, LoadingBlock, PageHeader, StatCard } from "../components/Ui";
import { carLabel, displayDate, money, paidAmountOf } from "../utils/format";

export default function DashboardPage() {
  const { user, canWrite } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [cars, summary, reminders, earnings, expenses] = await Promise.all([
        api.get("/cars", { params: { includeArchived: "true" } }),
        api.get("/reports/summary"),
        api.get("/reports/reminders", { params: { days: 30 } }),
        api.get("/earnings", { params: { page: 1, limit: 5 } }),
        api.get("/expenses", { params: { page: 1, limit: 5 } }),
      ]);
      setData({ cars: cars.data, summary: summary.data, reminders: reminders.data, earnings: earnings.data, expenses: expenses.data });
    } catch (err) {
      setError(apiMessage(err, "Unable to load dashboard"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recent = useMemo(() => {
    if (!data) return [];
    return [
      ...data.earnings.map((item) => ({ ...item, kind: "earning", total: item.amount, label: item.source })),
      ...data.expenses.map((item) => ({ ...item, kind: "expense", total: item.totalAmount, label: item.category })),
    ].sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()).slice(0, 6);
  }, [data]);

  if (loading) return <LoadingBlock label="Loading your workspace…" />;
  if (error) return <ErrorPanel message={error} onRetry={load} />;

  const activeCars = data.cars.filter((car) => !car.archived);
  const archivedCars = data.cars.length - activeCars.length;
  const totals = data.summary.totals || {};
  const outstanding = (data.summary.partners || []).reduce((sum, row) => sum + Number(row.earningsOutstanding || 0), 0);

  return (
    <div>
      <PageHeader
        eyebrow={`Hello, ${user?.name || "there"}`}
        title="Your business at a glance"
        description="Fleet status, money, partner settlements and upcoming vehicle work in one view."
        actions={canWrite && <div className="button-row"><Link className="btn btn-primary" to="/earnings/new">+ Earning</Link><Link className="btn btn-secondary" to="/expenses/new">+ Expense</Link></div>}
      />

      <div className="stats-grid">
        <StatCard icon="▣" label="Active cars" value={activeCars.length} helper={archivedCars ? `${archivedCars} archived` : "Fleet ready to manage"} tone="blue" />
        <StatCard icon="↗" label="Recorded earnings" value={money(totals.earnings)} helper={totals.legacyIncome ? `${money(totals.legacyIncome)} legacy income also included in surplus` : "Across all recorded cars"} tone="green" />
        <StatCard icon="↘" label="Recorded expenses" value={money(totals.expenses)} helper="Across all recorded cars" tone="red" />
        <StatCard icon="◎" label="Recorded surplus" value={money(totals.recordedSurplus)} helper="Income minus expenses — not audited profit" tone={Number(totals.recordedSurplus) >= 0 ? "violet" : "red"} />
      </div>

      <div className="dashboard-grid">
        <section className="panel span-2">
          <div className="panel-heading"><div><h2>Fleet</h2><p>Current status of active vehicles</p></div><Link to="/cars" className="text-link">View all</Link></div>
          <div className="fleet-mini-grid">
            {activeCars.slice(0, 6).map((car) => <CarMini key={car._id} car={car} />)}
            {!activeCars.length && <div className="muted">No active cars found.</div>}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h2>Attention needed</h2><p>Next 30 days</p></div><Link to="/maintenance" className="text-link">Maintenance</Link></div>
          <div className="stack-list compact">
            {data.reminders.slice(0, 6).map((item, index) => (
              <Link className="list-row" to={`/cars/${item.carId}`} key={`${item.carId}-${item.type}-${index}`}>
                <span className={`status-dot ${item.overdue ? "danger" : "warning"}`} />
                <span className="row-main"><strong>{reminderLabel(item.type)}</strong><small>{item.carName} · {item.carNumber}</small></span>
                <span className="row-meta">{item.dueDate ? displayDate(item.dueDate) : `${item.odometer?.toLocaleString("en-IN")} / ${item.dueKm?.toLocaleString("en-IN")} km`}</span>
              </Link>
            ))}
            {!data.reminders.length && <div className="success-empty">✓ No service/document reminders due in the next 30 days.</div>}
          </div>
        </section>

        <section className="panel span-2">
          <div className="panel-heading"><div><h2>Recent transactions</h2><p>Latest earnings and expenses</p></div><div className="button-row"><Link to="/earnings" className="text-link">Earnings</Link><Link to="/expenses" className="text-link">Expenses</Link></div></div>
          <div className="transaction-table-wrap">
            <table className="data-table">
              <thead><tr><th>Date</th><th>Car</th><th>Description</th><th>Status</th><th className="right">Amount</th></tr></thead>
              <tbody>
                {recent.map((item) => {
                  const paid = (item.partners || []).reduce((sum, row) => sum + paidAmountOf(row), 0);
                  const allocated = (item.partners || []).reduce((sum, row) => sum + Number(row.amount || 0), 0);
                  return <tr key={`${item.kind}-${item._id}`}>
                    <td>{displayDate(item.date)}</td>
                    <td>{carLabel(item.car)}</td>
                    <td><strong>{item.label}</strong>{item.missingCar && <div><Badge tone="danger">Missing car</Badge></div>}</td>
                    <td>{item.allocationStatus === "balanced" ? <Badge tone="success">Balanced</Badge> : <Badge tone="warning">{item.allocationStatus === "unallocated" ? "Unallocated" : "Review"}</Badge>}<div className="tiny muted">{allocated ? `${money(paid)} settled` : "No partner allocation"}</div></td>
                    <td className={`right money-cell ${item.kind}`}>{item.kind === "earning" ? "+" : "−"}{money(item.total)}</td>
                  </tr>;
                })}
                {!recent.length && <tr><td colSpan="5" className="muted center">No transactions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading"><div><h2>Partner position</h2><p>Distribution still outstanding</p></div><Link to="/reports" className="text-link">Reports</Link></div>
          <div className="big-number">{money(outstanding)}</div>
          <div className="muted">Outstanding earning allocations based on recorded partner payments.</div>
          {(data.summary.warnings || []).length > 0 && <div className="warning-box small-gap"><strong>Data review:</strong> {data.summary.warnings[0]}</div>}
        </section>
      </div>
    </div>
  );
}

function CarMini({ car }) {
  return <Link to={`/cars/${car._id}`} className="car-mini">
    <div className="car-thumb">{car.image ? <img src={car.image} alt="" /> : <span>CAR</span>}</div>
    <div className="car-mini-info"><strong>{car.carName}</strong><small>{car.carNumber}</small></div>
    <Badge tone={car.status === "Available" ? "success" : car.status === "Rented" ? "blue" : "warning"}>{car.status}</Badge>
  </Link>;
}

function reminderLabel(type) {
  return ({ nextServiceDate: "Service due", insuranceExpiry: "Insurance expiry", pollutionExpiry: "Pollution certificate", nextServiceKm: "Service mileage reached" })[type] || type;
}
