<h1 align="center">Exam Prep Pro</h1>

<p align="center">
  <strong>A gamified, social, and AI-powered study companion designed to make exam preparation highly engaging and effective</strong>
</p>
<p align="center">
  <a href="https://examprep-dusky.vercel.app/">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_App-success?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo">
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/Gemini_AI-Integration-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-database-schema-highlights">Database Schema</a>
</p>

---

## 📖 Overview

**Exam Prep Pro** (formerly StudyArcade) is a modern, gamified study management platform built for students preparing for exams. It transforms the traditional study experience into an engaging journey with real-time social progress tracking, automated study streaks, an advanced AI-powered assistant, and immersive focus modes — all wrapped in a premium, responsive UI.

### Why Exam Prep Pro?

- 🎯 **Goal-Oriented**: Track your exam dates, Past Year Questions (PYQs), Notes, and syllabus completion in real-time
- 🔥 **Motivating**: Study streaks, GitHub-style activity heatmaps, and friend progress comparison keep you accountable
- 👑 **Admin Control**: Robust role-based access control (RBAC) and Admin Panel for platform oversight
- 🧘 **Focus-First**: Alpha Learning Mode provides distraction-free study sessions with ambient music
- 🤖 **Gemini AI-Powered**: Built-in floating AI study buddy (Enhanced Chat) for instant explanations
- 📱 **Offline & Push Ready**: Full PWA support with Web Push Notifications for study alerts

---

## ✨ Features

### 📊 Dashboard & Progress Tracking
| Feature | Description |
|---------|-------------|
| **Dynamic Island** | iOS-inspired notification hub showing next exam countdown and alerts |
| **Real-time Progress** | Live percentage tracking across all subjects and topics via Supabase |
| **Study Streak** | Consecutive days tracker with smart break detection |
| **GitHub-Style Heatmap** | 365-day activity visualization of your study sessions |
| **PDF Export** | Instantly export your progress, study notes, and analytics to PDF |

### 👥 Social & Collaboration
- **Friends System**: Add friends via their username and build a study network
- **Progress Comparison**: View and compare syllabus completion percentages with your friends in real-time
- **Leaderboards & Accountability**: Stay motivated by tracking peers' activity and streaks

### 👑 Role-Based Admin Panel
- **Absolute Access**: Secure, JWT-based Admin dashboard for platform oversight
- **User Management**: View all registered users, their global progress, and friend networks
- **Resource Management**: Upload, edit, and manage Subject Notes and Past Year Questions (PYQs)
- **RLS Secured**: Strict Row Level Security policies ensure data privacy for non-admin users

### 🤖 Enhanced AI Study Buddy (Gemini)
Powered by Google's Gemini AI for intelligent study assistance:
- **Floating Chat Popup**: Access your AI tutor from any page without losing your context
- **Context-Aware Streaming**: Real-time AI responses tailored to your current subject
- **Conversation History**: Persistent chat history saved to the database for future reference
- **Exam-Oriented Prompts**: Pre-defined prompts for complex topic breakdown and code explanations

### 📚 Resource Library (Notes & PYQs)
- **Subject-Specific Hubs**: Instantly access dedicated Notes and PYQs for each subject
- **Admin Managed Content**: Resources are managed strictly by Admins to maintain quality
- **Streamlined Navigation**: Clean UI that hides complex resource management from standard students

### ⚡ Alpha Learning Mode & Global Music
A revolutionary distraction-free study environment:
- **Immersive Full-Screen**: Eliminates all UI distractions with a configurable countdown timer
- **Ambient Vibes**: Integrated global lo-fi music player (YouTube integration) with preset stations
- **Integrated Syllabus**: Check off topics while listening to music and studying

### 🔔 Push Notifications & Alerts
- **Web Push API**: Receive real-time browser notifications for upcoming exams
- **Emergency Alerts**: Configured Edge Functions to dispatch critical study reminders

### 📴 Offline Support (PWA)
- **Offline Mode**: Complete app functionality without internet (caches via Workbox)
- **Progress Queue**: Actions queue locally when offline, and sync seamlessly when back online
- **Native Install**: App-like installation on iOS, Android, and Desktop

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI library with concurrent features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling with custom tokens |
| **Vite** | Lightning-fast build tool |
| **React Router v6** | Client-side routing |

### UI Components
| Library | Purpose |
|---------|---------|
| **shadcn/ui** | Accessible component primitives |
| **Radix UI** | Headless UI components |
| **Lucide React** | Beautiful icon library |
| **Recharts** | Data visualization charts |
| **Sonner** | Toast notifications |

### Backend & Database
| Service | Purpose |
|---------|---------|
| **Supabase** | PostgreSQL database & Authentication |
| **Supabase RLS** | Advanced Row Level Security for Admin/User roles |
| **Edge Functions** | Serverless API endpoints for push notifications |
| **Gemini API** | Advanced AI integration for the Enhanced Chat |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jaidevxr/ExamPrep.git

# Navigate to project directory
cd ExamPrep

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

**Required Environment Variables (`.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

```bash
# Start development server
npm run dev
```

---

## 🗃 Database Schema Highlights

### Key Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profile data, usernames, avatars, and roles |
| `study_progress` | Topic completion records |
| `friendships` | Tracks requester_id and addressee_id for social features |
| `resources` | Admin-uploaded Notes and PYQs mapped to subjects |
| `conversations` & `messages` | AI chat history management |

---

## 🤝 Contributing
Contributions are welcome! Please read our contributing guidelines before submitting PRs.
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments
- **shadcn/ui** for the beautiful component primitives
- **Google Gemini** for powering the AI assistant
- **Supabase** for the flawless backend experience

<p align="center">
  <strong>Made with 💜 for students, by a student</strong>
</p>
