# Premium Task Manager

A full-stack task management application built with React (Vite) and Node.js (Express). Designed with a modern, glassmorphic UI and smooth animations.

## Features

- **Frontend**:
  - ✨ Modern, responsive UI with Glassmorphism.
  - 🛠 Add, Toggle, and Delete tasks.
  - 🔍 Filter tasks by status (All, Pending, Completed).
  - 🎬 Smooth animations using Framer Motion.
  - ⏳ Loading and Error state handling.
  
- **Backend**:
  - 🚀 RESTful API using Express.
  - 🛡 Basic data validation.
  - 🧠 In-memory storage.
  - 📝 Clear JSON responses.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm

### 1. Start the Backend
```bash
cd backend
npm install
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will be available at [http://localhost:5173](http://localhost:5173).

## Assumptions & Trade-offs
- **Storage**: Used in-memory storage for simplicity, as per the assignment's flexibility. Data will reset on server restart.
- **Styling**: Used Vanilla CSS for maximum performance and portability, following the "WOW" aesthetics guideline.
- **State Management**: Used React Hooks (`useState`, `useEffect`) since the application scope is small and doesn't require a complex store like Redux.
- **Validation**: Basic title validation is implemented on the backend to prevent empty tasks.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, UUID, Cors.
