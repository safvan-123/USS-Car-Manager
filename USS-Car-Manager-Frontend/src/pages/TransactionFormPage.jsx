import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, apiMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import AllocationRepair from "../components/AllocationRepair";
import { splitAmount, completeShares, expenseTotal } from "../utils/finance";
import { Badge, ErrorPanel, LoadingBlock, PageHeader } from "../components/Ui";
import { useToast } from "../components/Toast";
import { percentage, inputDate, localToday, isMoneyPrecisionSafe, money, paidAmountOf, partnerIdOf, partnerNameOf } from "../utils/format";

const earningSources = ["Rent", "Trip", "Booking", "Bonus", "Other income"];
const expenseCategories = ["Fuel", "Service", "Repair", "Insurance", "Pollution", "Tax", "Tyres", "Cleaning", "Parking", "Toll", "Fine", "Other expense"];

export default function TransactionFormPage({ kind }) {
  const earning = kind === "earning";
  const base = earning ? "earnings" : "expenses";
  const amountKey = earning ? "amount" : "totalAmount";
  const labelKey = earning ? "source" : "category";
  const { id } = useParams();
  const editing = Boolean(id);
  const [searchParams] = useSearchParams();
  const presetCar = searchParams.get("car") || "";
  const { canWrite, isAdmin } = useAuth();
  const { show } = useToast();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [activePartners, setActivePartners] = useState([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const [partnersError, setPartnersError] = useState("");
  const [form, setForm] = useState({ car: presetCar, date: localToday(), label: "", amount: "", notes: "", type: "expense", __v: undefined });
  const [original, setOriginal] = useState(null);
  const [record, setRecord] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [settleAllOnCreate, setSettleAllOnCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settling, setSettling] = useState(false);
  const [error, setError] = useState("");
  const [correction, setCorrection] = useState({ partnerId: "", paidAmount: "", reason: "" });

  const hydrateRecord = useCallback((data) => {
    setRecord(data);
    const next = { car: data.carId || data.car?._id || "", date: inputDate(data.date), label: data[labelKey] || "", amount: (earning ? data.amount : expenseTotal(data)) ?? "", notes: data.notes || "", type: data.type || "expense", __v: data.__v };
    setForm(next); setOriginal(next);
    setSettlements((data.partners || []).map((row) => ({ partnerId: partnerIdOf(row), name: partnerNameOf(row), amount: row.amount, sharePercentage: row.sharePercentage, paidAmount: String(paidAmountOf(row)) })));
  }, [earning, labelKey]);

  useEffect(() => {
    if (!canWrite) { setLoading(false); return; }
    let current = true;
    setLoading(true);
    Promise.all([api.get("/cars", { params: { includeArchived: "true" } }), editing ? api.get(`/${base}/${id}`) : Promise.resolve(null)])
      .then(([carRes, recordRes]) => { if (!current) return; setCars(carRes.data); if (recordRes) hydrateRecord(recordRes.data); })
      .catch((err) => { if (current) setError(apiMessage(err)); }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [id, editing, base, canWrite, hydrateRecord]);

  useEffect(() => {
    if (!form.car || editing) { setActivePartners([]); return; }
    const controller = new AbortController();
    setActivePartners([]); setPartnersLoading(true); setPartnersError("");
    api.get(`/partners/car/${form.car}`, { params: { status: "Active" }, signal: controller.signal })
      .then(({ data }) => { if (!controller.signal.aborted) setActivePartners(data); })
      .catch(err => { if (!controller.signal.aborted) setPartnersError(apiMessage(err, "Unable to read partner shares")); })
      .finally(() => { if (!controller.signal.aborted) setPartnersLoading(false); });
    return () => controller.abort();
  }, [form.car, editing]);

  const shareTotal = useMemo(() => activePartners.reduce((sum, p) => sum + Number(p.sharePercentage || 0), 0), [activePartners]);
  const hasRecordedPayments = useMemo(() => (record?.partners || []).some((row) => paidAmountOf(row) > 0), [record]);
  const unsafeLegacySettlement = useMemo(() => settlements.some((row) => !row.partnerId || !isMoneyPrecisionSafe(row.amount)), [settlements]);
  const allocationBlocked = !editing && (partnersLoading || Boolean(partnersError) || (activePartners.length > 0 && !completeShares(activePartners)));
  const allocationPreview = useMemo(() => { try { return splitAmount(form.amount || 0, activePartners); } catch { return []; } }, [form.amount, activePartners]);
  const archivedRecord = Boolean(editing && record?.car?.archived);

  if (!canWrite) return <ErrorPanel message="Your Viewer role can view financial records but cannot create or edit them." />;
  if (error && !cars.length && !record) return <ErrorPanel message={error} onRetry={() => window.location.reload()} />;
  if (loading) return <LoadingBlock label={`Loading ${earning ? "earning" : "expense"}…`} />;
  if (record?.missingCar) return <ErrorPanel message="This historical record points to a missing car and is review-only. It cannot be edited through the normal transaction workflow." />;

  const change = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault(); if (saving || settling || allocationBlocked || archivedRecord) return; setSaving(true); setError("");
    try {
      if (!isMoneyPrecisionSafe(form.amount)) throw new Error("Enter an amount with no more than two decimal places.");
      let payload;
      if (editing) {
        payload = { __v: form.__v, date: form.date, [labelKey]: form.label, notes: form.notes };
        if (Number(form.amount) !== Number(original.amount)) payload[amountKey] = form.amount;
      } else {
        payload = { car: form.car, date: form.date, [labelKey]: form.label, [amountKey]: form.amount, notes: form.notes, ...(!earning ? { type: form.type } : {}) };
      }
      const response = editing ? await api.put(`/${base}/${id}`, payload) : await api.post(`/${base}`, payload);
      let saved = response.data;
      if (!editing && settleAllOnCreate && saved.partners?.length) {
        const settlementPayload = { __v: saved.__v, partners: saved.partners.map((row) => ({ partnerId: partnerIdOf(row), amount: row.amount, paidAmount: row.amount })) };
        try { saved = (await api.put(`/${base}/${saved._id}`, settlementPayload)).data; }
        catch (settlementError) {
          show(`Transaction saved. Settlement failed: ${apiMessage(settlementError)}. Open the saved record to retry settlement; do not create it again.`, "warning");
          navigate(`/${base}/${saved._id}/edit`); return;
        }
      }
      show(`${earning ? "Earning" : "Expense"} ${editing ? "updated" : "added"}`, "success");
      if (editing) hydrateRecord(saved);
      else navigate(`/${base}?car=${saved.carId || saved.car?._id || form.car}`);
    } catch (err) { setError(apiMessage(err)); }
    finally { setSaving(false); }
  };

  const saveSettlement = async () => {
    if (saving || settling) return;
    setSettling(true); setError("");
    try {
      if (settlements.some(row => !isMoneyPrecisionSafe(row.paidAmount) || Number(row.paidAmount) > Number(row.amount) || Number(row.paidAmount) < paidAmountOf(record.partners.find(p => partnerIdOf(p) === row.partnerId)))) throw new Error("Payments must have at most two decimals, stay within the allocation, and cannot decrease. Use an admin correction for entry mistakes.");
      const payload = { __v: record.__v, partners: settlements.map((row) => ({ partnerId: row.partnerId, amount: row.amount, paidAmount: row.paidAmount })) };
      const { data } = await api.put(`/${base}/${id}`, payload);
      hydrateRecord(data); show("Partner settlement updated", "success");
    } catch (err) { setError(apiMessage(err)); }
    finally { setSettling(false); }
  };

  const markAllFull = () => setSettlements((rows) => rows.map((row) => ({ ...row, paidAmount: String(row.amount) })));

  const correctPayment = async (e) => {
    e.preventDefault(); setSettling(true); setError("");
    try {
      const { data } = await api.post(`/${base}/${id}/payment-correction`, { partnerId: correction.partnerId, paidAmount: correction.paidAmount, reason: correction.reason, __v: record.__v });
      hydrateRecord(data); setCorrection({ partnerId: "", paidAmount: "", reason: "" }); show("Payment correction recorded in audit history", "success");
    } catch (err) { setError(apiMessage(err)); }
    finally { setSettling(false); }
  };

  return <div>
    <PageHeader eyebrow="Finance" title={`${editing ? "Edit" : "Add"} ${earning ? "earning" : "expense"}`} description={earning ? "Record income and track distribution to partners." : "Record costs and track partner contributions."} actions={<Link className="btn btn-outline" to={`/${base}${form.car ? `?car=${form.car}` : ""}`}>Cancel</Link>} />
    {error && <div className="alert alert-danger">{error}</div>}
    {record?.dataWarnings?.length > 0 && <div className="alert alert-warning"><strong>Historical data review:</strong> {record.dataWarnings.join(" ")}</div>}
    {archivedRecord && <div className="alert alert-warning">This transaction belongs to an archived car. Restore the car before normal edits or settlement updates. Admin payment correction remains available for a verified historical entry mistake.</div>}
    {editing && hasRecordedPayments && <div className="info-strip"><strong>Payment protection is active.</strong> Allocation amounts and transaction total cannot be recalculated after partner payments have been recorded.</div>}
    {editing && !hasRecordedPayments && <div className="info-strip"><strong>Total changes:</strong> if you change the amount, the backend will recalculate allocations from the car’s current active partner shares. Those shares must total 100%.</div>}

    <form className="form-layout" onSubmit={submit}>
      <section className="panel form-panel">
        <div className="panel-heading"><div><h2>{earning ? "Income details" : "Expense details"}</h2><p>Core transaction information</p></div></div>
        <div className="form-grid two">
          <label className="field"><span>Car *</span><select name="car" value={form.car} onChange={change} disabled={editing} required><option value="">Select car</option>{cars.map((c) => <option key={c._id} value={c._id} disabled={c.archived}>{c.carName} · {c.carNumber}{c.archived ? " (Archived)" : ""}</option>)}</select>{editing && <small>Financial records cannot move between cars.</small>}</label>
          <label className="field"><span>Date *</span><input type="date" name="date" value={form.date} onChange={change} required /></label>
          {!earning && <label className="field"><span>Transaction type</span><select name="type" value={form.type} onChange={change} disabled={editing}><option value="expense">Expense</option><option value="income">Legacy income / adjustment</option></select><small>Use Earnings for normal new income. Legacy income is kept separate in reports.</small></label>}
          <label className="field"><span>{earning ? "Source" : "Category"} *</span><input name="label" list={`${kind}-suggestions`} value={form.label} onChange={change} maxLength="120" placeholder={earning ? "Rent" : "Fuel"} required /><datalist id={`${kind}-suggestions`}>{(earning ? earningSources : expenseCategories).map((x) => <option value={x} key={x} />)}</datalist></label>
          <label className="field"><span>Amount (₹) *</span><input name="amount" disabled={editing && hasRecordedPayments} type="number" min="0.01" step="0.01" value={form.amount} onChange={change} required /></label>
          <label className="field full"><span>Notes</span><textarea name="notes" value={form.notes} onChange={change} maxLength="2000" rows="3" placeholder="Optional details…" /></label>
        </div>
      </section>

      {!editing && form.car && <section className="panel form-panel">
        <div className="panel-heading"><div><h2>Automatic partner allocation</h2><p>The backend calculates exact paise-level splits from active ownership shares.</p></div><Badge tone={completeShares(activePartners) || activePartners.length === 0 ? "success" : "warning"}>{activePartners.length ? `${percentage(shareTotal)}% total` : "No partners"}</Badge></div>
        {partnersError && <div className="alert alert-danger">Could not load partner shares: {partnersError}. Select the vehicle again or refresh to retry.</div>}{partnersLoading && <p className="muted">Loading partner shares…</p>}
        {activePartners.length ? <div className="settlement-table">{activePartners.map((p) => <div className="settlement-row" key={p._id}><div><strong>{p.name}</strong><small>{percentage(p.sharePercentage)}%</small></div><div className="right"><strong>{money(allocationPreview.find(r => r.partnerId === p._id)?.amount)}</strong><small>Exact paise allocation</small></div></div>)}</div> : <div className="muted">No active partners. The transaction can still be saved as unallocated.</div>}
        {allocationBlocked && <div className="alert alert-warning"><span>Active shares must total 100% before the backend can automatically allocate this transaction. Fix the partner shares first.</span><Link className="btn btn-outline btn-sm" to={`/partners?car=${form.car}`}>Review partners</Link></div>}
        <label className="check-card"><input type="checkbox" checked={settleAllOnCreate} onChange={(e) => setSettleAllOnCreate(e.target.checked)} /><span><strong>Mark all partner allocations fully settled after saving</strong><small>{earning ? "Use when all partner distributions have already been paid." : "Use when all partner contributions have already been received."}</small></span></label>
      </section>}

      <div className="sticky-form-actions"><Link className="btn btn-outline" to={`/${base}${form.car ? `?car=${form.car}` : ""}`}>Cancel</Link><button className="btn btn-primary btn-lg" disabled={saving || settling || allocationBlocked || archivedRecord}>{saving ? "Saving…" : editing ? "Save transaction" : `Add ${earning ? "earning" : "expense"}`}</button></div>
    </form>

    {editing && record && <AllocationRepair record={record} base={base} total={earning ? record.amount : expenseTotal(record)} disabled={saving || settling || archivedRecord} onSaved={(data) => { hydrateRecord(data); show("Allocation repaired and audited", "success"); }} />}

    {editing && <section className="panel form-panel section-gap">
      <div className="panel-heading"><div><h2>Partner settlement</h2><p>{earning ? "Track how much of each partner allocation has been distributed." : "Track how much of each partner allocation has been contributed."}</p></div>{settlements.length > 0 && <button className="btn btn-outline btn-sm" onClick={markAllFull}>Mark all full</button>}</div>
      {unsafeLegacySettlement && <div className="alert alert-warning">This record contains a missing partner or legacy allocation precision that cannot be safely rewritten through strict validation. Review the data before changing partner payments.</div>}
      {settlements.length ? <div className="settlement-table editable">{settlements.map((row, index) => {
        const paid = Number(row.paidAmount || 0), allocated = Number(row.amount || 0);
        return <div className="settlement-row" key={`${row.partnerId}-${index}`}><div><strong>{row.name}</strong><small>{row.sharePercentage != null ? `${percentage(row.sharePercentage)}% snapshot` : "Historical allocation"}</small></div><div className="allocation-cell"><span>Allocated</span><strong>{money(allocated)}</strong></div><label className="mini-field"><span>{earning ? "Distributed" : "Contributed"} ₹</span><input type="number" min="0" max={allocated} step="0.01" value={row.paidAmount} onChange={(e) => setSettlements((rows) => rows.map((r, i) => i === index ? { ...r, paidAmount: e.target.value } : r))} /></label><div className="settlement-status"><Badge tone={paid >= allocated && allocated > 0 ? "success" : paid > 0 ? "blue" : "neutral"}>{paid >= allocated && allocated > 0 ? "Settled" : paid > 0 ? "Partial" : "Pending"}</Badge></div></div>;
      })}</div> : <div className="muted">No partner allocations are attached to this transaction.</div>}
      {settlements.length > 0 && <div className="panel-actions"><button className="btn btn-primary" disabled={saving || settling || unsafeLegacySettlement || archivedRecord} onClick={saveSettlement}>{settling ? "Saving…" : "Save settlement"}</button><small className="muted">Normal updates can increase recorded payments but cannot reduce them.</small></div>}
    </section>}

    {editing && isAdmin && settlements.length > 0 && !unsafeLegacySettlement && <section className="panel form-panel section-gap danger-zone-soft">
      <div className="panel-heading"><div><h2>Admin payment correction</h2><p>Use only to correct a verified payment-entry mistake. The reason and before/after values are audited.</p></div></div>
      <form className="form-grid two" onSubmit={correctPayment}>
        <label className="field"><span>Partner *</span><select value={correction.partnerId} onChange={(e) => setCorrection((v) => ({ ...v, partnerId: e.target.value }))} required><option value="">Select partner</option>{settlements.map((r) => <option key={r.partnerId} value={r.partnerId}>{r.name}</option>)}</select></label>
        <label className="field"><span>Correct cumulative amount (₹) *</span><input type="number" min="0" step="0.01" value={correction.paidAmount} onChange={(e) => setCorrection((v) => ({ ...v, paidAmount: e.target.value }))} required /></label>
        <label className="field full"><span>Correction reason *</span><textarea minLength="10" maxLength="500" rows="3" value={correction.reason} onChange={(e) => setCorrection((v) => ({ ...v, reason: e.target.value }))} placeholder="Explain the verified data-entry mistake (at least 10 characters)…" required /></label>
        <div className="full"><button className="btn btn-danger" disabled={saving || settling}>Record audited correction</button></div>
      </form>
    </section>}
  </div>;
}
