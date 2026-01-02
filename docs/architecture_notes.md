# System Architecture (For your Notebook)

## 1. The Engine (Backend) - "Unbreakable"
**Technology:** **Rust**
*   **Analogy:** Like a bank vault door. It's built to be heavy, secure, and impossible to break.
*   **Why we use it:** most software crashes because of "unexpected errors" (e.g., trying to read a calculator when it's off). Rust forces us to handle every single possibility *before* the code even runs. It guarantees the system stays up 24/7.

## 2. The Memory (Database) - "The Ledger"
**Technology:** **PostgreSQL**
*   **Analogy:** The permanent record.
*   **Why we use it:** It satisfies "ACID" compliance (Atomic, Consistent, Isolated, Durable).
    *   *Example:* If two staff members try to book "Suite A" at the exact same split-second, the database forces them into a queue. Only one wins. No double bookings. Ever.

## 3. The Money (Payment Layer) - "Hybrid"
**Approach:** "Meeting the future halfway."
*   **Path A (Standard):** We talk to **Stripe**. It's the industry standard. Fast, reliable, credits the bank account immediately.
*   **Path B (The Secret Weapon):** We have a **"Listener"**. This is a tiny robot that sits on our server and watches the Blockchain (like watching a public stock ticker). When it sees money land in your wallet, it instantly tells the app "Mark Invoice #123 as Paid." No banks involved.
