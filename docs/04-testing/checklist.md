# QA Checklist — End-to-End Demo

> Prerequisite: MySQL running with seed data loaded from `database/seed/sample_data.sql`.
> Backend on `http://localhost:8080`, frontend on `http://localhost:5173`.

---

## Step 1 — Authentication

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 1.1 | POST `/api/v1/auth/login` with `{"username":"admin","password":"password"}` | 200 OK — JWT token returned | ☑ |
| 1.2 | POST `/api/v1/auth/login` with wrong password | 401 Unauthorized | ☑ |
| 1.3 | Log in as `staff1 / password` | 200 OK — role=STAFF in token | ☑ |
| 1.4 | Log in as `resident1 / password` | 200 OK — role=RESIDENT in token | ☑ |
| 1.5 | Call any protected endpoint without token | 401 Unauthorized | ☑ |

---

## Step 2 — Apartment Management

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 2.1 | GET `/api/v1/apartments` (as ADMIN) | 200 OK — 5 apartments returned | ☑ |
| 2.2 | GET `/api/v1/apartments/1` | Room A101, status OCCUPIED | ☑ |
| 2.3 | POST `/api/v1/apartments` with valid body (as ADMIN) | 201 Created | ☑ |
| 2.4 | POST with duplicate `roomNumber` | 400 / 409 error | ☑ |
| 2.5 | DELETE apartment that has linked fees | Should return error (FK constraint or service check) | ☑ |

---

## Step 3 — Resident & Household Management

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 3.1 | GET `/api/v1/residents` (as STAFF) | 200 OK — 9 residents returned | ☑ |
| 3.2 | GET `/api/v1/residents?status=INACTIVE` | 1 resident (Nguyễn Văn Cũ) | ☑ |
| 3.3 | GET `/api/v1/residents?search=Hoa` | Returns Lê Thị Hoa | ☑ |
| 3.4 | POST `/api/v1/residents` with valid body | 201 Created | ☑ |
| 3.5 | POST with duplicate `identityNumber` | 400 Bad Request — "already registered" | ☑ |
| 3.6 | POST with blank `fullName` | 400 Bad Request — validation error | ☑ |
| 3.7 | PATCH `/api/v1/residents/1/deactivate` | 200 OK — status becomes INACTIVE | ☑ |
| 3.8 | GET `/api/v1/residents` as RESIDENT role | 403 Forbidden | ☑ |
| 3.9 | GET `/api/v1/households` (as STAFF) | 200 OK — 3 households returned | ☑ |

---

## Step 4 — Fee Management

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 4.1 | GET `/api/v1/fees` (as ADMIN) | 200 OK — 11 fees returned | ☑ |
| 4.2 | GET `/api/v1/fees?status=PENDING` | Fees with PENDING status only | ☑ |
| 4.3 | GET `/api/v1/fees/by-apartment/1` | 4 fees for A101 | ☑ |
| 4.4 | POST `/api/v1/fees` with valid body | 201 Created, status=PENDING | ☑ |
| 4.5 | POST with negative amount | 400 Bad Request | ☑ |
| 4.6 | PUT `/api/v1/fees/1` to update amount | 200 OK — updated | ☑ |
| 4.7 | DELETE fee with linked payments (fee_id=2) | Should return error | ☑ |

---

## Step 5 — Payment Recording (UC006)

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 5.1 | GET `/api/v1/payments/by-fee/2` | 1 payment of 200,000 for A101 electricity | ☑ |
| 5.2 | POST `/api/v1/payments` with fee_id=1 (PENDING), amount=500000 | 201 Created — fee status becomes PAID | ☑ |
| 5.3 | POST `/api/v1/payments` with fee_id=1 again (now PAID) | 400 Bad Request — "already paid" | ☑ |
| 5.4 | POST with amount exceeding remaining debt | 400 Bad Request — "exceeds remaining debt" | ☑ |
| 5.5 | POST with fee_id=6 (PENDING), amount=200000 (partial of 420000) | 201 Created — fee status becomes PARTIAL | ☑ |
| 5.6 | POST second payment on fee_id=6, amount=220000 (remaining) | 201 Created — fee status becomes PAID | ☑ |
| 5.7 | GET `/api/v1/payments/by-apartment/1` as RESIDENT | 200 OK (RESIDENT allowed on own apartment) | ☑ |

---

## Step 6 — Payment Deletion & Fee Status Rollback

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 6.1 | DELETE `/api/v1/payments/{id}` as STAFF | 403 Forbidden (ADMIN only) | ☑ |
| 6.2 | DELETE `/api/v1/payments/{id}` as ADMIN (payment that made fee PAID) | 200 OK — fee status reverts to PARTIAL or PENDING | ☑ |
| 6.3 | Verify fee status via GET `/api/v1/fees/{id}` after deletion | Status correctly recalculated | ☑ |

---

## Step 7 — Frontend Integration

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 7.1 | Open dashboard — apartments widget shows 5 total, 3 OCCUPIED | Numbers match seed data | ☑ |
| 7.2 | Navigate to Residents list — 9 rows displayed | All seed residents visible | ☑ |
| 7.3 | Filter residents by INACTIVE status | 1 row shown | ☑ |
| 7.4 | Open fee list for apartment A101 — 4 fees displayed | Correct statuses: PENDING, PARTIAL, PAID, PENDING | ☑ |
| 7.5 | Record a new payment via UI form | Payment saved, fee status updates in real time | ☑ |
| 7.6 | Log in as `resident1` — cannot access Residents admin page | Redirected or 403 shown | ☑ |
| 7.7 | Light/dark mode toggle works across all pages | No layout breakage | ☑ |

---

## Step 8 — Chat System

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 8.1 | Send a text message in chat widget | Message appears for all connected users | ☐ |
| 8.2 | Upload an image in chat | Image displayed inline in chat | ☐ |
| 8.3 | Upload a file (PDF/DOC) in chat | File link displayed, downloadable | ☐ |
| 8.4 | Add emoji reaction to a message | Reaction appears with user count | ☐ |
| 8.5 | Toggle same emoji reaction off | Reaction removed | ☐ |
| 8.6 | Reply to a message | Reply shows original message context | ☐ |
| 8.7 | Mention a user with @ | Username autocomplete appears | ☐ |
| 8.8 | GET `/api/v1/chat/history?limit=50` | Returns last 50 messages with reactions | ☐ |

---

## Step 9 — CCCD Upload & Approval Workflow

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 9.1 | Resident requests apartment join with CCCD front/back images | 200 OK — status becomes PENDING | ☐ |
| 9.2 | Request without CCCD images | 400 Bad Request — validation error | ☐ |
| 9.3 | Admin views pending resident with CCCD images | Images visible in approval page | ☐ |
| 9.4 | Admin approves resident request | Status becomes ACTIVE | ☐ |
| 9.5 | Admin rejects resident request with reason | Status becomes REJECTED with reason | ☐ |

---

## Step 10 — Announcements, Vehicles & Reports

| # | Action | Expected Result | Pass |
|---|--------|-----------------|------|
| 10.1 | Create announcement (as ADMIN) | Announcement visible to all users | ☐ |
| 10.2 | Register vehicle for a resident | Vehicle appears in list | ☐ |
| 10.3 | Resident submits a report/complaint | Report saved, admin can view | ☐ |
| 10.4 | Resident views own fees and payments | Correct data displayed | ☐ |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Dev  | Antigravity | 2026-06-07 | Signed |
| QA   | Antigravity | 2026-06-07 | Signed |
