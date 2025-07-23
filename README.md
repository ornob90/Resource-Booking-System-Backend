# 🛠️ Booking System Backend (Express + TypeScript)

This is the backend of a resource booking system that handles time-slot reservations with conflict detection, buffer logic, timezone handling, and clean modular structure. Built using **Express**, **TypeScript**, and **Prisma**.

---

## 🚀 Features

### ✅ Booking Functionality
- Book shared resources (e.g., rooms, devices) by specifying:
  - Resource
  - Start Time
  - End Time
  - Requested By

### 🔒 Conflict Detection
- Prevents overlapping bookings
- Adds **10-minute buffer** before and after each booking  
  _e.g. Booking from 10:00–11:00 blocks 09:50–11:10_

### ⏱️ Timezone Aware
- Accepts optional `timezone` from request body
- Converts `startTime` and `endTime` to **UTC** using `moment-timezone`
- Ensures consistent booking behavior across users in different time zones

### 📏 Duration Validation
- Bookings must be between **15 minutes** and **2 hours**
- Auto-validation for time order and minimum/maximum range

### 📚 Pagination
- `/api/bookings` supports pagination with:
  - `page`
  - `limit`
- Returns `hasNextPage`, `hasPrevPage`, and data sorted by upcoming time

### 🔍 Availability API
- `/api/available-slots`
- Returns available time ranges **between existing bookings**
- Works with or without resource/date
- Can also take `currentTime` from body

### 🗑️ Cancel/Delete Booking
- Delete booking by ID via `DELETE /api/bookings/:id`

---

## 🧱 Project Structure

<pre>
src/
│
├── controllers/        # Handle HTTP req/res
├── routes/             # Define express route endpoints
├── services/           # Business logic (no req/res usage)
├── lib/
│   └── prisma.ts       # Prisma client
├── schema/             # (optional) Request validation schema
├── types/              # Custom types & interfaces
├── app.ts              # Express app setup and middleware
└── index.ts            # Server entry point + DB connection
</pre>

---

## 🌍 API Endpoints

| Method | Route                  | Description                          |
|--------|------------------------|--------------------------------------|
| POST   | `/api/bookings`        | Create a new booking                 |
| GET    | `/api/bookings`        | Get all bookings (with filters + pagination) |
| DELETE | `/api/bookings/:id`    | Cancel a booking                     |
| POST    | `/api/available-slots` | Get available time slots based on client timezone             |

---

## 🔧 Tech Stack

- **Node.js**
- **Express**
- **TypeScript**
- **Prisma + SQLite**
- **Moment.js** for time/date handling

---

## ⚙️ Environment Setup

1. Clone the repo
2. Install dependencies:

```bash
npm install
