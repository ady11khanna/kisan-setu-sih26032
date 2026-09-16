# 🌾 Kisan Setu (किसान सेतु / ਕਿਸਾਨ ਸੇਤੂ)
### Farmer Procurement Slot Booking & Queue Management Platform
**Smart India Hackathon (SIH) — Problem Statement ID: 26032**  
*Ministry of Consumer Affairs, Food & Public Distribution | Department of Consumer Affairs (DoCA)*

---

![Kisan Setu Banner](https://img.shields.io/badge/SIH%202024%2F2025-Problem%2026032-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React%2019-Vite-blue?style=for-the-badge&logo=react)
![NodeJS](https://img.shields.io/badge/Node.js-Express%20REST%20API-green?style=for-the-badge&logo=nodedotjs)
![SQLite](https://img.shields.io/badge/SQLite-Database-sky?style=for-the-badge&logo=sqlite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## 📌 Problem Overview & Ground Reality

During harvest seasons (Rabi & Kharif), millions of Indian farmers bring their produce (wheat, paddy, pulses, mustard) to government procurement centres (Mandis) to sell at the **Minimum Support Price (MSP)**. Currently, the first-come-first-serve process causes severe friction:
- **Zero Arrival Scheduling**: Farmers arrive early morning, creating traffic bottlenecks and queues of 500+ tractors.
- **Long Wait Times**: Farmers wait 6 to 24 hours (or days) in the open sun, risking crop spoilage and wasting fuel.
- **Opacity**: Lack of visibility into queue position, moisture testing results, and payment disbursal status.

**Kisan Setu** solves this by converting Mandi procurement into a **capacity-aware, appointment-based token system** combined with real-time **SMS/IVR alerts** and **PFMS bank integration**.

---

## ✨ Key Features & Solution Architecture

### 1. 🌾 Farmer Portal (Mobile App & Web)
- **Aadhaar / PM-KISAN OTP Auth**: Instant registration linked with state agricultural databases.
- **4-Step Slot Booking Wizard**: Select Crop $\rightarrow$ Quantity Slider $\rightarrow$ Nearest Mandi $\rightarrow$ Preferred 1.5-hour time window.
- **Visual Capacity Gauge**: Slot availability badges (Green = Available, Yellow = Filling, Red = Full).
- **QR Code e-Token**: Generates a digital token with scannable QR code for gate entry.
- **OPD-Style Turn Tracker**: Displays currently serving token number, estimated wait time, and 4-stage lifecycle progress.
- **Digital Receipt**: Instant e-receipt showing gross weight, net quintals, moisture %, quality grade, and MSP payout.

### 2. 🏢 Mandi Officer Desk Console
- **Gate Entry Scanner**: QR scanner & token search to mark arriving vehicles as `CHECKED_IN` and assign weighing counters.
- **Weighbridge & Quality Logger**: Inputs gross weight, tare weight, moisture %, quality grade (Grade A / FAQ), and auto-computes net payout.
- **PFMS Payment Disbursal**: One-click payment trigger generating instant reference IDs (`PFMS-xxxxxxxxxxx`).

### 3. 📊 Central Government Analytics Dashboard
- **Executive KPI Metrics**: Total Farmers Served, Avg Wait Time (reduced from **6.5 Hours to 22 Minutes**), Total Tonnage Procured, and Disbursed Funds.
- **State-wide Congestion Heatmap**: Real-time load indicators across Karnal, Ludhiana, Kurukshetra, and Indore Mandis.
- **Wait-Time Reduction Chart**: Interactive Recharts visualization comparing historical FCFS wait times vs. Kisan Setu.

### 4. 💬 SMS & IVR Notification Sandbox
- **TRAI DLT-Compliant SMS Broadcast**: Automated alerts sent for booking confirmation, gate entry, weighment approval, and bank payout.
- **Feature Phone Display Simulator**: Renders messages on basic keypad phones for low digital literacy farmers.

---

## 🛠️ Tech Stack & Architecture

```
[React Vite Frontend] (Port 5173) 
        ↓  (HTTP REST API Requests via apiClient.js)
[Node.js Express Backend] (Port 5000 - server/server.js)
        ↓  (SQL Queries via better-sqlite3)
[SQLite Database] (server/kisan_setu.db)
```

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Recharts, Canvas-Confetti.
- **Backend**: Node.js, Express.js REST API, CORS middleware.
- **Database**: SQLite (`server/kisan_setu.db` via `better-sqlite3` in WAL mode).

---

## 📡 REST API Endpoint Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & health check |
| `GET` | `/api/v1/mandis` | Fetch procurement centre list & live load capacities |
| `GET` | `/api/v1/crops` | Fetch crops list & official MSP rates |
| `GET` | `/api/v1/tokens` | Fetch all live queue tokens |
| `POST` | `/api/v1/slots/book` | Reserve crop procurement slot & generate QR token |
| `POST` | `/api/v1/admin/checkin` | Mandi gate check-in & counter assignment |
| `POST` | `/api/v1/admin/weighment` | Record net weight, moisture %, quality grade |
| `POST` | `/api/v1/admin/pfms-pay` | Disburse MSP payment via PFMS |
| `GET` | `/api/v1/sms/logs` | Fetch automated SMS broadcast logs |

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Step 1: Clone Repository
```bash
git clone https://github.com/ady11khanna/kisan-setu-sih26032.git
cd kisan-setu-sih26032
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Application

**Terminal 1 (Start Express Backend Server):**
```bash
node server/server.js
```
*(Backend runs on `http://localhost:5000`)*

**Terminal 2 (Start React Frontend Application):**
```bash
npm run dev
```
*(Frontend runs on `http://localhost:5173`)*

---

## 📄 License & Credits
Developed for **Smart India Hackathon (SIH)**. Designed in alignment with **Digital India**, **Agristack**, and **Atmanirbhar Krishi** initiatives.
