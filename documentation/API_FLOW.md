# JusPrint System: Core API & Data Flow

This document details the synchronized flow between the Mobile App, Backend API, and Physical Printer clients. It follows a strict **Security-First** approach where documents are staged, payments are verified, and print commands are only issued upon validated successfully transactions.

---

## 1. System Architecture Diagram

This flowchart represents the end-to-end lifecycle of a print job, from local file selection to physical locker pickup.

```mermaid
sequenceDiagram
    autonumber
    participant App as Mobile App
    participant API as Backend API
    participant DB as Database
    participant SIO as WebSocket (Manager)
    participant PC as Printer Client (Physical)

    Note over App, API: Phase 1: Document Preparation
    App->>API: POST /api/print/upload (File + Settings)
    Note right of App: Multipart: printer_id, copies, color_mode, file
    API-->>DB: Create PrintJob (Status: initiated)
    API-->>App: {success: true, job_id, total_price}

    Note over App, API: Phase 2: Secure Payment
    App->>API: POST /api/payment/initiate (amount, job_id)
    Note right of App: Links payment record to job_id immediately
    API-->>DB: Create Payment Record (Status: pending)
    API-->>App: {transaction_id}
    
    App->>App: User completes Payment (UPI/Gateway)
    
    Loop Every 3s (Verification)
        App->>API: GET /api/payment/verify/{txnId}
        API-->>DB: Check Payment Status
        API-->>App: {status: "success" | "pending" | "failed"}
    End

    Note over App, API: Phase 3: Job Submission & Routing
    App->>API: POST /api/print/submit/{job_id}?payment_id=TXN...
    API->>DB: Security Check: Verify Payment Status == SUCCESS
    API->>DB: Update PrintJob (Status: paid)
    
    alt Printer is ONLINE
        API->>SIO: Send Print Command (Job Data)
        SIO->>PC: Emit 'print_job'
        PC->>PC: Download File & Physical Print
    else Printer is OFFLINE
        API->>DB: Update PrintJob (Status: queued)
        Note right of API: Job will print automatically when client reconnects
    end
    API-->>App: {success: true, message: "Queued for Printing"}

    Note over PC, App: Phase 4: Real-time Status Updates
    PC->>SIO: Emit 'job_progress' (e.g. 50%)
    SIO->>App: Forward Progress via Socket.io
    PC->>SIO: Emit 'job_ready' (Locker Code Generate)
    SIO->>App: UI Update: Show Locker Code & Success Animation
```

---

## 2. API Endpoint Specifications

### Phase 1: Upload (Staging)
| Method | Endpoint | Data Sent | Data Received |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/print/upload` | `multipart/form-data`: `file`, `printer_id`, `settings` | `job_id`, `total_price` |

### Phase 2: Payment (Verification)
| Method | Endpoint | Data Sent | Data Received |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payment/initiate` | `job_id`, `amount`, `payment_method` | `transaction_id` |
| `GET` | `/api/payment/verify/{id}` | `transaction_id` (in URL) | `status` (success/pending/failed) |

### Phase 3: Submission (Execution)
| Method | Endpoint | Data Sent | Data Received |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/print/submit/{jobId}` | `job_id`, `payment_id` | `success: boolean` |

---

## 3. Real-time WebSocket Listeners (Socket.io)

The app listens for the following events to provide a "live" experience:

1.  **`job_queued`**: Backend acknowledges the job and printer is assigned.
2.  **`job_printing`**: Physical printer has started processing the document.
3.  **`job_progress`**: Carries `{progress: 0-100}` for the live percentage bar.
4.  **`job_ready`**: Carries `{locker_code}`. Final state of the flow.

---

## 4. Error Handling Logic
- **Upload Timeout**: Retry with exponential backoff or check file size limits.
- **Payment Verification Timeout**: Poll for 60 seconds. If still pending, redirect user to History page to track later.
- **Submit Failure**: If payment is successful but submission fails, the `job_id` and `txn_id` are logged to allow for manual admin intervention.

---
*Last Updated: December 22, 2025*
