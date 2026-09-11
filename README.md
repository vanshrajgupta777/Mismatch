# Mismatch — MERN Stack Intentional Dating Platform

Mismatch is a dating platform built on the **MERN stack** (MongoDB, Express, React, Node.js) with real-time **Socket.io** capabilities.

Unlike swipe-based apps (Tinder/Bumble), Mismatch is built around **curated, capacity-limited rooms (25 girls + 25 boys)** and **scarce, blind weekly likes (3/week)** — designed to foster intentional choices instead of infinite swiping.

---

## 🌟 Core Mechanics

1. **Capacity-Capped Themed Rooms**:
   - Organized by interest category (e.g., Gym, Cinephile, Travel, Tech, Art).
   - Each room strictly holds a maximum of **25 girls and 25 boys** (50 members total).
   - Atomic database checks enforce that once 25 members of a gender join, no more of that gender can enter until someone leaves.
   - Users can leave or shuffle into other rooms at any time.

2. **Blind Weekly Likes (Scarce & Hidden)**:
   - Each user receives **3 likes per week** scoped to the room(s) they are in.
   - Likes are completely hidden: users never see who liked them.
   - **Mutual Like Reveal**: When two users in a room like each other, both receive an instant real-time celebration and **1:1 chat unlocks**.
   - **Carry-Over Toggle**: Users can choose whether unused likes roll over to the next week (+3) or reset to 3 every Sunday.

3. **Real-Time 1:1 Chat**:
   - Powered by **Socket.io** for live messaging, typing indicators, and instant mutual match popups with confetti.

4. **Admin Dashboard & Moderation**:
   - Create, edit, and delete rooms with custom capacities.
   - View real-time capacity meters for girls and boys.
   - Place, move, or remove users from rooms.
   - Trigger the weekly like reset cycle on demand for testing.
   - Moderation controls to verify user status.

---

## 🚀 Quick Start

### 1. Installation

From the project root:
```bash
npm run install:all
```
*(Or `npm install` inside both `backend` and `frontend`)*

### 2. Running Locally

Start the backend:
```bash
cd backend
npm run dev
```

Start the frontend:
```bash
cd frontend
npm run dev
```

The app will be accessible at **http://localhost:5173**.

> **Note on MongoDB**: If `MONGO_URI` is not specified or local MongoDB is unavailable, the backend automatically spins up an in-memory database (`mongodb-memory-server`) and pre-seeds it with demo accounts and rooms out of the box!

---

## 🔑 Demo Credentials

| Role | Name | Email | Password | Interests / Notes |
|---|---|---|---|---|
| **Admin** | Admin Moderator | `admin@mismatch.com` | `admin123` | Full room & user control |
| **Boy** | Alex Rivera | `alex@mismatch.com` | `password123` | Gym, Travel, Tech |
| **Girl** | Maya Lin | `maya@mismatch.com` | `password123` | Gym, Cinephile, Coffee |
| **Girl** | Chloe Bennett | `chloe@mismatch.com` | `password123` | Travel, Art, Tech |
| **Boy** | Liam Vance | `liam@mismatch.com` | `password123` | Cinephile, Art, Music |

> **⚡️ Test the Instant Match Feature**:
> In the seed data, **Maya Lin** has already sent a blind like to **Alex Rivera** in the "Gym Rats & Iron Lovers" room.
> 1. Log in as **Alex** (`alex@mismatch.com` / `password123`).
> 2. Open the **Gym Rats & Iron Lovers** room.
> 3. Click **Send Blind Like** on **Maya Lin**.
> 4. Watch the real-time **"It's a Match!"** celebration popup appear and unlock 1:1 chat instantly!

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Axios, Socket.io-client, React Router v7.
- **Backend**: Node.js, Express, Mongoose (MongoDB), Socket.io, JWT, bcryptjs, node-cron, mongodb-memory-server.
- **Real-time**: Socket.io duplex channels for instant match alerts and messaging.

---

## 🧪 Automated Testing

To run the automated 10-step API verification suite:
```bash
cd backend
node src/scripts/verify-api.js
```
All 10 tests verify authentication, capacity meters, blind member views, mutual likes, chat messaging, and weekly cycle resets.
# Mismatch
