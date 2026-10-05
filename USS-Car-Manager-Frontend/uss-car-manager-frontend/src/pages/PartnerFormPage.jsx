import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { useToast } from "../components/Toast";

const blank = { car: "", name: "", sharePercentage: "", status: "Active", phone: "", email: "", address: "", accountNumber: "", ifsc: "", upiId: "", __v: undefined };

export default function PartnerFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...blank, car: searchParams.get("car") || "" });
  const [cars, setCars] = useState([]);
  const [carPartners, setCarPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return; }
    Promise.all([api.get("/cars", { params: { includeArchived: "true" } }), editing ? api.get(`/partners/${id}`) : Promise.resolve(null)])
      .then(([carRes, partnerRes]) => {
        setCars(carRes.data);
        if (partnerRes) {
          const p = partnerRes.data;
          setForm({ car: p.car?._id || p.car || "", name: p.name || "", sharePercentage: p.sharePercentage ?? "", status: p.status || "Active", phone: p.contactDetails?.phone || "", email: p.contactDetails?.email || "", address: p.contactDetails?.address || "", accountNumber: p.bankDetails?.accountNumber || "", ifsc: p.bankDetails?.ifsc || "", upiId: p.bankDetails?.upiId || "", __v: p.__v });
        }
      }).catch((err) => setError(apiMessage(err))).finally(() => setLoading(false));
  }, [id, editing, isAdmin]);


  useEffect(() => {
    if (!form.car || !isAdmin) { setCarPartners([]); return; }
    api.get(`/partners/car/${form.car}`).then(({ data }) => setCarPartners(data)).catch(() => setCarPartners([]));
  }, [form.car, isAdmin]);

  const otherActiveShare = carPartners
    .filter((partner) => partner.status === "Active" && partner._id !== id)
    .reduce((sum, partner) => sum + Number(partner.sharePercentage || 0), 0);
  const proposedTotal = otherActiveShare + (form.status === "Active" ? Number(form.sharePercentage || 0) : 0);
  const shareTooHigh = proposedTotal > 100.00000001;
  const selectedCar = cars.find((car) => car._id === form.car);
  const carArchived = Boolean(selectedCar?.archived);

  if (!isAdmin) return <ErrorPanel message="Only an Admin can create or change partner records." />;
  if (loading) return <LoadingBlock label="Loading partner…" />;

  const change = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    const payload = {
      name: form.name,
      sharePercentage: Number(form.sharePercentage),
      status: form.status,
      contactDetails: { phone: form.phone, email: form.email, address: form.address },
      bankDetails: { accountNumber: form.accountNumber, ifsc: form.ifsc, upiId: form.upiId },
      ...(editing ? { __v: form.__v } : { car: form.car }),
    };
    try {
      const { data } = editing ? await api.put(`/partners/${id}`, payload) : await api.post("/partners", payload);
      show(editing ? "Partner updated" : "Partner added", "success");
      navigate(`/partners?car=${data.car?._id || data.car || form.car}`);
    } catch (err) { setError(apiMessage(err)); }
    finally { setSaving(false); }
  };

  return <div>
    <PageHeader eyebrow="Ownership" title={editing ? "Edit partner" : "Add partner"} description="Partner shares drive future automatic allocations. Existing transaction allocations are not rewritten." actions={<Link className="btn btn-outline" to="/partners">Cancel</Link>} />
    {error && <div className="alert alert-danger">{error}</div>}
    {carArchived && <div className="alert alert-warning"><span>This car is archived. Restore the car before creating or changing its partner setup.</span><Link className="btn btn-outline btn-sm" to={`/cars/${form.car}`}>Open car</Link></div>}
    <form className="form-layout" onSubmit={submit}>
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Partner setup</h2><p>Identity, vehicle and share percentage</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Car *</span><select name="car" value={form.car} onChange={change} disabled={editing} required><option value="">Select car</option>{cars.map((c) => <option key={c._id} value={c._id} disabled={c.archived && !editing}>{c.carName} · {c.carNumber}{c.archived ? " (Archived)" : ""}</option>)}</select>{editing && <small>A partner cannot be moved to another car.</small>}</label>
          <label className="field"><span>Name *</span><input name="name" value={form.name} onChange={change} maxLength="100" required /></label>
          <label className="field"><span>Share percentage *</span><input name="sharePercentage" type="number" min="0.000000001" max="100" step="any" value={form.sharePercentage} onChange={change} required /><small>Other active shares: {otherActiveShare.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}%. Proposed active total: {proposedTotal.toFixed(6).replace(/0+$/, "").replace(/\.$/, "")}%.</small>{shareTooHigh && <div className="field-error">Active shares cannot exceed 100%.</div>}</label>
          <label className="field"><span>Status</span><select name="status" value={form.status} onChange={change}><option>Active</option><option>Inactive</option></select></label>
        </div>
      </section>
      <section className="panel form-panel"><div className="panel-heading"><div><h2>Contact details</h2><p>Optional communication information</p></div></div><div className="form-grid two">
        <label className="field"><span>Phone</span><input name="phone" value={form.phone} onChange={change} maxLength="30" /></label>
        <label className="field"><span>Email</span><input name="email" type="email" value={form.email} onChange={change} maxLength="254" /></label>
        <label className="field full"><span>Address</span><textarea name="address" value={form.address} onChange={change} maxLength="500" rows="3" /></label>
      </div></section>
      <section className="panel form-panel"><div className="panel-heading"><div><h2>Bank details</h2><p>Visible only through the Admin partner-detail endpoint</p></div></div><div className="form-grid two">
        <label className="field"><span>Account number</span><input name="accountNumber" value={form.accountNumber} onChange={change} maxLength="40" /></label>
        <label className="field"><span>IFSC</span><input name="ifsc" value={form.ifsc} onChange={change} maxLength="20" /></label>
        <label className="field"><span>UPI ID</span><input name="upiId" value={form.upiId} onChange={change} maxLength="150" /></label>
      </div></section>
      <div className="sticky-form-actions"><Link className="btn btn-outline" to="/partners">Cancel</Link><button className="btn btn-primary btn-lg" disabled={saving || shareTooHigh || carArchived}>{saving ? "Saving…" : editing ? "Save changes" : "Add partner"}</button></div>
    </form>
  </div>;
}
