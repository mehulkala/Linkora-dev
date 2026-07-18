<div align="center">

# 🔗 Linkora

### Fast • Secure • Simple URL Shortener with Analytics

A modern full-stack URL shortening platform built using **React, Node.js, PostgreSQL, and Redis**, featuring secure authentication, real-time analytics, Redis-backed click tracking, and an optimized background synchronization architecture.

[Live Demo](https://linkora-dev.onrender.com/)

</div>

---

# ✨ Features

### 🔐 Authentication

- Secure Signup & Login
- JWT Authentication
- HTTP-only Cookies
- Protected Dashboard

### 🔗 URL Shortening

- Generate unique short URLs
- One-click copy
- Instant redirection
- Delete URLs

### 📊 Analytics Dashboard

- Total URLs
- Total Clicks
- Average Clicks
- Active URLs
- Search URLs
- Sort by
  - Newest
  - Oldest
  - Most Clicked
  - Least Clicked
- Automatic refresh every minute
- Skeleton loading UI
- Last updated status

### ⚡ Performance

- Redis cache for click tracking
- Background worker synchronizes Redis → PostgreSQL every 60 seconds
- Significantly reduces database writes
- Near real-time analytics

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- Zustand
- Tailwind CSS
- DaisyUI
- Axios
- React Router
- React Hot Toast
- Lucide React

## Backend

- Node.js
- Express.js
- PostgreSQL
- Upstash Redis
- JWT
- NanoID

---

# 📷 Screenshots

## Home Page

![Home Page](images/home.png)

---

## Dashboard

![Dashboard](images/dashboard.png)

---

## Login

![Login Page](images/login.png)

---

# 🏗 System Architecture

![System Architecture](/images/architecture.png)

---

# ⚡ Click Tracking Flow

```

User clicks Short URL
│
▼
Redis Click Counter
│
▼
Redirect User Immediately
│
▼
Background Worker (60 sec)
│
▼
Batch Update PostgreSQL
│
▼
Dashboard Analytics

```

This architecture minimizes database writes while maintaining near real-time analytics.

---

# 📂 Project Structure

```

Linkora
│
├── backend
│   ├── controllers
│   ├── lib
│   ├── middlewares
│   ├── routes
│   ├── utils
│   ├── workers
│   └── server.js
│
├── frontend
│   ├── components
│   ├── pages
│   ├── store
│   ├── lib
│   └── App.jsx
│
└── README.md

```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/mehulkala/Linkora-dev.git

cd linkora
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

Create a `.env` in backend

```env
PORT=

NODE_ENV=

DATABASE_URL=

CLIENT_URL=

BASE_URL=

UPSTASH_REDIS_REST_URL=

UPSTASH_REDIS_REST_TOKEN=

JWT_SECRET=
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/signup` | Register User |
| POST | `/login` | Login |
| POST | `/logout` | Logout |

---

## URLs

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/generate-code` | Create Short URL |
| DELETE | `/urls/:id` | Delete URL |
| GET | `/code/:shortCode` | Redirect |

---

## Dashboard

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/dashboard` | Dashboard Analytics |

---

# 💡 Engineering Highlights

- JWT authentication using HTTP-only cookies
- Cache-first architecture using Redis
- Background synchronization worker
- Batched database writes
- Responsive analytics dashboard
- Global state management using Zustand
- Skeleton loading for improved UX
- Automatic dashboard refresh

---

# 🔮 Future Improvements

- QR Code generation
- Custom aliases
- URL expiration
- Click history graphs
- Rate limiting
- Custom domains
- Advanced analytics

---

# 👨‍💻 Author

**Mehul Kala**

GitHub: https://github.com/mehulkala

LinkedIn: https://www.linkedin.com/in/mehul-kala/
