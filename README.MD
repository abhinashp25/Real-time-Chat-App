# Chatify 💬

A real-time chat application built with React, Node.js, Socket.io, and MongoDB.

## Features
- 🔐 JWT authentication with HTTP-only cookies
- 💬 Real-time messaging with Socket.io
- 🖼️ Image sharing via Cloudinary
- 🔔 Sound notifications & keyboard sounds
- 👥 Contacts & chat history tabs
- 🛡️ Rate limiting & bot protection via Arcjet
- 📧 Welcome emails via Resend
- 🟢 Online/offline user presence

## Project Structure
```
chatify/
├── backend/        # Express + Socket.io + MongoDB
│   └── src/
│       ├── controllers/
│       ├── emails/
│       ├── lib/
│       ├── middleware/
│       ├── models/
│       └── routes/
└── frontend/       # React + Zustand + TailwindCSS + DaisyUI
    └── src/
        ├── components/
        ├── hooks/
        ├── lib/
        ├── pages/
        └── store/
```

## Setup

### 1. Clone & Install
```bash
# Install all dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd frontend && npm install
```

### 2. Configure Environment
```bash
cd backend
cp .env.example .env
# Fill in all values in .env
```

### 3. Run in Development
```bash
# Run both frontend and backend
npm run dev

# Or run separately
cd backend && npm run dev       # http://localhost:3000
cd frontend && npm run dev      # http://localhost:5173
```

### 4. Build for Production
```bash
cd frontend && npm run build
cd backend && npm start
```

## Environment Variables
See `backend/.env.example` for all required variables.

## Tech Stack
- **Frontend:** React 19, Zustand, TailwindCSS, DaisyUI, Socket.io-client, Axios
- **Backend:** Node.js, Express, Socket.io, MongoDB/Mongoose, JWT, Bcrypt
- **Services:** Cloudinary, Resend, Arcjet
