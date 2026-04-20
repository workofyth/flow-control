# 🚀 Airflow Web Monitoring & DAG Trigger — Project Plan

## 📌 Overview

Aplikasi web berbasis **Next.js** untuk memonitor status DAG di Apache Airflow dan menyediakan tombol trigger manual untuk menjalankan DAG secara langsung dari browser, tanpa harus masuk ke Airflow UI.

---

## 🎯 Tujuan

- Memberikan tampilan monitoring DAG yang lebih ringkas dan user-friendly
- Memungkinkan non-technical user untuk trigger DAG tanpa akses ke Airflow UI
- Menampilkan status run terbaru, durasi, dan log secara real-time
- Mendukung multi-environment (dev, staging, production)

---

## 🗂️ Fitur Utama

### 1. Dashboard DAG List

- Tampilkan semua DAG yang terdaftar di Airflow
- Filter berdasarkan: status (active/paused), tag, owner
- Search DAG by name
- Sorting: last run, next run, duration

### 2. DAG Detail View

- Informasi lengkap DAG: schedule, owner, tags, description
- Riwayat run (DAG Runs) dalam bentuk tabel/timeline
- Status setiap task dalam run terakhir (task instance grid)
- Statistik: success rate, avg duration, failure count

### 3. Trigger DAG

- Tombol "Trigger DAG" dengan konfirmasi dialog
- Support input `conf` (JSON payload) opsional
- Notifikasi sukses/gagal setelah trigger
- Audit log: siapa yang trigger, kapan, dengan conf apa

### 4. Log Viewer

- Tampilkan log per task instance
- Syntax highlighting untuk log output
- Auto-refresh saat task sedang berjalan

### 5. Real-time Status

- Polling otomatis setiap N detik (configurable)
- Badge status: success, running, failed, queued, skipped
- Visual indicator saat ada DAG yang sedang berjalan

### 6. Auth & Access Control

- Login menggunakan credentials Airflow atau SSO (OAuth/LDAP)
- Role-based: viewer hanya bisa lihat, editor bisa trigger
- Session management

---

## 🧱 Arsitektur Sistem

```
┌─────────────────────────────────────────────┐
│               Browser (Next.js)              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Dashboard│  │DAG Detail│  │ Log Viewer│  │
│  └──────────┘  └──────────┘  └───────────┘  │
└────────────────────┬────────────────────────┘
                     │ HTTP / WebSocket
┌────────────────────▼────────────────────────┐
│          Next.js API Routes (BFF)            │
│   /api/dags   /api/runs   /api/trigger       │
│   /api/logs   /api/auth                      │
└────────────────────┬────────────────────────┘
                     │ REST API
┌────────────────────▼────────────────────────┐
│          Apache Airflow REST API             │
│          (v2 Stable API)                     │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer       | Teknologi                              |
| ----------- | -------------------------------------- |
| Framework   | Next.js 14+ (App Router)               |
| Language    | TypeScript                             |
| Styling     | Tailwind CSS + shadcn/ui               |
| State Mgmt  | Zustand / React Query (TanStack Query) |
| Auth        | NextAuth.js                            |
| HTTP Client | Axios / native fetch                   |
| Charts      | Recharts / Tremor                      |
| Log Viewer  | react-virtualized / custom             |
| Testing     | Vitest + Playwright (E2E)              |
| Deployment  | Docker + Nginx / Vercel                |

---

## 📁 Struktur Direktori

```
airflow-monitor/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── dashboard/
│   │   └── page.tsx                  # DAG list
│   ├── dags/
│   │   └── [dagId]/
│   │       ├── page.tsx              # DAG detail
│   │       ├── runs/[runId]/page.tsx # Run detail
│   │       └── logs/page.tsx         # Log viewer
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── dags/route.ts
│   │   ├── dags/[dagId]/route.ts
│   │   ├── dags/[dagId]/trigger/route.ts
│   │   ├── runs/route.ts
│   │   └── logs/route.ts
│   └── layout.tsx
├── components/
│   ├── dag/
│   │   ├── DagTable.tsx
│   │   ├── DagCard.tsx
│   │   ├── DagStatusBadge.tsx
│   │   └── TriggerDialog.tsx
│   ├── runs/
│   │   ├── RunTimeline.tsx
│   │   └── TaskGrid.tsx
│   ├── logs/
│   │   └── LogViewer.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Sidebar.tsx
│       └── StatusIndicator.tsx
├── lib/
│   ├── airflow-client.ts             # Airflow API wrapper
│   ├── auth.ts
│   └── utils.ts
├── hooks/
│   ├── useDags.ts
│   ├── useRuns.ts
│   └── useLogs.ts
├── types/
│   └── airflow.ts                    # Type definitions
├── .env.local
└── docker-compose.yml
```

---

## 🔌 Airflow REST API Endpoints yang Digunakan

| Aksi                | Method | Endpoint                                                                             |
| ------------------- | ------ | ------------------------------------------------------------------------------------ |
| List semua DAG      | GET    | `/api/v1/dags`                                                                     |
| Get detail DAG      | GET    | `/api/v1/dags/{dag_id}`                                                            |
| Pause / Unpause DAG | PATCH  | `/api/v1/dags/{dag_id}`                                                            |
| Trigger DAG         | POST   | `/api/v1/dags/{dag_id}/dagRuns`                                                    |
| List DAG Runs       | GET    | `/api/v1/dags/{dag_id}/dagRuns`                                                    |
| Get DAG Run detail  | GET    | `/api/v1/dags/{dag_id}/dagRuns/{dag_run_id}`                                       |
| List Task Instances | GET    | `/api/v1/dags/{dag_id}/dagRuns/{run_id}/taskInstances`                             |
| Get Task Log        | GET    | `/api/v1/dags/{dag_id}/dagRuns/{run_id}/taskInstances/{task_id}/logs/{try_number}` |

---

## 🗓️ Rencana Pengerjaan (Sprint Plan)

### Sprint 1 — Foundation (Minggu 1–2)

- [ ] Setup project Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Konfigurasi environment variable (Airflow URL, credentials)
- [ ] Buat `airflow-client.ts` sebagai wrapper Airflow REST API
- [ ] Setup NextAuth.js untuk autentikasi basic auth ke Airflow
- [ ] Buat layout dasar: Navbar, Sidebar, routing

### Sprint 2 — DAG Dashboard (Minggu 3–4)

- [ ] Halaman daftar DAG dengan tabel + filter + search
- [ ] Status badge (active, paused, running, failed, success)
- [ ] Polling otomatis setiap 30 detik
- [ ] DAG detail page: info, schedule, tags

### Sprint 3 — Trigger & Runs (Minggu 5–6)

- [ ] Tombol Trigger DAG + konfirmasi dialog
- [ ] Input conf JSON (opsional) saat trigger
- [ ] Notifikasi toast sukses/gagal
- [ ] Halaman riwayat DAG Runs (tabel + pagination)
- [ ] Task instance grid per run

### Sprint 4 — Log Viewer & Polish (Minggu 7–8)

- [ ] Log viewer per task instance
- [ ] Auto-refresh log saat task running
- [ ] Audit log trigger (simpan ke localStorage atau DB sederhana)
- [ ] UI polish: dark mode, responsive, loading skeleton
- [ ] Error handling & empty states

### Sprint 5 — Testing & Deployment (Minggu 9–10)

- [ ] Unit test komponen utama (Vitest)
- [ ] E2E test alur trigger DAG (Playwright)
- [ ] Dockerize aplikasi
- [ ] Dokumentasi README + deployment guide
- [ ] Review keamanan: rate limiting, sanitasi input

---

## 🔐 Pertimbangan Keamanan

- Semua request ke Airflow melewati **Next.js API Routes** (BFF pattern) — credentials tidak pernah expose ke browser
- Gunakan **HTTPS** di production
- Validasi input `conf` JSON sebelum dikirim ke Airflow
- Implementasi **rate limiting** pada endpoint trigger
- Role-based access: pisahkan viewer vs operator

---

## 🌍 Environment Variables

```env
# Airflow
AIRFLOW_BASE_URL=http://your-airflow-host:8080
AIRFLOW_USERNAME=admin
AIRFLOW_PASSWORD=admin

# Auth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# App
POLLING_INTERVAL_MS=30000
```

---

## 📦 Deployment

### Opsi 1: Docker Compose

```yaml
services:
  airflow-monitor:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AIRFLOW_BASE_URL=${AIRFLOW_BASE_URL}
    restart: unless-stopped
```

### Opsi 2: Vercel (jika Airflow accessible dari internet)

- Deploy langsung ke Vercel
- Set environment variables di dashboard Vercel

---

## ✅ Definition of Done

- DAG list tampil dengan status real-time
- Trigger DAG berhasil memulai DAG Run baru
- Log task dapat dibaca langsung dari web
- Aplikasi dapat diakses dengan login
- Berjalan di Docker tanpa error

---

*Dibuat: April 2026*
