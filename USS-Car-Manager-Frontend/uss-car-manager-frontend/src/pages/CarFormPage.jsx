import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, apiMessage, uploadCarImage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { useToast } from "../components/Toast";
import { inputDate } from "../utils/format";

const blank = { carName: "", carNumber: "", model: "", year: "", owner: "", image: "", status: "Available", odometer: "", nextServiceKm: "", nextServiceDate: "", insuranceExpiry: "", pollutionExpiry: "", notes: "", __v: undefined };

export default function CarFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const { canWrite } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;
    api.get(`/cars/${id}`).then(({ data }) => setForm({ ...blank, ...data, year: data.year ?? "", odometer: data.odometer ?? "", nextServiceKm: data.nextServiceKm ?? "", nextServiceDate: inputDate(data.nextServiceDate), insuranceExpiry: inputDate(data.insuranceExpiry), pollutionExpiry: inputDate(data.pollutionExpiry) })).catch((err) => setError(apiMessage(err))).finally(() => setLoading(false));
  }, [id, editing]);

  if (!canWrite) return <ErrorPanel message="Your Viewer role can view cars but cannot create or edit them." />;
  if (loading) return <LoadingBlock label="Loading car…" />;
  if (error && editing && !form._id) return <ErrorPanel message={error} />;

  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    const payload = {
      carName: form.carName,
      carNumber: form.carNumber,
      model: form.model,
      owner: form.owner,
      image: form.image,
      status: form.status,
      notes: form.notes,
      ...(form.year !== "" ? { year: Number(form.year) } : {}),
      ...(form.odometer !== "" ? { odometer: Number(form.odometer) } : {}),
      ...(form.nextServiceKm !== "" ? { nextServiceKm: Number(form.nextServiceKm) } : {}),
      nextServiceDate: form.nextServiceDate || null,
      insuranceExpiry: form.insuranceExpiry || null,
      pollutionExpiry: form.pollutionExpiry || null,
      ...(editing ? { __v: form.__v } : {}),
    };
    try {
      const { data } = editing ? await api.put(`/cars/${id}`, payload) : await api.post("/cars", payload);
      show(editing ? "Car updated" : "Car added", "success");
      navigate(`/cars/${data._id}`);
    } catch (err) { setError(apiMessage(err)); }
    finally { setSaving(false); }
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("Choose an image smaller than 10 MB."); return; }
    setUploading(true); setError("");
    try { const url = await uploadCarImage(file); setForm((value) => ({ ...value, image: url })); show("Image uploaded", "success"); }
    catch (err) { setError(apiMessage(err, "Image upload failed")); }
    finally { setUploading(false); event.target.value = ""; }
  };

  return <div>
    <PageHeader eyebrow="Fleet" title={editing ? "Edit car" : "Add car"} description="Keep vehicle identity, running status and renewal/service dates together." actions={<Link className="btn btn-outline" to={editing ? `/cars/${id}` : "/cars"}>Cancel</Link>} />
    {error && <div className="alert alert-danger">{error}</div>}
    <form className="form-layout" onSubmit={submit}>
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Vehicle details</h2><p>Registration and ownership information</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Car name *</span><input name="carName" value={form.carName} onChange={change} maxLength="100" placeholder="e.g. Swift Dzire" required /></label>
          <label className="field"><span>Registration number *</span><input name="carNumber" value={form.carNumber} onChange={change} maxLength="30" placeholder="KL10AB1234" required /><small>Spaces and hyphens are normalized by the backend.</small></label>
          <label className="field"><span>Model / variant</span><input name="model" value={form.model} onChange={change} maxLength="80" placeholder="VXi / 1.2 Petrol" /></label>
          <label className="field"><span>Year</span><input name="year" type="number" min="1900" max={new Date().getFullYear() + 1} value={form.year} onChange={change} placeholder="2024" /></label>
          <label className="field"><span>Owner / ownership note</span><input name="owner" value={form.owner} onChange={change} maxLength="300" placeholder="Owner name or ownership details" /></label>
          <label className="field"><span>Current status</span><select name="status" value={form.status} onChange={change}><option>Available</option><option>Rented</option><option>Under Maintenance</option></select></label>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Running & maintenance</h2><p>Use these fields to drive reminder alerts</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Current odometer (km)</span><input name="odometer" type="number" min="0" step="1" value={form.odometer} onChange={change} /></label>
          <label className="field"><span>Next service at (km)</span><input name="nextServiceKm" type="number" min="0" step="1" value={form.nextServiceKm} onChange={change} /></label>
          <label className="field"><span>Next service date</span><input name="nextServiceDate" type="date" value={form.nextServiceDate} onChange={change} /></label>
          <label className="field"><span>Insurance expiry</span><input name="insuranceExpiry" type="date" value={form.insuranceExpiry} onChange={change} /></label>
          <label className="field"><span>Pollution certificate expiry</span><input name="pollutionExpiry" type="date" value={form.pollutionExpiry} onChange={change} /></label>
        </div>
      </section>

      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Image & notes</h2><p>Optional information for easier daily identification</p></div></div>
        <div className="image-editor">
          <div className="image-preview">{form.image ? <img src={form.image} alt="Car preview" /> : <div className="car-placeholder big"><span>CAR</span><small>Preview</small></div>}</div>
          <div className="image-controls">
            <label className="field"><span>Image URL</span><input name="image" type="text" value={form.image} onChange={change} placeholder="https://…" /></label>
            <label className={`btn btn-outline ${uploading ? "disabled" : ""}`}>{uploading ? "Uploading…" : "Upload image"}<input className="hidden-file" type="file" accept="image/*" onChange={upload} disabled={uploading} /></label>
            <small className="muted">Upload uses the configured Cloudinary unsigned preset. The backend stores only the final URL.</small>
          </div>
        </div>
        <label className="field"><span>Notes</span><textarea name="notes" value={form.notes} onChange={change} maxLength="2000" rows="4" placeholder="Service notes, rental notes, special instructions…" /></label>
      </section>

      <div className="sticky-form-actions"><Link className="btn btn-outline" to={editing ? `/cars/${id}` : "/cars"}>Cancel</Link><button className="btn btn-primary btn-lg" disabled={saving || uploading}>{saving ? "Saving…" : editing ? "Save changes" : "Add car"}</button></div>
    </form>
  </div>;
}
