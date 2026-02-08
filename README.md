# LMS Academy - Learning Management System

A full-stack, microservices-based Learning Management System featuring a secure banking integration for course purchases and instructor payouts.

## 🚀 Overview

The project is split into three main components:
1.  **LMS-client**: A modern React-based frontend using Vite and Tailwind CSS.
2.  **LMS-server**: The core backend logic (Node.js/Express) handling courses, user progress, and business logic.
3.  **bank-server**: A dedicated financial microservice for managing virtual bank accounts and secure transfers.

---

## 🛠️ LMS Server API (Port 8000)

### User Routes (`/user`)
- `POST /user/signup`: Create a new learner or instructor account.
- `POST /user/login`: Authenticate users.
- `POST /user/setup-bank`: Link a bank server account to the LMS profile.
- `GET /user/balance/:accountNumber`: Fetch real-time balance from the bank.

### Course Routes (`/course`)
- `GET /course/`: List all available courses.
- `GET /course/my/:userId`: List courses enrolled/owned by the user.
- `GET /course/enrollment/:userId/:courseId`: Get detailed progress for a specific enrollment.
- `GET /course/status/:userId/:courseId`: Check certification eligibility and fund collection status.
- `GET /course/instructor/:instructorId`: Dashboard data for instructors (payouts, revenue).
- `GET /course/:id`: Detailed view of a course including its materials.
- `POST /course/upload`: Upload new course content with local asset storage.
- `POST /course/buy`: Purchase a course using virtual bank balance.
- `POST /course/finish-material`: Mark specific lessons/quizzes as complete.
- `POST /course/payout`: Request transfer of earned funds to instructor bank account.

### Admin Routes (`/admin`)
- `GET /admin/stats`: Global platform analytics (total users, top courses, daily visits).

---

## ⚙️ Environment Setup

Create a `.env` file in the **LMS-server** directory:
```env
MONGO_URI="your_mongodb_connection_string"
MONGO_DATABASE="LMS"
BANK_SERVER_URL="http://localhost:8001"
LMS_BANK_ACCOUNT="LMS_ORG_MAIN"
PORT=8000
```

Create a `.env` file in the **bank-server** directory:
```env
MONGO_URI="your_mongodb_connection_string"
MONGO_DATABASE="LMS_BANK"
PORT=8001
```

---

## 🏃 How to Run

### 1. Start the Bank Server
```bash
cd bank-server
npm ci
npm run dev
```

### 2. Start the LMS Server
```bash
cd LMS-server
npm ci
node seed.js  # Optional: Seed initial course data
npm run dev
```

### 3. Start the Client
```bash
cd LMS-client
npm ci
npm run dev
```

---

## 💎 Key Features
- **Secure Certification**: Certificates are issued only after instructors collect course earnings.
- **Micro-interactions**: Dynamic navbar with active state highlighting and live balance syncing.
- **Rich Content**: Support for localized video storage, MCQs, and interactive learning sessions.
- **Instructor Control**: Full dashboard for managing course revenue and payouts.
