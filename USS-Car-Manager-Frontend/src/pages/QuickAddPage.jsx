import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PageHeader } from "../components/Ui";

export default function QuickAddPage() {
  const { canWrite, isAdmin } = useAuth();
  return <div>
    <PageHeader eyebrow="Quick entry" title="What do you want to add?" description="Choose the job and go straight to the right form." />
    <div className="quick-add-grid">
      {canWrite && <Link className="quick-add-card positive" to="/earnings/new"><span>↗</span><div><strong>Earning</strong><small>Rent, trip, booking or other income</small></div></Link>}
      {canWrite && <Link className="quick-add-card negative" to="/expenses/new"><span>↘</span><div><strong>Expense</strong><small>Fuel, repair, service, insurance and other costs</small></div></Link>}
      {canWrite && <Link className="quick-add-card" to="/cars/new"><span>▣</span><div><strong>Car</strong><small>Add a vehicle with service and renewal details</small></div></Link>}
      {isAdmin && <Link className="quick-add-card" to="/partners/new"><span>◎</span><div><strong>Partner</strong><small>Add ownership share and settlement details</small></div></Link>}
      {!canWrite && <Link className="quick-add-card" to="/reports"><span>▤</span><div><strong>Reports</strong><small>Your role is read-only; open financial reports</small></div></Link>}
    </div>
  </div>;
}
