# Compatibility update 2.0.1 — install over the earlier package

1. Stop the backend with Ctrl+C if running. Keep a backup of the current folder and your Atlas database.
2. Extract this revised ZIP. Copy the CONTENTS of its `uss-car-manager-backend` folder into your existing backend folder, replacing files and including the new files in `utils` and `tests`.
3. Keep your actual `.env` unchanged. The ZIP contains only `.env.example`; it does not contain or replace `.env`. Continue using your existing Atlas URL.
4. No dependencies changed from version 2.0.0, so if `npm ci` already succeeded you do not need to install again for this patch.
5. Run `npm test`, then `npm run audit-data`.

Expected differences in the new audit:

- Your approximately 33.3333333333% shares should no longer be rejected for having more than two decimals.
- Older expense records with `amount` but no `totalAmount` now appear as compatibility notices rather than invalid totals.
- Missing-car references and true allocation differences remain reported. The update does not erase them or pretend they were reconciled.
- Existing percentages, transaction amounts, partner allocations and paid flags are not rewritten by installing this code or running the audit.

The revised audit may show more allocation differences for legacy expenses, because it can now read their amounts and continue checking them. This does not mean new discrepancies were introduced.

After reviewing the report, the existing registration preparation command can add keys without changing financial amounts:

```powershell
npm run audit-data -- --prepare-registration-keys
```

Run it with the old backend stopped and a backup available. Duplicate/invalid registrations block this command; other reported historical findings remain visible. Exit code 2 means issues remain, even if key preparation succeeded. Check the printed success message.

Next create your admin account (if not already created), start the backend, and update frontend login before using the app. The main README covers these steps.

## What still needs business review

- For the example expense, 22,800 minus 7,599 × 3 = 3 rupees of allocation difference. Existing paid amounts remain 7,599 each.
- For the example earning, 15,200 minus 2,667 × 3 = 7,199 rupees of allocation difference. This is not automatically classified as unpaid money or profit; it may represent intentional retained funds, deductions or an entry mistake. Existing paid amounts remain 2,667 each.
- Records referencing deleted cars remain in the database. The application does not infer that they belong to Swift or Toyota.

The patch supports reading and displaying those records while preserving the need to review the differences. A dedicated retained-funds/deduction ledger and reviewed reassignment/correction workflow would be separate changes.

## Validation

22 non-database tests passed, including regression tests for the supplied record shapes and amount differences. Full live MongoDB integration remains unverified in this execution environment because the temporary MongoDB process could not start. No connection was made to your Atlas database here.
