
<h1 align="center">Exam Prep</h1>

<p align="center">
  <strong>A gamified study companion designed to make exam preparation engaging and effective</strong>
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
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 📖 Overview

**StudyArcade** is a modern, gamified study management platform built for students preparing for exams. It transforms the traditional study experience into an engaging journey with progress tracking, study streaks, AI-powered assistance, and immersive focus modes — all wrapped in a retro arcade-inspired aesthetic.

### Why StudyArcade?

- 🎯 **Goal-Oriented**: Track your exam dates and syllabus completion in real-time
- 🔥 **Motivating**: Study streaks and GitHub-style activity heatmaps keep you accountable
- 🧘 **Focus-First**: Alpha Learning Mode provides distraction-free study sessions
- 🤖 **AI-Powered**: Built-in AI study buddy for instant explanations and study assistance
- 📱 **Offline-Ready**: Full PWA support for studying anywhere, anytime
- 🎵 **Ambient Vibes**: Integrated lo-fi music player for the perfect study atmosphere

---

## ✨ Features

### 📊 Dashboard & Progress Tracking

| Feature | Description |
|---------|-------------|
| **Dynamic Island** | iOS-inspired notification hub showing next exam countdown |
| **Real-time Progress** | Live percentage tracking across all subjects and topics |
| **Study Streak** | Consecutive days tracker with smart break detection |
| **Exam Missions** | Card and list views for exam countdown with progress bars |
| **Quick Stats** | At-a-glance metrics for overall progress, subjects, streak, and days until next exam |

### 📚 Subject Management

- **Hierarchical Organization**: Subjects → Units → Topics structure
- **Topic Completion Tracking**: Check off topics as you study them
- **Important Topic Markers**: Highlight high-priority topics for focused revision
- **Section Headers**: Visual separation within units for better organization
- **Subject Color Coding**: Distinct colors for easy identification
- **Exam Date & Time Display**: Full exam schedule visibility

### ⚡ Alpha Learning Mode

A revolutionary distraction-free study environment:

- **Immersive Full-Screen Mode**: Eliminates all UI distractions
- **Countdown Timer**: Configurable study session duration (15-120 minutes)
- **Integrated Syllabus View**: Check off topics while studying
- **Music Controls**: Ambient study music without leaving the mode
- **Progress Tracking**: Real-time subject completion percentage
- **Confirmation Exit**: Prevents accidental session termination

### 🤖 AI Study Buddy

Powered by advanced AI models for intelligent study assistance:

- **Streaming Responses**: Real-time AI responses for natural conversations
- **Conversation History**: Persistent chat history saved to database
- **Conversation Search**: Find past conversations quickly
- **Quick Prompts**: Pre-defined study prompts for common questions
- **Multi-Session Support**: Create and manage multiple conversation threads

### 📅 Study Planner

Organize your daily study schedule:

- **Time-Period Tasks**: Morning, Afternoon, and Night study blocks
- **Time Estimation**: Assign estimated study time per task
- **Subject Tagging**: Associate tasks with specific subjects
- **Progress Tracking**: Daily completion percentage
- **Total Time Metrics**: Track planned vs completed study time

### 📈 Analytics & Insights

Comprehensive study analytics dashboard:

| Component | Description |
|-----------|-------------|
| **Study Heatmap** | 365-day GitHub-style activity visualization |
| **Subject Progress Chart** | Bar chart comparing subject completion |
| **Completion Pie Chart** | Visual breakdown of completed vs remaining topics |
| **Weekly/Monthly Stats** | Trend analysis with percentage change indicators |
| **Exam Readiness Meter** | Days remaining vs progress for each exam |
| **Detailed Breakdown** | Per-subject topic completion metrics |

### 🎵 Global Music Player

Ambient study music integration:

- **YouTube Integration**: Stream live lo-fi radio stations
- **Preset Stations**: Lofi Girl, Chillhop Radio, College Music
- **Custom Songs**: Add your own YouTube videos as music sources
- **Global Controls**: Play/pause/volume accessible from any page
- **Alpha Learning Integration**: Automatic music control in focus mode
- **Seek & Progress**: Track playback position and duration

### 🔐 Authentication System

Secure user authentication:

- **Email/Password Auth**: Traditional sign-up and login
- **Password Reset**: Email-based password recovery
- **Protected Routes**: Secure access to all app features
- **Session Persistence**: Stay logged in across browser sessions
- **Profile Management**: Customize username and avatar

### 📴 Offline Support (PWA)

Full progressive web app capabilities:

- **Offline Mode**: Complete app functionality without internet
- **Progress Queue**: Actions queue locally when offline, sync when online
- **Install Prompt**: Native app-like installation on any device
- **Status Indicator**: Visual online/offline status with sync progress
- **Service Worker**: Background sync and caching strategies
- **Smart Caching**: Pre-cache critical assets for instant loading

### 🎨 Design System

Retro arcade-inspired UI with modern sensibilities:

- **Arcade Typography**: Custom pixel-inspired font styling
- **Minecraft Blocks**: Unique card components with blocky borders
- **Color Themes**: Semantic color tokens for consistent theming
- **Dark Mode Ready**: Full dark mode support
- **Responsive Design**: Mobile-first approach for all screen sizes
- **Smooth Animations**: Polished micro-interactions throughout

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18.3** | UI library with concurrent features |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Vite** | Lightning-fast build tool |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management |

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
| **Supabase** | PostgreSQL database & auth |
| **Edge Functions** | Serverless API endpoints |
| **Real-time Subscriptions** | Live data synchronization |

### PWA & Offline

| Technology | Purpose |
|------------|---------|
| **vite-plugin-pwa** | PWA generation |
| **Workbox** | Service worker strategies |
| **LocalStorage** | Offline data persistence |

---

## 🏗 Architecture

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives
│   ├── AlphaLearningMode.tsx
│   ├── ArcadeNavbar.tsx
│   ├── ArcadeTimer.tsx
│   ├── DynamicIsland.tsx
│   ├── ExamCalendar.tsx
│   ├── ExamCountdown.tsx
│   ├── GlobalMusicPlayer.tsx
│   ├── MusicPlayer.tsx
│   ├── OfflineIndicator.tsx
│   ├── PWAInstallPrompt.tsx
│   ├── StudyHeatmap.tsx
│   └── ...
├── contexts/            # React context providers
│   ├── AlphaLearningContext.tsx
│   ├── AuthContext.tsx
│   └── MusicPlayerContext.tsx
├── hooks/               # Custom React hooks
│   ├── useCloudProgress.ts
│   ├── useLocalStorage.ts
│   ├── useOfflineQueue.ts
│   ├── useProfile.ts
│   └── useStudyStreak.ts
├── pages/               # Route components
│   ├── Analytics.tsx
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── EnhancedChat.tsx
│   ├── Planner.tsx
│   ├── ProfileSettings.tsx
│   ├── SubjectDetail.tsx
│   └── Subjects.tsx
├── data/                # Static data
│   └── subjects.ts      # Subject/topic definitions
├── integrations/        # Third-party integrations
│   └── supabase/
├── lib/                 # Utility functions
└── main.tsx             # App entry point
```

### Data Flow

```
┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Context APIs   │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Custom Hooks   │────▶│   Supabase      │
└─────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Local Storage  │◀───▶│   PostgreSQL    │
│  (Offline)      │     │   (Cloud)       │
└─────────────────┘     └─────────────────┘
```

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
# Add your Supabase credentials to .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

---

## 📱 PWA Installation

### Desktop (Chrome/Edge)

1. Visit the deployed app
2. Click the install icon in the address bar
3. Or click "Install ExamPrep" in the app prompt

### Mobile (iOS)

1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### Mobile (Android)

1. Open in Chrome
2. Tap the install banner or menu → "Install app"

---

## 🗃 Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (username, avatar, preferences) |
| `study_progress` | Topic completion records with timestamps |
| `conversations` | AI chat conversation metadata |
| `messages` | Individual chat messages |

### Key Relationships

```sql
-- study_progress tracks per-user topic completion
study_progress {
  id: uuid
  user_id: uuid (FK → auth.users)
  subject_id: string
  topic_id: string
  completed: boolean
  completed_at: timestamp
}

-- conversations belong to users
conversations {
  id: uuid
  user_id: uuid (FK → auth.users)
  title: string
  created_at: timestamp
  updated_at: timestamp
}

-- messages belong to conversations
messages {
  id: uuid
  conversation_id: uuid (FK → conversations)
  role: string ('user' | 'assistant')
  content: text
  created_at: timestamp
}
```

---

## 🚀 Roadmap

### Phase 1: Core Enhancements ✅

- [x] Basic progress tracking
- [x] Subject management
- [x] Alpha Learning Mode
- [x] Music player integration
- [x] Study analytics
- [x] PWA offline support

### Phase 2: Intelligence Layer

- [ ] **Spaced Repetition System**: Smart revision scheduling based on forgetting curves
- [ ] **AI-Generated Flashcards**: Automatic flashcard creation from topics
- [ ] **Study Recommendations**: ML-powered suggestions for what to study next
- [ ] **Weakness Detection**: Identify struggling topics from patterns
- [ ] **Performance Predictions**: Exam readiness predictions

### Phase 3: Social & Collaboration

- [ ] **Study Groups**: Create and join study circles
- [ ] **Leaderboards**: Compete with friends on study metrics
- [ ] **Shared Notes**: Collaborative note-taking per topic
- [ ] **Accountability Partners**: Paired study tracking
- [ ] **Achievement Badges**: Gamified rewards for milestones

### Phase 4: Content & Resources

- [ ] **Video Integration**: Embed educational videos per topic
- [ ] **PDF Viewer**: In-app document reading
- [ ] **Note Taking**: Rich text notes attached to topics
- [ ] **External Links**: Curated resource links per subject
- [ ] **Quiz Mode**: Self-assessment quizzes

### Phase 5: Platform Expansion

- [ ] **Native Mobile Apps**: React Native iOS/Android apps
- [ ] **Browser Extension**: Quick access from any tab
- [ ] **Desktop App**: Electron-based desktop application
- [ ] **Voice Commands**: Hands-free study mode controls
- [ ] **Widgets**: Home screen widgets for mobile

### Future Optimizations

| Area | Optimization |
|------|--------------|
| **Performance** | Code splitting, lazy loading, image optimization |
| **Accessibility** | WCAG 2.1 AA compliance, screen reader support |
| **Localization** | Multi-language support, date/time formatting |
| **Analytics** | Enhanced study insights, export capabilities |
| **Sync** | Conflict resolution, multi-device sync |
| **Caching** | Aggressive SW caching, background sync |

---

## 🔧 Configuration

### Customizing Subjects

Edit `src/data/subjects.ts` to modify the syllabus:

```typescript
export const subjects: Subject[] = [
  {
    id: "unique-subject-id",
    name: "Subject Name",
    code: "SUBJ101",
    examDate: "2025-12-15",
    examTime: "10:00 AM - 1:00 PM",
    color: "primary", // primary | secondary | accent | success | warning
    units: [
      {
        id: "unit-1",
        title: "Unit Title",
        topics: [
          { 
            id: "topic-1", 
            title: "Topic Name", 
            completed: false, 
            important: true,
            isHeading: false 
          },
          // ...
        ]
      }
    ]
  }
];
```

### Theming

Customize colors in `src/index.css`:

```css
:root {
  --primary: 262 83% 58%;
  --secondary: 330 81% 60%;
  --accent: 199 89% 48%;
  --success: 142 76% 36%;
  --warning: 38 92% 50%;
  /* ... */
}
```

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component primitives
- **Lofi Girl** for the study music inspiration
- **GitHub** for the activity heatmap design inspiration
- All the students who inspired this project

---

<p align="center">
  <strong>Made with 💜 for students, by student</strong>
</p>

<p align="center">
  <sub>Study hard, play hard. Level up your learning! 🎮📚</sub>
</p>
