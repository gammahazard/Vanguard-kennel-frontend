# Kennel Platform - Architecture Documentation

> **Last Updated:** January 2, 2026

## Overview

A full-stack dog boarding kennel management platform with separate client and staff experiences.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Material-UI |
| **Backend** | Rust (Axum), SQLite (sqlx), WebAuthn |
| **Auth** | JWT + FaceID/Passkeys (WebAuthn) |
| **Styling** | MUI + Custom theme (`lib/theme.ts`) |

---

## Frontend Structure

```
frontend/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page (1,145 lines)
│   ├── layout.tsx         # Root layout with providers
│   ├── client/            # Client-facing pages
│   │   ├── dashboard/     # Main client dashboard (1,610 lines)
│   │   ├── wallet/        # Balance & transactions (818 lines)
│   │   ├── pets/          # Pet management (847 lines)
│   │   ├── booking/       # New booking flow (555 lines)
│   │   ├── bookings/      # Booking history (644 lines)
│   │   ├── messages/      # Client messaging (438 lines)
│   │   └── security/      # Account security (571 lines)
│   └── staff/             # Staff-facing pages
│       ├── dashboard/     # Staff dashboard (822 lines, modular)
│       │   ├── components/    # 10 modular components
│       │   └── hooks/         # useStaffDashboard.ts (26KB)
│       └── login/         # Staff login with FaceID (310 lines)
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── ImageUpload.tsx
│   │   ├── VaccinationUpload.tsx
│   │   ├── ImageSlideshow.tsx
│   │   ├── InstallModal.tsx   # PWA install prompt
│   │   ├── Navbar.tsx
│   │   └── PremiumButton.tsx
│   └── NotificationProvider.tsx
└── lib/
    ├── api.ts             # API client utilities
    └── theme.ts           # MUI theme configuration
```

### Staff Dashboard Components

| Component | Purpose |
|-----------|---------|
| `BookingRequestManager.tsx` | Manage pending booking requests |
| `BusinessDashboard.tsx` | Revenue & occupancy metrics |
| `CheckInModal.tsx` | Dog check-in workflow |
| `ClientDirectory.tsx` | Client/pet directory |
| `DailyReportModal.tsx` | Daily care reports |
| `GuestList.tsx` | Active guests list |
| `IncidentModal.tsx` | Incident reporting |
| `OperationsStats.tsx` | Operational statistics |
| `ServiceManager.tsx` | Service pricing management |
| `StaffManagementDialog.tsx` | Staff CRUD operations |

---

## Backend Structure

```
backend/src/
├── main.rs        # Axum router setup (474 lines)
├── handlers.rs    # API handlers (2,575 lines, 61 handlers)
├── models.rs      # Data models & DTOs (400 lines)
├── state.rs       # AppState definition
├── rate_limit.rs  # Rate limiting middleware
├── lib.rs         # Module exports
├── api/           # API utilities
├── db/            # Database migrations
└── models/        # Additional model files
```

### API Handlers (61 Total)

**Authentication & Users**
- `register_handler`, `login_handler`, `auth_check_handler`
- `register_start`, `register_finish`, `login_start`, `login_finish` (WebAuthn/FaceID)
- `unregister_handler`, `delete_user_handler`
- `update_user_profile_handler`, `get_user_profile_handler`

**Pets**
- `get_pets_handler`, `create_pet_handler`, `update_pet_handler`, `delete_pet_handler`

**Bookings**
- `create_booking_handler` - Complex booking with validation & pricing
- `get_user_bookings_handler`, `get_all_bookings_handler`
- `update_booking_status_handler` - Status transitions with penalty logic
- `toggle_payment_handler`, `pay_with_wallet_handler`
- `get_availability_handler`

**Staff & Admin**
- `get_staff_handler`, `create_staff_handler`, `delete_staff_handler`
- `get_owner_stats_handler` - Dashboard metrics
- `clients_list_handler` - Client directory

**Messaging & Notifications**
- `send_message_handler`, `get_messages_handler`, `mark_messages_read_handler`
- `get_notifications_handler`, `mark_notification_read_handler`, `delete_notifications_handler`
- `get_admin_messages_handler`

**Reports & Incidents**
- `create_report_handler`, `get_reports_handler`
- `create_incident_handler`, `get_incidents_handler`

**Services & Files**
- `get_services_handler`, `update_service_handler`
- `upload_handler`, `secure_upload_handler`, `get_secure_file_handler`

**Audit**
- `audit_handler`, `get_user_audit_handler`

---

## Data Models

### Core Entities

| Model | Description |
|-------|-------------|
| `User` | Users with roles (client/staff/owner) |
| `Pet` | Dogs with health info, vaccinations |
| `Booking` | Reservations with status, pricing |
| `EnrichedBooking` | Booking + pet/owner details (joined) |
| `Service` | Configurable services (boarding, grooming) |
| `Incident` | Incident reports per pet |
| `DailyReport` | Daily care updates |
| `Message` | Chat messages |
| `Notification` | User notifications |
| `AuditLog` | Security audit trail |

---

## Key Business Logic

### Booking Status Flow
```
Pending → Confirmed → Checked In → Completed
    ↓         ↓
Cancelled  No Show
```

### Financial Rules
- **No-Refund Policy**: Paid bookings retain revenue on cancellation (minus 80% refund to wallet)
- **Penalty Fees**: 
  - Cancellation (unpaid): $45/dog
  - Cancellation (paid): 20% kept as fee (min $15), 80% refunded to wallet
  - No-Show: $25/dog (always applied)
- **Wallet System**: Prepaid balance for bookings, refunds credited here

### Authorization
- JWT-based with role verification (`client`, `staff`, `owner`)
- `verify_role()` helper for endpoint protection
- IDOR protections on pet/booking endpoints

---

## 📁 Complete File Reference

### Frontend Files (`/app`)

| File/Folder | Purpose |
|-------------|---------|
| `page.tsx` | **PWA Splash Screen** - Detects iOS/Android, shows install instructions, handles deep links |
| `layout.tsx` | Root layout with MUI theme provider, font loading, and global styles |
| `globals.css` | Minimal CSS reset and scrollbar styling |

#### Client Portal (`/app/client`)

| Route | File | Purpose |
|-------|------|---------|
| `/client/dashboard` | `page.tsx` | Main client home - weather widget, recent moments, booking status cards |
| `/client/bookings` | `page.tsx` | Booking wizard with date picker, pet selector, pricing calculator, policy checkboxes |
| `/client/pets` | `page.tsx` | Pet management - add/edit/delete dogs, photo upload, vaccination tracking |
| `/client/wallet` | `page.tsx` | Balance display, transaction history, top-up modal, outstanding penalties |
| `/client/messenger` | `page.tsx` | Real-time chat with staff, message history, quick action buttons |
| `/client/notifications` | `page.tsx` | System notifications (booking updates, reports), mark as read |
| `/client/profile` | `page.tsx` | User info, FaceID toggle, fee policies display, logout |
| `/client/login` | `page.tsx` | Email/password login with FaceID option |
| `/client/signup` | `page.tsx` | New client registration |

#### Staff Portal (`/app/staff`)

| Route | File | Purpose |
|-------|------|---------|
| `/staff/dashboard` | `page.tsx` | Main staff console - orchestrates all modular components |
| `/staff/login` | `page.tsx` | Staff-only login with WebAuthn support |
| `/staff/report` | `page.tsx` | Create daily care reports with mood/activity/photos |
| `/staff/audit` | `page.tsx` | Security audit log viewer (owner-only) |
| `/staff/comms` | `page.tsx` | Multi-client messaging interface |

#### Staff Dashboard Components (`/app/staff/dashboard/components`)

| Component | Purpose |
|-----------|---------|
| `BookingRequestManager.tsx` | Pending booking queue with approve/decline actions |
| `BusinessDashboard.tsx` | Revenue chart, occupancy metrics, booking counts |
| `CheckInModal.tsx` | Dog check-in workflow with status confirmation |
| `ClientDirectory.tsx` | Searchable client list with pet info |
| `DailyReportModal.tsx` | Create/view daily care updates |
| `GuestList.tsx` | Active checked-in dogs with action buttons |
| `IncidentModal.tsx` | Incident reporting with severity levels |
| `OperationsStats.tsx` | Quick stats cards (guests, bookings, capacity) |
| `PetDetailModal.tsx` | Full pet info view with vet/allergy data |
| `ServiceManager.tsx` | Dynamic pricing management (owner-only) |
| `StaffManagementDialog.tsx` | Add/remove staff accounts (owner-only) |
| `BookingDetailsModal.tsx` | Detailed booking info with status history |

#### Staff Dashboard Hook (`/app/staff/dashboard/hooks`)

| File | Purpose |
|------|---------|
| `useStaffDashboard.ts` | **Central logic layer** - all API calls, state management, business rules (~700 lines) |

---

### Reusable Components (`/components`)

| File | Purpose |
|------|---------|
| `NotificationProvider.tsx` | Global toast notifications with MUI Snackbar |

#### UI Components (`/components/ui`)

| Component | Purpose |
|-----------|---------|
| `ImageSlideshow.tsx` | Ken Burns effect hero background for splash page |
| `ImageUpload.tsx` | Drag-and-drop pet photo uploader with preview |
| `VaccinationUpload.tsx` | Secure vaccination record uploader |
| `InstallModal.tsx` | PWA install instructions for iOS/Android |
| `Navbar.tsx` | Adaptive navigation bar with scroll effects |
| `PremiumButton.tsx` | Styled gold/black gradient button |
| `IPLocation.tsx` | IP-based location display for security |

---

### Core Libraries (`/lib`)

| File | Purpose |
|------|---------|
| `api.ts` | Authenticated fetch wrapper with JWT headers, 401 handling |
| `config.ts` | Environment variable exports (API_BASE_URL) |
| `theme.ts` | MUI theme configuration (gold/black palette, typography) |
| `security.ts` | Input sanitization utilities |
| `dateUtils.ts` | Date formatting helpers (EST timezone) |

---

### Type Definitions (`/types`)

| File | Purpose |
|------|---------|
| `index.ts` | All TypeScript interfaces (User, Pet, Booking, Message, etc.) |

---

### Backend Files (`/backend/src`)

| File | Lines | Purpose |
|------|-------|---------|
| `main.rs` | ~490 | **Entry point** - Axum router setup, database init, seeding, CORS |
| `handlers.rs` | ~2,660 | **All 61 API handlers** - authentication, bookings, payments, messaging |
| `models.rs` | ~400 | **Data structures** - Rust structs matching DB schema, request/response DTOs |
| `state.rs` | ~20 | **AppState definition** - database pool, WebAuthn state, rate limiter |
| `rate_limit.rs` | ~50 | **Middleware** - in-memory IP-based rate limiting |
| `lib.rs` | ~5 | Module exports |

### Backend Handler Categories

| Category | Handlers | Purpose |
|----------|----------|---------|
| **Auth** | 9 | Login, register, WebAuthn/FaceID, JWT validation |
| **Users** | 5 | Profile CRUD, staff management |
| **Pets** | 4 | Pet CRUD with IDOR protection |
| **Bookings** | 7 | Create, status updates, payments, availability |
| **Messages** | 4 | Send, receive, mark read |
| **Notifications** | 4 | System alerts, read status |
| **Reports** | 4 | Daily care reports, incidents |
| **Services** | 2 | Dynamic pricing management |
| **Files** | 3 | Secure upload/download with auth |
| **Audit** | 2 | Security logging |
| **Stats** | 2 | Dashboard metrics |

---

## Environment Variables

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend  
DATABASE_URL=sqlite:./kennel.db
JWT_SECRET=<secret>
WEBAUTHN_RP_ID=localhost
WEBAUTHN_RP_ORIGIN=http://localhost:3000
```

---

## Development Commands

```bash
# Frontend
cd frontend && npm run dev    # Port 3000

# Backend
cd backend && cargo run       # Port 3001
```

