export const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const NUMBER = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function money(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? INR.format(n) : "₹0";
}

export function number(value) {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? NUMBER.format(n) : "0";
}

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

export function roundedMoney(value) {
  const n = Number(value ?? 0);
  return `${Number.isInteger(n) ? "" : "≈ "}${new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)}`;
}

export function inputDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : "";
}

export function displayDate(value, fallback = "—") {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })
    : fallback;
}

export function displayDateTime(value, fallback = "—") {
  if (!value) return fallback;
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : fallback;
}

export function carLabel(car) {
  if (!car) return "Missing car";
  return `${car.carName || "Car"}${car.carNumber ? ` · ${car.carNumber}` : ""}`;
}

export function roleLabel(role) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "User";
}

export function partnerIdOf(row) {
  return String(row?.partnerId?._id || row?.partnerId || "");
}

export function partnerNameOf(row) {
  return row?.partnerId?.name || "Missing partner";
}

export function paidAmountOf(row) {
  if (row?.paidAmount != null) return Number(row.paidAmount) || 0;
  return row?.paid ? Number(row.amount) || 0 : 0;
}

export function isMoneyPrecisionSafe(value) {
  return /^\d+(?:\.\d{1,2})?$/.test(String(value ?? "").trim());
}

export function errorStatus(error) {
  return error?.response?.status;
}

// Display only; the original share precision is retained for allocation.
export function percentage(value) { return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 4 }).format(Number(value || 0)); }
