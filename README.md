# ⚡ DSA Progress Tracker

A premium, full-stack web application designed for tracking your Data Structures & Algorithms practice — featuring live **LeetCode integration**, smart similarity-based recommendations, dynamic progress breakdowns, and daily morning email reminders.

Previously a standalone HTML page, this project has been elevated into a modern **Full-Stack Application** built with **React**, **Node.js (Express)**, and **MongoDB** for robust persistence, multi-user scaling, and automated cron email notifications.

---

## 🌐 Live Production Links
- **Live Demo (Frontend)**: [https://dsa-tracker-nu-murex.vercel.app](https://dsa-tracker-nu-murex.vercel.app)
- **API Server (Backend)**: [https://dsa-tracker-glt2.onrender.com](https://dsa-tracker-glt2.onrender.com)

---

## 🏗️ Technical Architecture

The project is structured into three main layers:

```
DSA Tracker
├── client/           React (Vite) Frontend
│   ├── src/          Components, Contexts, and API Services
│   └── index.html    Entrypoint (served on port 3000)
├── backend/          Node.js / Express API
│   ├── config/       Database connection
│   ├── routes/       Express routers (questions, progress, users, recommendations)
│   ├── services/     Email alert service (cron scheduler)
│   ├── utils/        Seeder script
│   └── server.js     Server entrypoint (runs on port 5000)
└── mongodb-data/     Local database storage
```

- **Frontend**: Built with **React** and bundled using **Vite**. Communication with the backend is abstracted via a fetch-based API layer configured to proxy requests dynamically through Vite (from port 3000 to the port 5000 backend).
- **Backend API**: Powered by **Express** and structured modularly. Integrated with `node-cron` for scheduling tasks and `nodemailer` for email generation.
- **Database**: **MongoDB** manages user profiles, custom problems, and progress state, replacing the limited browser `localStorage`.

---

## 🚀 Quick Start & Local Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Database Setup
The backend is configured to connect to a MongoDB instance. You can either use a local MongoDB service on `mongodb://localhost:27017/dsa_tracker` or supply a MongoDB Atlas connection string.

*(Optional: If running a portable version of MongoDB, start it using:)*
```powershell
./mongodb-bin/.../bin/mongod.exe --dbpath ./mongodb-data --port 27017
```

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dsa_tracker
   
   # For daily email alerts (SMTP configuration)
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-smtp-user-id
   SMTP_PASS=your-smtp-password
   FROM_EMAIL=noreply@dsatracker.com
   ```
4. Run the database seeder to populate the 62 curated questions and create a default demo user:
   ```bash
   npm run seed
   ```
5. Start the backend developer server:
   ```bash
   npm run dev
   ```

### 3. Frontend Client Setup
1. Open a second terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the client development server:
   ```bash
   npm run dev
   ```
4. Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the application.

---

## 📸 What's Inside

### 📊 Interactive Dashboard
- **4 Key Stat Cards**: Tracks Total Solved, In Progress, Weekly Progress, and Current Streak.
- **LeetCode Connected Panel**: Shows your real LC stats (Easy/Medium/Hard breakdown and ranking) once linked.
- **Animated Progress Indicators**: Sleek SVG rings and responsive progress bars updating in real-time.

### 🧩 Core Tracker Features
- **62 Preloaded DSA Questions**: Divided across 18 DSA topics (Arrays, Strings, Dynamic Programming, Graphs, etc.) linking directly to LeetCode.
- **Notes Editor**: Save, read, and edit notes inline for every individual question.
- **Custom Question Adder**: Easily add custom questions on other platforms (Codeforces, HackerRank, GeeksForGeeks) with custom tags and difficulties.
- **Smart Recommendations Sidebar**: A 5-tier recommendation system that suggests unsolved problems based on the topic/difficulty you're currently working on.

### 🟧 LeetCode Sync
- Connect by simply entering your public LeetCode username.
- Automatically fetches your 50 most recent accepted submissions.
- Auto-matches submission slugs with questions in the tracker, immediately updating progress badges with a sync indicator (`🟧`).

### ✉️ Daily Morning Alerts
- Integrates a backend cron job scheduler (`node-cron`) that runs daily.
- Sends an elegant morning workout email featuring custom recommended questions and progress statistics directly to the user's registered email using Nodemailer.

---

## 📄 License

Free to use, modify, and distribute.