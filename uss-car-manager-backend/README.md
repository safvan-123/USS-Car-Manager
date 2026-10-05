# USS Car Manager — backend update 2.0.1

**Already installed version 2.0.0? Read `START-HERE-UPDATE.md` first.**

This is a coordinated replacement backend based on the code supplied in this conversation. It uses CommonJS, Express and Mongoose, keeps the existing resource paths, and adds authentication, validation, financial safeguards, reporting and vehicle reminder fields.

**Start with a separate test database. Do not point this version at your only live database or replace the live backend before updating frontend authentication.** The data audit never repairs financial amounts automatically.

## 1. What is included

- Existing car, earning, expense and partner CRUD paths.
- Login, logout, eight-hour server-side sessions, hashed passwords and admin/manager/viewer roles.
- Server-side field allowlists, ID/date/amount validation and consistent errors.
- Normalised unique car registration keys; vehicle status, year, odometer, service and expiry fields.
- Archive/restore for cars, retaining linked records.
- Exact automatic partner allocation in paise, including a deterministic rounding remainder and compatibility with approximately one-third shares.
- Partner membership checks, duplicate allocation rejection and allocation-total checks.
- Partial partner payment amounts; existing boolean paid records remain readable.
- Payment preservation during notes/date changes. Paid allocations cannot be silently recalculated.
- Admin payment corrections requiring a reason, with before/after audit records.
- Partner percentage changes apply to future transactions; existing allocation snapshots remain unchanged.
- Transactional audit history for writes; protected deletion of linked partners and paid transactions.
- Search, date filters and optional pagination while preserving array list responses.
- Monthly summaries, partner allocation/outstanding summaries, reminder lists and CSV exports.
- Data audit and explicit preparation of registration keys for existing cars.
- Unit, schema, HTTP-guardrail and optional database integration tests.

This release provides the backend foundation. It does **not** implement a booking engine, customer balances/deposits, receipt uploads, full maintenance history, automated email/WhatsApp notifications, a frontend login screen, user-management UI, or a mobile layout. Reminder endpoints return due items; they do not send notifications. Those require the next frontend/backend feature iterations.

## 2. Important compatibility changes

| Change | Frontend/operational action |
| --- | --- |
| Every `/api` resource requires login | Call `/api/auth/login`, then send `Authorization: Bearer TOKEN` on every request |
| Car DELETE archives | Label action “Archive”; refresh the car list after success |
| Bank details hidden in lists/populates | Admin can retrieve them using `GET /api/partners/:id` |
| Partner/financial records cannot move between cars | Create the correct record; review corrections separately |
| Negative amounts, excessive decimals, invalid IDs/dates rejected | Show `response.data.message` in the form |
| Automatic allocation requires active shares totalling 100%, allowing tiny numeric precision differences | Review percentages; manually supplied amounts must total the transaction exactly |
| Paid allocations are protected | Use admin payment correction for a verified payment-entry error |
| `paidAmount` introduced | Build partial-payment controls; `paid` is derived when an allocation is updated |
| MongoDB transactions required | Use Atlas or a replica set; standalone MongoDB is not supported by this version |
| Vehicle images accept HTTP(S) URLs or `/relative-path` | Base64 image uploads require a later dedicated upload implementation |

Existing legacy income entries in the Expense collection are retained. Reports show their total separately and include it in `recordedSurplus`. Do not also record the same income in Earnings.

This is a **single-business application**. All enabled users can view the fleet. “Viewer” is a staff role, not a partner-only restricted portal. Do not give a partner a viewer login if they should see only their own records. Multi-business isolation and per-partner access are not implemented.

## 3. Windows setup, step by step

1. Back up your existing code and database. Extract this ZIP into a separate folder, outside the existing backend. Keep the old backend available for comparison.
2. Open the extracted backend folder in VS Code. Use a terminal in the folder containing this `package.json`.
3. Install dependencies from the included lockfile:

```powershell
npm ci
Copy-Item .env.example .env
```

4. Edit `.env`. Set `MONGO_URI` to a **test database** on your Atlas cluster or local replica set. Keep actual credentials out of Git. Set `CORS_ORIGINS` to the exact frontend origins, with no trailing slash.
5. If testing existing data, restore a backup into this separate database. Stop any other server writing to that test database while running preparation.
6. Run the audit:

```powershell
npm run audit-data
```

It prints IDs and issues: duplicate registration numbers, missing references, allocation mismatches, percentages and unsupported fractional amounts. Exit code `2` means findings require review; `1` means the script failed; `0` means no audit findings.

7. For existing cars, prepare their registration keys after checking duplicates:

```powershell
npm run audit-data -- --prepare-registration-keys
```

This explicit operation adds/updates `registrationKey` and creates the uniqueness index. It does not change car IDs, transaction amounts, partner allocations or paid flags. Duplicate/invalid registration numbers block preparation. Other audit findings still print and return exit code `2` even when registration preparation succeeded. The server refuses to start if cars are missing registration keys; review every other audit finding before live deployment.

8. Set these values in your local `.env`:

```dotenv
CREATE_USER_NAME=Your Name
CREATE_USER_EMAIL=your-email@example.com
CREATE_USER_PASSWORD=replace-with-a-unique-long-password
CREATE_USER_ROLE=admin
```

Use a unique password of at least 12 characters. Then:

```powershell
npm run create-user
```

Remove `CREATE_USER_PASSWORD` from `.env` after success. The script creates a user; it does not overwrite existing users or reset their passwords. Repeat with different email/role values to add staff. Account reset and role-management screens are not included.

9. Run tests and start:

```powershell
npm test
npm run dev
```

Open `http://localhost:5000/health`; expect `{"status":"ok"}`. `npm start` runs the server without watching files.

10. Use Postman or PowerShell to test login and API calls until the frontend login is implemented. Example PowerShell:

```powershell
$loginBody = @{ email = "your-email@example.com"; password = "your-test-password" } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/auth/login" -ContentType "application/json" -Body $loginBody
$headers = @{ Authorization = "Bearer $($login.token)" }
Invoke-RestMethod -Uri "http://localhost:5000/api/cars" -Headers $headers
```

Use test credentials in examples and clear variables/terminal history as appropriate. Never paste a real token or password into this chat or commit it.

## 4. Files and naming

```text
app.js                         Express app and middleware
server.js                      Startup, index preparation and shutdown
config/db.js                   MongoDB connection
models/Car.js                  Cars and reminder fields
models/Earning.js              Earnings and partner allocations
models/Expense.js              Expenses and partner allocations
models/partnerModel.js         Partners
models/User.js                 Staff accounts
models/Session.js              Revocable sessions
models/AuditLog.js             Change history
models/shared.js               Shared schema fields
controllers/carController.js
controllers/partnerController.js
controllers/earningController.js
controllers/expenseController.js
controllers/financialController.js  Shared financial rules
controllers/reportController.js
routes/carRoutes.js
routes/partnerRoutes.js
routes/earningRoutes.js
routes/expenseRoutes.js
routes/authRoutes.js
routes/reportRoutes.js
middleware/auth.js
middleware/errors.js
utils/                         Validation, currency, queries and helpers
scripts/                       User creation and existing-data audit
tests/                         Checks and integration suite
```

Use these exact capitalisations, particularly `Earning.js`, `Expense.js`, `Car.js`, `partnerModel.js` and `expenseRoutes.js`. Linux deployments are case-sensitive. Your server imports `expenseRoutes.js`, so a filename such as `expenserouter.js` would not match.

## 5. API reference

Public:

| Method | Path | Body / purpose |
| --- | --- | --- |
| GET | `/health` | Connection readiness |
| POST | `/api/auth/login` | `{email,password}`; returns `{token,expiresAt,user}` |

Authenticated:

| Method | Path | Role |
| --- | --- | --- |
| GET | `/api/auth/me` | Any enabled user |
| POST | `/api/auth/logout` | Any enabled user; revokes current token |
| GET | `/api/cars`, `/api/cars/:id` | Any |
| POST / PUT | `/api/cars`, `/api/cars/:id` | Admin or manager |
| DELETE | `/api/cars/:id` | Admin; archive |
| POST | `/api/cars/:id/restore` | Admin |
| GET | `/api/partners`, `/api/partners/:id`, `/api/partners/car/:carId` | Any; bank details only in admin single-record response |
| POST / PUT / DELETE | `/api/partners`, `/api/partners/:id` | Admin |
| GET | `/api/earnings`, `/api/earnings/:id`, `/api/earnings/car/:carId` | Any |
| GET | `/api/expenses`, `/api/expenses/:id`, `/api/expenses/car/:carId` | Any |
| POST / PUT | `/api/earnings`, `/api/earnings/:id`, `/api/expenses`, `/api/expenses/:id` | Admin or manager |
| DELETE | `/api/earnings/:id`, `/api/expenses/:id` | Admin; only without recorded partner payments |
| POST | `/api/earnings/:id/payment-correction`, `/api/expenses/:id/payment-correction` | Admin; reason required |
| GET | `/api/reports/summary` | Any |
| GET | `/api/reports/reminders?days=30` | Any |
| GET | `/api/reports/transactions.csv?kind=expenses` | Any; `kind=earnings` also supported |
| GET | `/api/reports/audit` | Admin |

List responses remain arrays. Standard filters: `search`, `car`, `from=2026-10-01`, `to=2026-10-31`. Dates refer to transaction dates and use UTC boundaries; month grouping is UTC. Cars also support `status` and `includeArchived=true`; partners support `status`; expenses support `type`.

Pagination is opt-in using `?page=1&limit=25` (maximum 200 per page). Response headers include `X-Total-Count` and `X-Page`. Without page/limit all matching records are returned for compatibility. Once the frontend adopts pagination, use the summary endpoint for totals, not a sum of only the displayed page. Large-fleet scalability will need aggregation/streamed exports and bounded lists.

Summary accepts only `car`, `from`, and `to`. It includes retained missing-car records in totals and labels them in `orphanedRecords`; `orphanedTotals` is a subset of the overall totals, not an additional amount. `allocationDifferences` lists each mismatch even if positive and negative gaps cancel out in the overall total. Reminder days range is 0–365 and includes overdue items. Audit filters: `entity`, `entityId`, `page`, `limit`.

Examples of new optional car fields:

```json
{
  "carName": "Swift",
  "carNumber": "KL34F5202",
  "model": "Swift VXI",
  "year": 2019,
  "status": "Available",
  "odometer": 45000,
  "nextServiceKm": 50000,
  "nextServiceDate": "2026-12-01",
  "insuranceExpiry": "2027-01-01",
  "pollutionExpiry": "2026-11-15"
}
```

Existing `model` strings such as `"2019"` are retained; this package does not guess or rewrite them. Set the new `year` field explicitly. Use `null` to clear a reminder date.

## 6. Money and partner-payment rules

- API amounts remain rupee numbers, compatible with the old field names (`amount` for earnings; `totalAmount` for expenses). Incoming values may be numeric strings. Server calculations convert them to integer paise, and accepted values have at most two decimal places.
- Maximum transaction amount is INR 1,000,000,000. Stored rupee numbers are preserved for compatibility; migrate to integer-paise storage separately if desired.
- Automatic allocation uses **active** partners whose percentages total 100%, allowing at most 0.00000001 percentage points of numeric precision difference. Existing values such as 33.33333333333 are accepted and never rewritten merely to round them to two decimals. Calculation weights use up to 12 decimal places and are normalised for currency allocation only. Three shares of 33.33 still total 99.99 and do not pass automatic allocation. The final paise remainder is assigned deterministically. Manual amount allocations remain supported.
- To allocate automatically, omit `partners` when creating a transaction. A create request with `partners: []` also requests automatic allocation where active partners exist. An update cannot clear a non-empty allocation array; already-empty historical arrays are retained on unchanged-total edits.
- To create or change a manual allocation, provide every partner allocation; amounts must add up exactly to the total. An unchanged historical allocation can be retained on edit even when its existing sum differs; the API continues to flag the difference. A partner may occur once and must belong to that car. New allocations cannot use inactive partners.
- A car with no active partners may save a transaction with no allocations, explicitly marked `allocationStatus: unallocated`. If active partners exist but their percentages are incomplete, automatic allocation is rejected. Creating unallocated records for single-owner cars does not invent a partner or ownership share.
- Existing `paid: true` without `paidAmount` means the entire historical allocation was paid. `paid: false` means zero. No background migration resets those flags.
- A partial payment updates the **cumulative** `paidAmount`, not a new payment increment. Ordinary updates cannot decrease it. When both are supplied, `paidAmount` takes precedence over `paid`.
- Editing notes/date preserves allocation amounts and payments. Changing a total with no payments may recalculate shares using current active percentages; preview the result in the frontend before saving. Once any partner payment exists, allocation amounts/total cannot change through ordinary edit.
- A partner percentage change never rewrites historical transactions.
- `sharePercentage` on a transaction is the ownership snapshot at allocation time. Manual amount allocation can intentionally differ from ownership percentages.
- Supply the returned numeric `__v` on edits to reject stale forms. Legacy callers may omit it, but then stale scalar edits are not prevented. The new frontend should always supply it. Database transactions still serialise related writes and enforce percentage/reference checks.

Example manual earning request (IDs are placeholders):

```json
{
  "car": "CAR_ID",
  "date": "2026-10-05",
  "source": "Rent",
  "amount": 1000,
  "partners": [
    { "partnerId": "PARTNER_1_ID", "amount": 600, "paidAmount": 200 },
    { "partnerId": "PARTNER_2_ID", "amount": 400, "paidAmount": 0 }
  ]
}
```

For a payment update, send the complete allocation array with the current amounts and updated cumulative `paidAmount`, plus `__v`. Other transaction fields can be omitted.

Admin-only correction of a mistaken recorded payment:

```json
{
  "partnerId": "PARTNER_1_ID",
  "paidAmount": 150,
  "reason": "Correcting a verified data entry mistake",
  "__v": 2
}
```

POST this to the corresponding `/:id/payment-correction` endpoint. The reason must be at least 10 characters. This adjusts a recorded partner payment, not a bank transfer or refund. It records before/after values in the audit log.

Expense partner payments mean contributions toward an expense; earning partner payments mean distributions to partners. They do not record which partner physically paid a vendor, partner-to-partner reimbursements, or whether a customer paid the business. Those require separate ledger/payment features. The summary does not claim to calculate those settlements.

`recordedSurplus = earnings + legacy income - expenses`. This is not audited profit or cash balance and does not include unrecorded costs, tax, depreciation or other adjustments. Customer deposit accounting is outside this release.

## 7. Existing-data review

The supplied inspection confirms legacy expenses with `amount`, high-precision one-third shares, missing-car references and some allocation differences. Version 2.0.1 reads `totalAmount ?? amount` for expenses. It never adds both amounts or backfills the stored field merely by reading a record. API expense responses expose the effective `totalAmount` and flag `usesLegacyAmount`; a present `totalAmount` remains authoritative. Financial API responses also expose `carId`, `missingCar`, `allocationStatus`, `allocationDifference` and `dataWarnings`. Historical missing-car records remain read-only through ordinary edit endpoints until reviewed, and are never reassigned to an existing car automatically. Do not silently “fix” those by overwriting the database.

- Back up and review the IDs returned by the audit.
- If a record has unpaid allocations, use the normal edit API with an explicitly reviewed complete allocation array that totals correctly.
- Correct mistakenly entered paid amounts through the admin correction endpoint where the stored allocation is valid.
- Fractional legacy allocations (for example 22284.333333) are not automatically migrated. Summary reports round them for display and flag the issue. Strict edit validation can reject them; agree on the intended amounts/payment history before preparing a targeted repair.
- Orphaned car/partner references are retained and flagged; deciding their correct association or restoration requires a reviewed data repair. No fabricated partners or cars are inserted by this package.
- Deleted unpaid financial entries retain before-values in audit history. There is no generic one-click restore endpoint for them; car archive/restore is supported.
- Database backups remain necessary; audit history is not a backup.

## 8. Deployment and frontend integration

Use HTTPS at your hosting provider. Keep `.env` out of Git. `TRUST_PROXY_HOPS` defaults to 0; set it only to match your provider's actual trusted proxy arrangement. Login throttling is per process/IP; a multi-instance deployment needs a shared rate limiter or edge protection. There is no two-factor authentication or password-reset flow yet.

Use bearer tokens in memory in the frontend and require re-login after refresh for the initial implementation. Never put an admin password in frontend environment variables. A later cookie-based session design would also need its own cookie/CSRF configuration. Current tokens expire after eight hours and logout revokes the current token immediately.

Next frontend files to share: frontend `package.json`, `App.jsx`, API/Axios configuration, navbar, Cars page and related CSS. We will add login/token handling first, then the responsive shared layout, cards and forms. Protected pages should display 401/403 messages correctly rather than treating them as empty lists.

Before replacing the live backend, test the revised frontend against this version, resolve audit findings in a backed-up test copy, and repeat the reviewed preparation on the live database during a maintenance window. Do not run old and new backend writers against the same database simultaneously; the old backend bypasses these new protections.

## 9. Verification

At delivery:

- Syntax checks passed for all 41 JavaScript files.
- `npm test`: **22 tests passed** covering amount precision, allocation totals, legacy/partial payment handling, schemas, input parsing, CSV formula escaping, password checks, role guards, CORS, JSON/body limits and authentication guardrails. Added regression checks cover one-third shares, legacy expense fields, the reported allocation differences, missing-car reporting and edit protection (controller test uses database mocks).
- Test runtime: Node 24.19.0. The package permits Node >=20; a separate Node 20 run was not performed.
- The integration suite is included but **could not run its API assertions here**. Its isolated MongoDB process exited during startup with `open: Operation not permitted`. Database persistence, concurrent transactions and full login/CRUD workflows therefore remain unverified by a running database in this environment.
- Your live database, deployed backend and frontend were not accessed or modified.

On a machine that can run MongoDB binaries:

```powershell
npm run test:integration
```

This creates an isolated temporary replica set using a test-only dependency; it does not use `MONGO_URI`. Dependency installation or the first integration run may download a MongoDB binary. It exercises login, role restrictions, duplicate registration, concurrent percentage edits, allocations, payment corrections, archive/restore and reporting. Resolve failures before deploying.

Production installs can use `npm ci --omit=dev`; the in-memory MongoDB package is a development-only test dependency.

Technical references: [Mongoose validation](https://mongoosejs.com/docs/8.x/docs/validation.html) and [Mongoose transactions](https://mongoosejs.com/docs/transactions.html). Controllers load and save documents for full document validation and group related changes in transactions.
