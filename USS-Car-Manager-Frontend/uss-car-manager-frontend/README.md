# USS Car Manager — Frontend 2.0.1

Responsive React/Vite frontend aligned with the supplied USS Car Manager backend 2.0.1.

## Included

- Staff login/logout with bearer-session handling and automatic expired-session cleanup.
- Admin / Manager / Viewer UI permissions matching backend roles.
- Dashboard for fleet, financial totals, reminders, outstanding partner distributions and recent transactions.
- Full car fields added by backend 2.0.1: status, year, odometer, next service km/date, insurance expiry, pollution expiry, notes and archive-aware views.
- Car archive/restore wording (backend DELETE archives; it does not erase financial history).
- Partner management with active/inactive status, high-precision percentages, bank/contact details for Admin, and guidance for 100% active shares.
- Earnings and expenses with search, car/date filters, pagination, historical warning badges and CSV export.
- Partial partner settlement controls using cumulative paidAmount.
- Admin-only audited payment correction workflow with mandatory reason.
- Historical missing-car records shown as review-only rather than reassigned.
- Legacy expense amount and allocation mismatch warnings surfaced from backend response fields.
- Reports: recorded surplus, legacy income, monthly movement, partner outstanding amounts, allocation differences and orphaned records.
- Maintenance/reminder screen for service, insurance, pollution and odometer-based due items.
- Admin audit-history screen.
- Mobile-first navigation and responsive cards/tables/forms.
- Compatibility redirects for the old frontend URLs.

## Run locally

Backend should be running at `http://localhost:5000`.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`) and sign in with a backend staff account.

## API URL

Localhost automatically uses `http://localhost:5000/api`. A deployed build falls back to the previous Render backend URL. For a different backend, set:

```dotenv
VITE_API_BASE_URL=https://your-backend.example.com/api
```

Never place admin passwords, MongoDB credentials or session tokens in frontend environment variables. The login token is kept in browser sessionStorage so a refresh stays signed in, but closing the browser session clears the frontend copy.

If you deploy the frontend to a new domain, also add that exact origin to the backend `CORS_ORIGINS` setting.

## Roles

- **Admin:** all UI actions, partners, archive/restore, delete eligible financial records, payment corrections and audit history.
- **Manager:** create/update cars and financial records; can record normal increasing partner settlement amounts.
- **Viewer:** read-only fleet, finance, partners, maintenance and reports.

The backend remains authoritative. Hidden buttons are convenience only; backend role checks still protect every write.

## Important financial behaviour

- `recordedSurplus` is recorded income (including legacy income) minus recorded expenses. It is not audited profit or a bank balance.
- Existing partner allocations remain historical snapshots when ownership percentages change.
- Normal settlement edits may increase cumulative partner payments but cannot reduce them. Admin payment correction is used for verified mistakes and requires a reason.
- Missing-car and legacy-allocation records are deliberately not auto-reassigned or silently rewritten.
