# USS Car Manager frontend 2.1

This ZIP contains the complete updated React frontend and a production build. Use it with the supplied v2 backend. The backend source and database were not modified.

## Run on your computer

1. Extract the ZIP and open the `uss-car-manager-frontend` folder in VS Code.
2. Use Node.js 22.12+ (Vite 7 also supports Node 20.19+).
3. Copy `.env.example` to `.env`.
4. Set `VITE_API_BASE_URL=http://localhost:5000/api` for your local backend, or your deployed backend URL ending in `/api`.
5. Run:

```sh
npm ci
npm run dev
```

Log in with your existing backend account. No new default account or password is included.

## Deploy to Vercel

Replace the frontend source in your existing frontend repository with this folder's files. Retain any project-specific environment settings. Do not upload `node_modules` or `.env`.

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_API_BASE_URL` to your backend URL ending in `/api` before building.
- Keep `vercel.json` so direct page links work.
- Keep your Cloudinary cloud name and unsigned upload preset settings for vehicle photos.
- Your backend must allow your frontend origin through its existing CORS configuration.

The existing fallback API URL is retained: `https://uss-car-manager-f0gv.onrender.com/api`. An explicit environment variable is recommended. Environment changes require rebuilding.

## Dashboard figures

All dashboard records come from your API; the app ships without sample data.

- **Total income:** earnings plus legacy income recorded in the Expense collection.
- **Total expenses:** expense-type transactions, excluding legacy income.
- **Recorded surplus:** total income minus expenses. This is not a bank balance or audited profit.
- **Partner income to distribute:** outstanding earnings and legacy-income allocations.
- **Contributions due:** outstanding partner expense allocations.
- Fleet status and upcoming maintenance use current vehicle information, independent of the financial date filter.
- All-car financial totals include retained history for archived or missing cars.

Choose all time, this month or this year, and optionally one vehicle. Refresh rereads the API. Missing or inconsistent summary data produces an error instead of fabricated zero values.

## The ₹19,000 / ₹18,999 issue

The supplied frontend already read transaction totals, and the supplied backend already used exact allocation for new records. Without reading your live database, the exact historical cause cannot be established. A stored allocation difference must not be hidden by rounding.

New previews use the same algorithm as your supplied backend. Three equal shares of ₹19,000 become:

- ₹6,333.34
- ₹6,333.33
- ₹6,333.33

The sum is exactly ₹19,000. Calculations use integer paise. Whole amounts display as `₹19,000`; fractional amounts retain their paise. The dashboard's optional rounded display uses an `≈` indicator and never changes stored amounts.

### Repair an existing unpaid allocation

1. Open Reports → Records needing allocation review, or Earnings/Expenses → Edit & settle.
2. Find **Allocation reconciliation**.
3. Review current and proposed amounts.
4. Choose **Review & repair allocation**, then confirm.

The existing update API saves the corrected split and records the update in audit history. It uses the transaction's stored ownership percentages, not silently substituted current ownership.

Repair is intentionally unavailable if payments already exist, partner references are missing, snapshot percentages do not total 100%, old monetary precision cannot pass the backend validator, or the car is archived. These require a verified data review; a frontend ZIP cannot safely rewrite protected financial history. Do not reset legitimate payments just to enable repair. If the transaction total itself is stored as ₹18,999, verify the source record before changing it to ₹19,000.

## Audit history

Admin accounts can see audit history. It reads `/api/reports/audit` and shows the actor, event time, changed fields, before/after values, correction reasons and original snapshots.

The backend cannot reconstruct audit events for changes made before logging existed. An empty response gets a clear explanation. A null or malformed response gets an error, not a blank screen. Save a legitimate change and refresh; if history remains empty, confirm your running backend is the supplied version and uses the same database. The frontend never invents audit events.

## Recording improvements

- Exact automatic-allocation previews and share validation.
- Partial/full partner settlements and admin payment corrections retained.
- Paid transaction totals locked in the form, matching backend protection.
- No second creation when the initial save succeeds but settlement fails: the app opens the saved record for retry.
- Partner requests cancel when switching vehicles; failed share lookups block saving.
- Financial and list filters ignore stale responses.
- Separate source and category forms reset correctly when navigating between record types.
- Legacy-income transactions show a positive sign, and reports include their partner positions.
- Search, date/vehicle filters, clear filters, CSV exports, printable reports and per-record audit links.
- Responsive navigation, keyboard-accessible confirmations, subtle transitions and reduced-motion support.

## Checks

```sh
npm test
npm run lint
npm run build
```

The included tests cover exact money arithmetic, three-way ₹19,000 allocation, stable remainder handling, legacy fallbacks, payment flags and report validation. See `VALIDATION.md` for the checks performed during this update.
