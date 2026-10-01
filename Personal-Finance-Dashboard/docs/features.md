# Feature guide

| Screen | Working behavior |
| --- | --- |
| Overview | Live account balances, selected-month income/expense/savings rate, 2026 cash flow, category donut, budgets, goals, recent transactions and bills |
| Accounts | Create bank/savings/cash/investment accounts, opening balances, transfers between distinct accounts |
| Transactions | Add/edit/delete, month/type/category/account filters, merchant/note search, CSV export of filtered rows |
| CSV import | Local file parsing, column mapping, account selection, row validation, existing and within-file duplicate rejection, valid-row preview and commit; sample download |
| Budgets | Create/remove, edit monthly limits, toggle rollover, computed remaining amounts |
| Savings goals | Create/remove, target dates, contributions, progress; earmarks only, no account ledger effect |
| Bills | Add monthly/yearly recurring bills, pause/resume/remove, mark paid creates expense and advances date |
| Reports | Surplus, recurring commitments, 3-month historical-average scenario and category outliers |
| Automations | Honest runner status, local queued report, simulated execution/retries, JSON queue export |
| Settings / login | Theme, backup export, reset with confirmation, email sign-in/registration/Google OAuth when configured, explicit cloud load/sync |

## Workspace controls

The desktop sidebar uses a visible arrow to collapse/expand and remembers the choice. It stays visible when selecting a page. Mobile drawer behavior starts at 700px and includes a close button, backdrop, Escape and intentional close after page selection. The Workspace breadcrumb returns to Overview from any screen. The avatar opens an accessible account menu: signed-out demo shows Sign in, Create account and Exit demo; real sessions show Account settings and Sign out, plus Exit demo when the data is still fictional. Auth actions open usable forms; absent credentials are explicitly explained. The AP demo identity is fictional.

Account balances cover all recorded dates. Month filters apply to income/expense/reporting, not the balance ledger. Transfers debit the source and credit the destination but never count as income or expense. Savings rate = `(income-expense)/income`; with no income it displays zero.

CSV dates must be `YYYY-MM-DD`; amounts must be positive with at most two decimal places. Use a `kind` column of `income`/`expense`, or let every row default to expense. Explicitly map bank-specific headers. Transfers are recorded separately. Dedup uses normalized merchant, date, amount, kind and account(s). Two legitimate identical purchases require manual entry. Exports escape spreadsheet formulas. Import supports up to 2 MB; preview displays first 100 rows and commits all valid rows.

Rollover starts with the earliest recorded month and carries unused category allowance month by month; overspending never becomes debt. A budget currently applies retrospectively to recorded history, not from a tracked creation date. Changing limits recalculates historical carry. Forecast averages the last three recorded months at/before the selected month; it assumes unchanged income/spending, no inflation/interest and adds surplus to current all-date account balance. Unusual spending needs 3 previous expenses in a category and flags >1.8× that category's historical per-transaction average.

Mark paid represents recording a payment you made elsewhere. There are no banking APIs or automatic payments. Goal contributions represent earmarked savings and can exceed targets. Transactions may produce negative balances. This app has no investment pricing, credit reconciliation, currency conversion or tax engine.
