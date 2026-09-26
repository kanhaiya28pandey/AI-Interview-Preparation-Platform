# AI Interview Preparation Platform (Frontend)

AI Interview Preparation is a modern React + Vite + TypeScript frontend for an AI-assisted interview preparation platform designed for verified college students.

## Technology Stack

- **Core**: React 19, Vite, TypeScript
- **Styling**: Tailwind CSS, Vanilla CSS design tokens (`ink`, `surface`, `gold`, `live`, `danger`)
- **Routing**: React Router v6 (Protected routes & Role-based Access Control)
- **State & Auth**: React Context API (`AuthContext`), Axios with Bearer token interceptor
- **Forms & Validation**: `react-hook-form` + `zod`
- **UI Components & Icons**: `lucide-react`, `sonner` notifications, Recharts analytics
- **Animations**: Framer Motion route transitions & card micro-interactions

---

## Getting Started

### 1. Setup Environment Variables
Create a `.env` file inside the `frontend/` folder:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCKS=true
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
The application will start on `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```

---

## Services Architecture

| Service | Backend Status | Source File | Description |
| :--- | :--- | :--- | :--- |
| **`authService`** | **REAL BACKEND** | `src/services/authService.ts` | Connects to `http://localhost:8080/api/auth` (`/login`, `/register`, `/forgot-password`, `/reset-password`). |
| **`practiceService`** | MOCKED (Toggleable) | `src/services/practiceService.ts` | Practice tracks, topic questions, and hints (`VITE_USE_MOCKS=true`). |
| **`codingService`** | MOCKED (Toggleable) | `src/services/codingService.ts` | Algorithm problems, starter code, live execution simulation (`VITE_USE_MOCKS=true`). |
| **`interviewService`** | MOCKED (Toggleable) | `src/services/interviewService.ts` | AI Mock interview rounds, voice/text answer submission & feedback scoring (`VITE_USE_MOCKS=true`). |
| **`quizService`** | MOCKED (Toggleable) | `src/services/quizService.ts` | MCQ quizzes with timer and instant answer explanations (`VITE_USE_MOCKS=true`). |
| **`articleService`** | MOCKED (Toggleable) | `src/services/articleService.ts` | Placement articles, STAR technique guides, system design articles (`VITE_USE_MOCKS=true`). |
| **`leaderboardService`**| MOCKED (Toggleable) | `src/services/leaderboardService.ts` | Top 3 podium, campus rankings, streak leaderboards (`VITE_USE_MOCKS=true`). |
| **`profileService`** | MOCKED (Toggleable) | `src/services/profileService.ts` | User profile details, skills, stats, and profile editing (`VITE_USE_MOCKS=true`). |
| **`adminService`** | MOCKED (Toggleable) | `src/services/adminService.ts` | User management (block/unblock/delete), test creation, analytics reports (`VITE_USE_MOCKS=true`). |

---

## Routes Map

### Public Routes
- `/` — Landing Page (with live session monitor)
- `/login` — Sign In Form
- `/register` — Create Account Form
- `/forgot-password` — Password Reset Token Flow

### Protected Student Routes (under `/dashboard` layout)
- `/dashboard` — Student Overview (stats, streak, recent activity)
- `/practice` — Domain Practice Tracks (MERN, Java, STAR, etc.)
- `/coding` — Coding Arena with code editor and runner
- `/mock-interview` — AI Mock Interview Room with feedback summary
- `/quiz` — MCQ Quizzes
- `/articles` — Placement & System Design Articles
- `/leaderboard` — Campus Leaderboard Podium
- `/profile` — Student Profile & Skills
- `/settings` — Account Settings & Security

### Protected Admin Routes (under `/admin` layout)
- `/admin` — Admin Dashboard KPI cards & Recharts
- `/admin/users` — User Table (search, filter, block/unblock, delete)
- `/admin/coding-tests` — Coding Test CRUD
- `/admin/mock-interviews` — Mock Interview Track Configs
- `/admin/articles` - Articles CMS
- `/admin/reports` — Analytics & Export Reports
- `/admin/settings` — System Settings

### Error Pages
- `/403` — Access Forbidden (Not Authorized)
- `404` — Page Not Found
