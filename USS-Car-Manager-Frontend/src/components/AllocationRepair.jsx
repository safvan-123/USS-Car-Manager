import { useState } from 'react';
import { api, apiMessage } from '../api/client';
import { money, paidAmountOf, partnerIdOf, partnerNameOf, isMoneyPrecisionSafe } from '../utils/format';
import { splitAmount, sumMoney, subtractMoney } from '../utils/finance';
import { ConfirmDialog } from './Ui';
export default function AllocationRepair({ record, base, total, disabled, onSaved }) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rows = record.partners || [];
  if (!rows.length) return null;
  const allocated = sumMoney(rows.map(r=>r.amount));
  const difference = subtractMoney(total, allocated);
  if (!difference) return null;
  let preview = [], reason = '';
  if (rows.some(r => paidAmountOf(r) > 0)) reason = 'Payments have already been recorded. The backend protects this allocation from changes. A verified backend data correction is needed; display rounding cannot repair it.';
  else if (rows.some(r=> !isMoneyPrecisionSafe(r.amount) || !r.partnerId || (typeof r.partnerId === 'object' && !r.partnerId._id))) reason = 'This historical record has unsupported precision or a missing partner. It needs a backend data review before repair.';
  else {
    try { preview = splitAmount(total, rows.map(r=>({_id:partnerIdOf(r), name:partnerNameOf(r), sharePercentage:r.sharePercentage}))); }
    catch { reason = 'The stored share percentages do not total 100%. Review the historical ownership shares before repairing this allocation.'; }
  }
  const repair = async () => {
    setBusy(true); setError('');
    try { const {data} = await api.put(`/${base}/${record._id}`, { __v: record.__v, partners: preview.map(r=>({partnerId:r.partnerId,amount:r.amount,paidAmount:0})) }); onSaved(data); setConfirm(false); }
    catch (e) { setError(apiMessage(e)); }
    finally { setBusy(false); }
  };
  return <section className="panel section-gap repair-panel"><div className="panel-heading"><div><div className="eyebrow">Resolve a difference</div><h2>Allocation reconciliation</h2><p>Transaction: {money(total)} · Allocated: {money(allocated)} · Difference: {money(difference)}</p></div></div>{reason ? <div className="alert alert-warning">{reason}</div> : <><p className="muted">Rebalance this unpaid record using its stored ownership percentages. The remaining paise are assigned consistently so all shares add up exactly to the transaction total.</p><div className="transaction-table-wrap"><table className="data-table"><thead><tr><th>Partner</th><th className="right">Current</th><th className="right">After repair</th></tr></thead><tbody>{preview.map(p=><tr key={p.partnerId}><td>{p.name}</td><td className="right">{money(rows.find(r=>partnerIdOf(r)===p.partnerId)?.amount)}</td><td className="right">{money(p.amount)}</td></tr>)}</tbody><tfoot><tr><th>Total</th><th className="right">{money(allocated)}</th><th className="right">{money(sumMoney(preview.map(r=>r.amount)))}</th></tr></tfoot></table></div><button className="btn btn-primary" onClick={()=>setConfirm(true)} disabled={disabled || busy}>Review & repair allocation</button></>}{error && <div className="alert alert-danger">{error}</div>}<ConfirmDialog open={confirm} title="Save the corrected allocation?" message={`This saves the amounts shown above against the unchanged transaction total of ${money(total)}. No payments are changed. The backend records this update in audit history.`} confirmText="Save corrected allocation" tone="primary" onConfirm={repair} onCancel={()=>!busy && setConfirm(false)} busy={busy} /></section>;
}
