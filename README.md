# STEAM ELMS — VR Learning Management System

An immersive Virtual Reality-powered Learning Management System designed for STEAM education (Science, Technology, Engineering, Arts, Mathematics). Built with Next.js, Three.js, and Prisma.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Features](#features)
3. [User Roles](#user-roles)
4. [Getting Started](#getting-started)
5. [Student Guide](#student-guide)
6. [Instructor Guide](#instructor-guide)
7. [Pages & Routes](#pages--routes)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)
10. [Technical Stack](#technical-stack)
11. [Development](#development)

---

## System Overview

STEAM ELMS is a web-based Learning Management System that combines traditional e-learning tools with immersive 3D and Virtual Reality experiences. Students can enroll in courses, watch video lessons, take quizzes, track their progress, earn achievements, and explore interactive 3D environments — all from a web browser.

### Key Capabilities

- **Course Management** — Instructors create courses with modules, lessons (video, article, quiz, VR), and resources
- **Interactive Lessons** — YouTube video embeds, rich article content, auto-graded multiple-choice quizzes, 3D/VR scenes
- **Progress Tracking** — Per-lesson completion, per-course progress bars, streaks, overall analytics
- **Gamification** — 20 achievements across 6 categories, leaderboard rankings
- **Grades & Analytics** — Per-course letter grades (A-F), GPA calculation, quiz score timeline, activity feed
- **3D/VR Experiences** — Virtual classroom, 3D campus map, science lab, AR educational posters, VR scene viewer
- **Communication** — Student-instructor messaging with read receipts, AI-powered chatbot
- **Study Tools** — Flashcards, per-lesson notes
- **Student Services** — Digital ID card, profile settings

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Instructor | `instructor@arelms.com` | `password123` |
| Student | `student@arelms.com` | `password123` |

---

## Features

### Learning

| Feature | Description | Location |
|---------|-------------|----------|
| **Course Catalog** | Browse published courses with category, difficulty, and tag filters | `/courses` |
| **Course Detail** | View module/lesson tree with VR content indicators, enroll/unenroll | `/courses/[id]` |
| **Lesson Player** | Watch videos, read articles, take quizzes, explore VR scenes | `/courses/[id]/lessons/[lessonId]` |
| **Module Resources** | Access supplementary materials per module (PDF, video, links) | Course detail page |
| **Notes** | Create and manage study notes per lesson | `/notes` |
| **Flashcards** | Flip-to-reveal study cards generated from quiz questions | `/flashcards` |

### Assessment

| Feature | Description | Location |
|---------|-------------|----------|
| **Quizzes** | Multiple-choice questions with auto-grading per lesson | Lesson player |
| **Grades** | Per-course letter grades (A-F) with GPA, radial charts, score breakdown | `/grades` |
| **Progress** | Per-course completion percentage, lesson status tracking, streaks | `/progress` |

### Gamification

| Feature | Description | Location |
|---------|-------------|----------|
| **Achievements** | 20 badges across lessons, courses, quizzes, streaks, engagement | `/achievements` |
| **Leaderboard** | Student rankings by lessons completed, quiz average, streak, progress | `/leaderboard` |

### VR & 3D Experiences

| Feature | Description | Location |
|---------|-------------|----------|
| **Virtual Classroom** | Full 3D classroom with desks, whiteboard, podium — fullscreen mode (F key) | `/classroom/[lessonId]` |
| **3D Campus Map** | Interactive 3D campus with clickable buildings, labels | `/campus` |
| **Virtual Science Lab** | 3D chemistry lab with beakers, test tubes, bunsen burner | `/lab` |
| **AR Educational Posters** | Interactive 3D posters with floating animation | `/posters` |
| **Scene Viewer** | Loads 3D VR content from database with configurable objects | Lesson player |

### Communication

| Feature | Description | Location |
|---------|-------------|----------|
| **Messages** | Real-time student-instructor messaging with unread badges, 5-second polling | `/chat` |
| **Chatbot** | AI-powered floating assistant with 20+ intent categories | All pages (floating button) |

### Analytics & Dashboard

| Feature | Description | Location |
|---------|-------------|----------|
| **Student Dashboard** | Stats cards, quick links, course progress, recent activity | `/dashboard` |
| **Analytics** | Per-course progress bars, quiz score timeline, activity feed | `/analytics` |
| **Student ID Card** | Printable digital ID with QR code, PDF download | `/dashboard/id` |
| **Settings** | Profile editing, avatar upload, password change | `/dashboard/settings` |

---

## User Roles

### Student

Students can browse and enroll in courses, complete lessons, take quizzes, track progress, earn achievements, use study tools, and communicate with instructors.

**Typical workflow:**
1. Register or sign in
2. Browse courses and enroll
3. Navigate through modules and lessons
4. Watch videos, read articles, take quizzes
5. Mark lessons as complete
6. Track progress on the dashboard
7. Use flashcards and notes for review
8. Check grades and achievements
9. Message instructors for questions

### Instructor

Instructors can create and manage courses, modules, lessons, and resources. They can communicate with enrolled students via the messaging system.

**Typical workflow:**
1. Sign in with instructor credentials
2. Create courses with modules and lessons
3. Add video URLs, article content, quiz questions
4. Attach VR content or resources to lessons
5. Respond to student messages
6. Manage AR posters and VR content

---

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd STEAM-ELMS

# Install dependencies
npm install

# Set up the database
npx prisma generate
npx prisma migrate dev

# Seed the database with demo data
npx prisma db seed

# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Seeded Demo Data

Running `npx prisma db seed` populates the system with:

- **2 users** — 1 instructor (Dr. Jane Smith), 1 student (John Doe)
- **5 courses** — Introduction to Computer Science, Biology 101, Creative Writing, Physics: Mechanics & Motion, Art History & Visual Culture
- **14 modules** across all courses
- **25 lessons** — videos, articles, quizzes, and VR content
- **10 quiz questions** distributed across lessons
- **20 achievements** across 6 categories
- **5 campus buildings** in the 3D campus map
- **5 lab experiments** in the virtual science lab
- **4 AR educational posters**
- **Pre-seeded messages** between student and instructor

---

## Student Guide

### Signing In

1. Navigate to `/login`
2. Enter email: `student@arelms.com`
3. Enter password: `password123`
4. You will be redirected to the Dashboard

### Enrolling in a Course

1. Click **Courses** in the sidebar
2. Browse the catalog — use filters for category, difficulty, or tags
3. Click on a course to view details
4. Click **Enroll Now**
5. The course appears in your dashboard and progress tracking

### Completing Lessons

1. From a course page, click any lesson
2. Watch the video, read the article, or interact with VR content
3. For quizzes, select your answer and submit
4. Click **Mark as Complete** when finished
5. Progress updates automatically on the dashboard

### Using Study Tools

- **Notes** — Click "New Note" on the `/notes` page, select a course and lesson, write your note, save
- **Flashcards** — Visit `/flashcards` to see quiz questions as flip cards from your enrolled courses
- **Progress** — Visit `/progress` to see per-course completion with lesson-level detail

### Checking Grades

1. Visit `/grades`
2. View overall GPA, letter grade, and radial score chart
3. Toggle between Card view and Table view
4. Expand any course to see per-lesson score breakdowns

### Messaging an Instructor

1. Visit `/chat`
2. Click the **+** button to start a new conversation
3. Select an instructor from your enrolled courses
4. Type your message and press Enter
5. New messages arrive in real-time with 5-second polling

### Exploring VR Features

- **Virtual Classroom** — Navigate to any VR lesson or `/classroom/[lessonId]`
- **3D Campus** — Visit `/campus` and click buildings for info
- **Science Lab** — Visit `/lab` to see 3D chemistry equipment
- **AR Posters** — Visit `/posters` and click any poster to view in 3D

---

## Instructor Guide

### Signing In

1. Navigate to `/login`
2. Enter email: `instructor@arelms.com`
3. Enter password: `password123`
4. You will be redirected to the Dashboard with instructor access

### Creating Courses

Courses can be created via the API:

```bash
POST /api/courses
Content-Type: application/json

{
  "title": "Course Title",
  "description": "Course description",
  "instructorId": "<instructor-id>",
  "category": "Technology",
  "difficulty": "Beginner",
  "estimatedHours": 20,
  "published": true
}
```

### Managing Students

- Students appear in your Messages when they contact you
- View student progress and grades through the analytics system
- Respond to student inquiries via the chat system at `/chat`

---

## Pages & Routes

### Public Pages (with sidebar)

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, features, courses, testimonials, FAQ |
| `/login` | Sign-in page |
| `/register` | Registration page |
| `/courses` | Course catalog with filters |
| `/courses/[id]` | Course detail with module/lesson tree |
| `/courses/[id]/lessons/[lessonId]` | Lesson player with video/article/quiz/VR |
| `/progress` | Per-course progress tracking |
| `/grades` | Grade report with charts and tables |
| `/analytics` | Student analytics dashboard |
| `/notes` | Per-lesson study notes |
| `/flashcards` | Flip-to-reveal study cards |
| `/achievements` | Gamification badges and progress |
| `/leaderboard` | Student rankings |
| `/chat` | Student-instructor messaging |
| `/posters` | AR educational poster gallery |
| `/posters/[id]` | Individual poster 3D viewer |
| `/lab` | Virtual science lab (3D) |
| `/campus` | 3D campus map |
| `/classroom/[lessonId]` | Virtual classroom (3D) |

### Dashboard Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard with stats, quick links, recent activity |
| `/dashboard/id` | Printable student ID card |
| `/dashboard/settings` | Profile editing and password change |

---

## API Endpoints

### Authentication

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Authenticate user, returns user object |
| POST | `/api/auth/register` | Create new user account |
| GET | `/api/auth/profile?id=` | Get user profile |
| PATCH | `/api/auth/profile` | Update user profile (name, bio, avatar) |

### Courses

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/courses` | List published courses (with filters) |
| POST | `/api/courses` | Create a new course |
| GET | `/api/courses/[id]` | Get course detail with modules/lessons |
| PATCH | `/api/courses/[id]` | Update course |
| DELETE | `/api/courses/[id]` | Delete course |

### Learning

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/enrollments?userId=` | Get user enrollments |
| POST | `/api/enrollments` | Enroll in a course |
| GET | `/api/questions?lessonId=` | Get quiz questions |
| POST | `/api/questions` | Submit quiz answer |
| GET | `/api/progress?userId=&lessonId=` | Get progress status |
| POST | `/api/progress` | Update lesson progress |
| GET | `/api/grades?userId=` | Get computed grades with GPA |
| GET | `/api/notes?userId=` | Get user notes |
| POST | `/api/notes` | Create or update a note |
| DELETE | `/api/notes?id=&userId=` | Delete a note |

### Study Tools

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/flashcards?userId=` | Get quiz questions as flashcards |
| GET | `/api/leaderboard` | Get student rankings |

### Gamification

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/achievements?userId=` | Get achievements with progress |
| POST | `/api/achievements` | Update achievement progress |
| GET | `/api/streaks?userId=` | Get current and longest streaks |

### VR & 3D

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/vr-content` | List all VR content |
| POST | `/api/vr-content` | Create VR content |
| GET | `/api/posters` | List AR posters |
| GET | `/api/posters/[id]` | Get poster detail |
| POST | `/api/posters` | Create a poster |
| GET | `/api/lab` | List lab experiments |
| GET | `/api/campus` | List campus buildings |
| GET | `/api/classroom/[lessonId]` | Get lesson VR data |
| GET | `/api/resources?moduleId=` | Get module resources |

### Communication

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/chat?userId=` | Get conversations |
| GET | `/api/chat?userId=&otherUserId=` | Get message thread |
| POST | `/api/chat` | Send a message |
| PUT | `/api/chat` | Mark messages as read |
| POST | `/api/chatbot` | Query the chatbot |

### Analytics

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/analytics?userId=` | Get student analytics data |

### Files

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/upload` | Upload image (max 5MB) |

---

## Database Schema

The system uses SQLite with 18 models managed via Prisma ORM:

| Model | Purpose |
|-------|---------|
| **User** | Students and instructors |
| **Course** | Courses with metadata and instructor reference |
| **Module** | Course sub-sections (ordered) |
| **Lesson** | Individual lessons (video, article, quiz, or VR) |
| **Question** | Quiz questions for lessons |
| **Progress** | Per-user per-lesson completion tracking |
| **Submission** | Quiz answer submissions |
| **Enrollment** | User-course enrollment links |
| **Note** | Per-lesson user notes |
| **VRContent** | 3D/VR scene configuration per lesson |
| **Message** | Chat messages between users |
| **ARPoster** | 3D educational posters |
| **CampusBuilding** | 3D campus map buildings |
| **LabExperiment** | Virtual science lab experiments |
| **Achievement** | Gamification badge definitions |
| **UserAchievement** | Per-user achievement progress |
| **ModuleResource** | Supplementary resources per module |
| **CourseTag** | Course taxonomy tags |

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **UI** | React 19, Tailwind CSS v4 |
| **3D Rendering** | Three.js r184, OrbitControls, CSS2DRenderer |
| **Database** | SQLite via Prisma ORM 7.8 |
| **Auth** | bcrypt password hashing + localStorage |
| **Fonts** | Geist (Geist Sans + Geist Mono) |

### Architecture Notes

- **Authentication** is client-side: user data is stored in `localStorage` after login. No JWT or session middleware.
- **"AR" features** (Posters, Campus, Lab) are browser-based Three.js 3D scenes, not actual augmented reality. No WebXR or camera access required.
- **Chat** uses 5-second polling (no WebSocket).
- **File uploads** are stored on disk in `public/uploads/`.
- **Achievement tracking** is embedded in the API routes (progress, notes, questions) — unlocks happen automatically when thresholds are met.

---

## Development

### Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npx prisma db seed   # Seed database with demo data
npx prisma migrate dev  # Apply schema changes
npx prisma generate  # Regenerate Prisma client
```

### Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── (public)/                 # Public pages with sidebar
│   │   ├── layout.tsx
│   │   ├── login/
│   │   ├── register/
│   │   ├── courses/
│   │   ├── progress/
│   │   ├── grades/
│   │   ├── notes/
│   │   ├── flashcards/
│   │   ├── achievements/
│   │   ├── leaderboard/
│   │   ├── lab/
│   │   ├── campus/
│   │   ├── posters/
│   │   ├── classroom/
│   │   ├── chat/
│   │   └── analytics/
│   ├── dashboard/                # Dashboard pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── id/                   # Student ID card
│   │   └── settings/             # Profile settings
│   └── api/                      # API routes
│       ├── auth/
│       ├── courses/
│       ├── enrollments/
│       ├── questions/
│       ├── progress/
│       ├── grades/
│       ├── notes/
│       ├── flashcards/
│       ├── achievements/
│       ├── posters/
│       ├── lab/
│       ├── campus/
│       ├── chat/
│       ├── chatbot/
│       ├── analytics/
│       ├── leaderboard/
│       ├── streaks/
│       ├── resources/
│       ├── vr-content/
│       ├── upload/
│       └── classroom/
└── components/                   # Shared components
    ├── sidebar.tsx
    ├── chatbot.tsx
    ├── logo.tsx
    ├── animations.tsx
    ├── campus-viewer.tsx
    ├── lab-viewer.tsx
    ├── poster-viewer.tsx
    ├── scene-viewer.tsx
    └── virtual-classroom.tsx
```

---

*STEAM ELMS — Immersive VR Learning Management System*
