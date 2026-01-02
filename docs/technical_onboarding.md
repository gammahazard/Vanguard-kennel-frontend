# 📘 LakeShore Kennels (Powered by Vanguard) - Technical Bible

> **Project Version**: 1.0.0 (MVP)
> **Agency**: Vanguard Secure Solutions
> **Client**: LakeShore Kennels

This document is the definitive guide to the architecture, codebase, and deployment strategy of the LakeShore Kennels platform. It is designed to onboard new developers and serve as a reference for the "Vanguard" team.

---

## 1. 🏗️ High-Level Architecture

The platform uses a **Decoupled Monolith** strategy to balance performance with simplicity.

### The Stack
*   **Frontend (The Face)**: Next.js 14 (React)
    *   **Hosting**: Vercel (Edge Network)
    *   **Key Tech**: Material UI (MUI), Framer Motion, PWA (Progressive Web App).
*   **Backend (The Muscle)**: Rust (Axum + Tokio)
    *   **Hosting**: Linode VPS (Debian)
    *   **Key Tech**: SQLx (Database), WebAuthn-rs (Biometrics), Tower (Middleware).
*   **Database (The Vault)**: SQLite
    *   **Why?**: Embedded, zero-latency, single-file reliability. Perfect for MVP scale (up to 100k records).

### Data Flow
1.  **User Action**: Client taps "Book Now" on iPhone PWA.
2.  **Secure Request**: `frontend/lib/api.ts` attaches the JWT and sends a signed request.
3.  **Gatekeeper**: Nginx (Reverse Proxy) receives traffic on Port 443 (SSL) and forwards to Rust on Port 8000.
4.  **Backend Processing**: Rust verifies the JWT signature (nanoseconds) and checks Role permissions.
5.  **Execution**: `sqlx` executes a parameterized query against `kennel.db`.
6.  **Response**: JSON data is returned. Next.js re-renders the UI instantly.

---

## 2. 📂 Project Structure Map

### Frontend (`/frontend`)
*   `app/`: The App Router.
    *   `client/`: **Client Portal**. Login, Dashboard, Booking Wizard, My Pets.
    *   `staff/`: **Operations Portal**.
        *   `dashboard/hooks/`: **Logic Layer**. (e.g., `useStaffDashboard.ts`).
        *   `dashboard/components/`: **Modular UI**. (e.g., `CheckInModal.tsx`).
    *   `page.tsx`: The **Gateway** (Splash Screen). Determines if user is PWA or Web.
*   `components/`: Reusable UI.
    *   `ui/Navbar.tsx`: The "Smart" Navbar (adapts to scroll & auth state).
    *   `ui/ImageSlideshow.tsx`: The "Ken Burns" effect hero bg.
*   `lib/`: Core Logic (The Brains).
    *   `api.ts`: **CRITICAL**. Wraps `fetch`. Handles Auth headers & 401 redirects.
    *   `theme.ts`: The "Premium" Design System (Gold/Black palette).
*   `public/`: Static assets (Logos, `manifest.json` for PWA).

### Backend (`/backend`)
*   `src/handlers.rs`: **Business Logic**. Every API endpoint (e.g., `create_booking`).
*   `src/models.rs`: **Data Structures**. Rust Structs mirroring Database Tables.
*   `src/main.rs`: **The entry point**. Routes, Database Connection, Seeding.
*   `kennel.db`: The live database file.

---

## 3. 🔐 Security & Identity

### Authentication (Hybrid)
We use a hybrid model covering both convenience and max security.
1.  **JWT (JSON Web Tokens)**:
    *   Stateless. The server does not store "sessions".
    *   Expires every 24 hours.
    *   Contains `role` (owner/staff/client) and `email`.
2.  **WebAuthn (Passkeys/Face ID)**:
    *   **No Passwords**. Uses public-key cryptography.
    *   **Phishing Resistant**. The key is bound to `vanguard-kennels.com`.

### RBAC (Role-Based Access Control)
Security is enforced in Rust, not JS.
*   **Staff Guard**: `verify_role(headers, vec!["staff", "owner"])`
*   **Owner Guard**: `verify_role(headers, vec!["owner"])`. Controls the **Command Center** (Pricing/Stats).
*   **Client Guard**: Isolation. Users can only fetch *their own* data.
    *   **Strict IDOR Protection**: `create_booking_handler` verifies that every referenced `dog_id` belongs to the authenticated `user_email` before processing.
    *   **Date Validation**: Server enforces logical time flow (End > Start) and max 30-day duration.

---

## 4. 🚀 Advanced Features (V1.1)

### 📢 Notification System
*   **Trigger-Based**: Updates to Booking Status (Confirmed/Declined) automatically trigger system alerts.
*   **Delivery**: In-App Notifications (Bell Icon) + Email (Planned for V2).
*   **Case Safety**: All email routing is strictly normalized (`.to_lowercase()`).

### 💰 Service Command Center
*   **Owner-Only**: Accessible via Staff Dashboard -> Command.
*   **Dynamic Pricing**: Update Boarding/Daycare rates instantly without code deploys.
*   **State Management**: React State lifts up to `StaffDashboard`, preventing data staleness.

---

## 4a. 💳 The Wallet System (Internal Ledger)

The system operates on a "Pre-Paid" or "Account Balance" model rather than per-transaction credit card charges.

### Data Model
*   **`users.balance`**: The float value representing client funds.
*   **Atomic Transactions**: Payment handler (`pay_with_wallet_handler`) verifies balance >= cost, then decrements user balance and marks booking valid in a single DB transaction.

### Flow
1.  **Top Up**: Client adds funds (Mocked Stripe/Apple Pay).
2.  **Booking**: User creates a request. `is_paid = 0`.
3.  **Settlement**: User clicks "Pay Now". Frontend calls `/api/wallet/pay`.
4.  **Verification**: Backend checks funds.
    *   **Success**: `balance` decreases, `is_paid` becomes `1`.
    *   **Fail**: Returns 400 "Insufficient Funds".


## 5. 📱 Progressive Web App (PWA) features
This is not just a website; it is an installable App.
*   **Manifest**: `public/manifest.json` defines the "App" look (No browser bar, fullscreen).
*   **Service Worker**: Caches assets for offline resilience.
*   **Install Trigger**: `components/ui/InstallModal.tsx` detects iOS/Android and guides the user to "Add to Home Screen".

---

## 6. 🛠️ Development & Deployment Cheat Sheet

### Running Locally
**Frontend**:
```bash
cd frontend
npm run dev
# Opens at http://localhost:3000
```

**Backend**:
```bash
cd backend
cargo run
# Listens at http://localhost:8000
```

### Deployment Protocol (STRICT)

**Architecture**: 
*   **Frontend**: Hosted on GitHub. Auto-deploys to Vercel via Git Push.
*   **Backend**: Hosted on Linode. Deployed via manual SCP.
*   **Repo Structure**: Separate repos. NOT a monorepo.

**1. Deploy Backend (Linode)**:
*   The AI Assistant will edit files locally.
*   **YOU (The User)** must push them to the server manually using SCP.
```bash
# Upload Source (Run from project root)
scp -r ./backend/src ./backend/Cargo.toml ./backend/Cargo.lock root@YOUR_SERVER_IP:~/backend/

# Build & Restart (SSH into server)
ssh root@YOUR_SERVER_IP "cd backend && cargo build --release && systemctl restart vanguard"
```

**2. Deploy Frontend (Vercel)**:
*   The AI Assistant commits changes locally.
*   **YOU (The User)** must push to GitHub.
```bash
cd frontend
git push origin main
```

**3. The "Nuclear" Option (Database Reset)**:
*   Use this to wipe all data and restore clean Demo Data (Users/Bookings).
```bash
ssh root@YOUR_SERVER_IP "systemctl stop vanguard && rm ~/backend/kennel.db && systemctl start vanguard"
```

---

## 7. ⚠️ Troubleshooting Guide

| Issue | Likely Cause | Fix |
| :--- | :--- | :--- |
| **"Network Error"** | Backend is down or CORS block. | Check Linode logs (`journalctl -u vanguard -f`). |
| **Face ID Fails** | Domain mismatch or DB Wipe. | If DB was wiped, keys are gone. Login with Password & Re-register. |
| **Login Loops** | Token expired. | Use the **"Wipe Cache"** option in the Profile Area (easiest on mobile), or clear LocalStorage manually. |
| **"Foreign Key Constraints"** | Case Mismatch. | Use `user@email.com` (lowercase) everywhere. Backend now enforces this. |
| **"Unexpected Token"** | Missing brackets/tags. | **Check syntax first.** 99% of the time it's a missing `}` or `/>`. Don't blame the compiler. |
| **Vercel Build Failed** | MUI Grid Version Conflict. | **DO NOT USE `Grid`.** Use `Stack` and `Box` (Flexbox) instead. See Section 8. |

---

## 8. 🎨 Frontend Best Practices (Critical)

To avoid recurring build errors and ensure performance, follow these strict rules:

### 1. Layout: The "No Grid" Rule
**Problem**: The `Grid` component in our MUI version has conflicting exports (`Unstable_Grid2` vs `Grid` v1) which causes random Vercel build failures (`module not found`).
**Solution**: **DO NOT USE `<Grid>`**. Instead, use standard Flexbox primitives which are stable:
*   Use `<Stack>` for 1D layouts (lists, vertical/horizontal alignment).
*   Use `<Box>` for 2D layouts or complex wrapping.

**Example Replacement**:
```tsx
// ❌ AVOID
<Grid container><Grid item xs={6}>...</Grid></Grid>

// ✅ PREFERRED
<Stack direction="row"><Box sx={{ width: '50%' }}>...</Box></Stack>
```

### 2. Images: Optimization Required
**Rule**: Never use `<img>`. Always use `import Image from 'next/image'`.
*   **Why?**: Next.js optimizes size/format automatically. Vercel builds will warn/fail on standard img tags.
*   **External URLs**: If user uploads an image (e.g., `placedog.net` or Linode), ensure the domain is added to `next.config.mjs` under `images.remotePatterns`.

### 3. Modularity: The "Vanguard Rule"
**Rule**: UI components must remain "dumb".
*   **Logic**: Complex state management (API calls, sorting, form handling) **MUST** be extracted into custom hooks (e.g., `useStaffDashboard`).
*   **Separation**: Keep `page.tsx` clean. It should only orchestrate the layout and pass props to modular components.

---

## 9. 🚀 Production Readiness Checklist

Before transitioning from MVP to full Production, the following security and cleanup tasks must be completed:

> [!WARNING]
> **Remove Hardcoded Seeding**:
> Currently, `backend/src/main.rs` contains a `seed_database` function that hardcodes the `owner` and `staff` credentials (`jack@vanguardkennels.com` and `staff@vanguardkennels.com`). 
> **This must be removed or disabled** before the platform is used for real traffic to prevent unauthorized access via default passwords.

*   [ ] Disable `seed_database(&pool).await` in `main.rs`.
*   [ ] Implement a secure, one-time "Initial Setup" wizard for the first owner account.
*   [ ] Rotate `JWT_SECRET` and WebAuthn parameters.
*   [ ] Enable full HTTPS/WSS on the backend Nginx proxy.

---

## 10. 🛡️ Integrity & Workflow Protocol

To maintain system integrity, strict adherence to the git workflow is required.

### Refactoring Policy
*   **Branching**: All architectural changes or significant refactors **MUST** be developed on a separate branch (e.g., `feature/refactor-dashboard`).
*   **Merging**: Direct commits to `main` are **prohibited** for refactors. All changes must be audited for logic preservation (see `refactor_audit.md`) before merging.

---

> **Vanguard Secure Solutions**
> *Reliability. Speed. Security.*
