# Project Context: LakeShore Kennels (MVP)

> **Status**: Live MVP (Version 1.0.0)
> **Goal**: Production-ready Management Platform

## 1. The Mission
To build a "flagship" reliability platform for luxury dog kennels. The system replaces paper/Excel with a high-performance, crash-proof digital ledger.

## 2. Core Features (Implemented)
*   **Client Portal**: Bookings, Pet Profiles, Digital Wallet, Live Webcams.
*   **Staff Portal**: Check-in/out, Daily Reports (with photos), Occupancy Management.
*   **Operations**: Dynamic Pricing, Audit Logs, Role-Based Access Control (RBAC).

## 3. The "Wallet" Economy
Unlike standard e-commerce, this platform uses an **Internal Ledger System**:
1.  **Deposits**: Users "Top Up" their account (Mock Apple Pay / Crypto).
2.  **Spending**: Services (Boarding, Daycare) are paid from this internal balance.
3.  **Debt**: Cancellations or unpaid stays create a debt record. The system blocks future actions until settled.

## 4. Payment Strategy
*   **Primary**: Internal Wallet Balance.
*   **Top-Up Methods**:
    *   **Stripe**: (Mocked) Standard Credit/Debit.
    *   **Crypto (USDC)**: "Future-proof" option for high-net-worth clients.
    *   **Apple Pay**: Quick mobile top-ups.

## 5. Technical Philosophy
*   **"No Grid"**: Frontend strictly uses Flexbox (`Stack`/`Box`) to avoid Vercel build stability issues.
*   **"The Vault"**: Backend (Rust) is the absolute source of truth. Frontend is just a view layer.
*   **"Offline First"**: The PWA structure allows basic navigation even with spotty kennel wifi.
