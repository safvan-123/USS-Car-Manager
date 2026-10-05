# USS Car Manager frontend upgrade summary

This frontend was rebuilt against the supplied `uss-car-manager-backend` version 2.0.1.

## Backend 2.0.1 coverage

| Backend capability | Frontend coverage |
| --- | --- |
| `/api/auth/login`, `/me`, `/logout` | Login screen, session validation, logout and expired-session handling |
| Admin / Manager / Viewer | Role-aware buttons and protected Admin screens |
| Car status/year/odometer/service/expiry/notes | Add/edit/detail/list + Maintenance screen |
| Unique normalized registration | Form guidance + backend error surfaced to user |
| Car archive/restore | Admin Archive/Restore controls; wording explains history is retained |
| Partner status/share/contact/bank | Admin forms; share-total preview; bank fields on Admin detail fetch |
| Exact partner allocation | Create form relies on backend exact split and shows share preview |
| Partial `paidAmount` | Edit transaction settlement table |
| Paid-record protection | UI warning; normal settlement only increases; backend errors shown |
| Admin payment correction | Dedicated correction section with mandatory reason |
| Legacy expense `amount` compatibility | Legacy badges/warnings and effective `totalAmount` display |
| Missing car references | Historical records marked Missing car and made review-only |
| Allocation mismatch flags | Warning cards, difference display and report review list |
| Search/date/status/type filters | Cars, partners, earnings, expenses |
| Optional pagination | Earnings and expenses use 25-record pages |
| Summary report | Dashboard + full Reports screen |
| Reminder endpoint | Dashboard + dedicated Maintenance & renewals screen |
| CSV export | Earnings and Expenses export buttons |
| Audit log | Admin Audit History screen |
| Optimistic `__v` checks | Edit forms and settlement/correction requests send current version |

## Deliberate decisions

- No frontend action pretends to permanently delete a car. Backend DELETE archives it, so the UI says **Archive**.
- No UI silently reallocates or fixes historical mismatches/missing-car records.
- No generic “mark unpaid” action reduces a recorded payment. Reductions use the Admin correction endpoint and audit reason.
- No fake booking, deposit, receipt-upload, notification, password-reset or user-management pages were added because backend 2.0.1 does not implement those data models/endpoints.
- Old frontend route URLs are redirected to their new equivalents so bookmarks remain useful.
