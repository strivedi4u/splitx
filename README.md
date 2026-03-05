<div align="center">

# 💰 SplitX — Smart Expense Sharing

### Split expenses effortlessly with friends, roommates, and travel buddies.

A **production-ready**, full-stack group expense splitting application with a premium dark-gold UI, real-time balance tracking, and native Android support.

[![GitHub Stars](https://img.shields.io/github/stars/strivedi4u/splitx?style=for-the-badge&logo=github&color=gold)](https://github.com/strivedi4u/splitx/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/strivedi4u/splitx?style=for-the-badge&logo=github&color=silver)](https://github.com/strivedi4u/splitx/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/strivedi4u/splitx?style=for-the-badge&logo=github&color=red)](https://github.com/strivedi4u/splitx/issues)
[![MIT License](https://img.shields.io/github/license/strivedi4u/splitx?style=for-the-badge&color=blue)](LICENSE)

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Capacitor](https://img.shields.io/badge/Capacitor-8-119EFF?style=flat-square&logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Last Commit](https://img.shields.io/github/last-commit/strivedi4u/splitx?style=flat-square&color=orange)](https://github.com/strivedi4u/splitx/commits/master)

<br/>

**[🌐 Live Demo](https://splitx.azurewebsites.net)** · **[📱 Download APK](https://github.com/strivedi4u/splitx/releases)** · **[🐛 Report Bug](https://github.com/strivedi4u/splitx/issues/new?template=bug_report.md)** · **[✨ Request Feature](https://github.com/strivedi4u/splitx/issues/new?template=feature_request.md)**

---

> ⭐ **If you find SplitX useful, please consider giving it a star!** It helps others discover this project and motivates further development.

</div>

---

<!-- ## 🎬 Preview -->

<!-- <div align="center"> -->

<!-- Replace with actual screenshots or GIF of your app -->
<!-- <table>
<tr>
<td align="center"><b>🏠 Dashboard</b></td>
<td align="center"><b>👥 Group View</b></td>
<td align="center"><b>💸 Add Expense</b></td>
</tr>
<tr>
<td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="250"/></td>
<td><img src="docs/screenshots/group-detail.png" alt="Group Detail" width="250"/></td>
<td><img src="docs/screenshots/add-expense.png" alt="Add Expense" width="250"/></td>
</tr>
</table> -->

<!-- > 📸 *Add your screenshots to `docs/screenshots/` to showcase your app!* -->

<!-- </div> -->

---

## 🤔 Why SplitX?

| Feature | SplitX | Splitwise | Tricount |
|---------|:------:|:---------:|:--------:|
| 🆓 **Completely Free** | ✅ | ❌ (Premium) | ✅ |
| 🔓 **Open Source** | ✅ | ❌ | ❌ |
| 🏗️ **Self-Hostable** | ✅ | ❌ | ❌ |
| 📱 **Native Android** | ✅ | ✅ | ✅ |
| 🌙 **Premium Dark UI** | ✅ | ❌ | ❌ |
| 📊 **Spending Analytics** | ✅ | ✅ (Paid) | ❌ |
| 📷 **Receipt Uploads** | ✅ | ✅ (Paid) | ❌ |
| 🔐 **JWT Auth** | ✅ | OAuth | OAuth |
| 🗄️ **No Database Needed** | ✅ (JSON) | Cloud | Cloud |
| 🚀 **One-Click Deploy** | ✅ | ❌ | ❌ |

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Data Flow](#-data-flow)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Android Build](#-android-build)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏠 **Group Management** | Create groups, invite members via unique codes, manage multiple expense groups |
| 💸 **Expense Tracking** | Add expenses with equal/unequal/percentage splits, attach receipt images |
| ⚖️ **Smart Balances** | Real-time per-group and overall balance calculation (who owes whom) |
| 🤝 **Settlements** | Record payments between members to settle debts |
| 📊 **Dashboard** | Visual spending analytics with pie charts and category breakdowns |
| 📱 **Activity Feed** | Chronological feed of all expenses, settlements, and group events |
| 🔔 **Notifications** | In-app notification system with bell indicator |
| 🔐 **Authentication** | JWT-based signup/login with secure token storage |
| 👤 **Profiles** | Customizable user profiles with avatars, colors, and password management |
| 📦 **In-App Updates** | Version checker with update prompts for the Android app |
| 🌙 **Premium Dark UI** | Gold-themed glassmorphism design with smooth Framer Motion animations |
| 📱 **Native Android** | Full Android APK via Capacitor with camera, filesystem, and notification support |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework with functional components & hooks |
| **TypeScript 5.8** | Type-safe development |
| **Vite 5** | Lightning-fast dev server & build tool |
| **Tailwind CSS 3** | Utility-first styling with custom dark-gold theme |
| **Framer Motion** | Page transitions & micro-animations |
| **React Router 6** | Client-side routing (SPA) |
| **TanStack Query** | Server state management & caching |
| **Recharts** | Data visualization (pie charts, spending analytics) |
| **Lucide React** | Icon library |
| **Radix UI** | Accessible primitives (toast, tooltip, scroll-area) |
| **Sonner** | Toast notification system |
| **Capacitor 8** | Native Android bridge (camera, filesystem, notifications) |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 18+** | JavaScript runtime |
| **Express 4** | RESTful API framework |
| **JSON File Storage** | Zero-dependency flat-file database (no MongoDB/SQL needed) |
| **JWT** | Stateless authentication via `jsonwebtoken` |
| **bcryptjs** | Secure password hashing |
| **Multer** | Image upload handling (receipt photos) |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin request handling |
| **Morgan** | HTTP request logging |
| **express-rate-limit** | API rate limiting (300 req/15min) |

### DevOps & Tooling
| Tool | Purpose |
|------|---------|
| **ESLint 9** | Code linting (flat config) |
| **Vitest** | Unit testing framework |
| **PostCSS + Autoprefixer** | CSS processing |
| **Azure App Service** | Backend hosting (production) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐   │
│  │  React SPA   │    │  Capacitor   │    │   Android APK    │   │
│  │  (Browser)   │◄──►│   Bridge     │◄──►│  (Native Shell)  │   │
│  └──────┬───────┘    └──────────────┘    └──────────────────┘   │
│         │                                                       │
│  ┌──────┴───────────────────────────────────────────────┐       │
│  │              State Management Layer                   │       │
│  │  AuthContext ─── AppContext ─── NotificationContext    │       │
│  └──────┬────────────────────────────────────────────────┘       │
│         │                                                       │
│  ┌──────┴───────┐                                               │
│  │   API Client  │  apiFetch() — centralized HTTP client         │
│  │  (api.ts)    │  JWT token injection, error handling          │
│  └──────┬───────┘                                               │
└─────────┼───────────────────────────────────────────────────────┘
          │  HTTPS / REST
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       SERVER LAYER                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐       │
│  │                Express.js Server                      │       │
│  │                                                       │       │
│  │  Middleware Pipeline:                                 │       │
│  │  Helmet → CORS → JSON Parser → Morgan → Rate Limit   │       │
│  │                                                       │       │
│  │  ┌─────────────────────────────────────────────┐     │       │
│  │  │              Route Layer                     │     │       │
│  │  │  /api/auth         → authController          │     │       │
│  │  │  /api/groups       → groupController         │     │       │
│  │  │  /api/expenses     → expenseController       │     │       │
│  │  │  /api/settlements  → settlementController    │     │       │
│  │  │  /api/activities   → activityController      │     │       │
│  │  │  /api/users        → userRoutes              │     │       │
│  │  │  /api/admin        → adminRoutes             │     │       │
│  │  │  /api/notifications→ notificationRoutes      │     │       │
│  │  │  /api/upload       → multer (image uploads)  │     │       │
│  │  └──────────────────┬──────────────────────────┘     │       │
│  │                     │                                 │       │
│  │  ┌──────────────────┴──────────────────────────┐     │       │
│  │  │           Data Access Layer (db.js)          │     │       │
│  │  │   getAll · getById · findOne · findMany      │     │       │
│  │  │   insert · updateById · deleteById           │     │       │
│  │  └──────────────────┬──────────────────────────┘     │       │
│  └─────────────────────┼────────────────────────────────┘       │
│                        ▼                                         │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              JSON File Storage (./data/)                │     │
│  │  users.json · groups.json · expenses.json               │     │
│  │  settlements.json · activities.json · app_version.json  │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │  Static Assets: /uploads/ (images) · /downloads/ (APK)  │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
splitX/
├── src/                          # ── Frontend (React + TypeScript) ──
│   ├── App.tsx                   # Root — routes, providers, toasts
│   ├── main.tsx                  # Entry — renders App into #root
│   ├── index.css                 # Global styles + Tailwind + CSS variables
│   │
│   ├── types/                    # Shared TypeScript interfaces
│   │   └── index.ts              # User, Group, Expense, Settlement, ActivityItem
│   │
│   ├── components/               # UI Components
│   │   ├── AuthScreen.tsx        # Login / Signup with animated transitions
│   │   ├── WelcomeScreen.tsx     # Onboarding welcome screen
│   │   ├── Dashboard.tsx         # Balances, charts, recent activity
│   │   ├── Groups.tsx            # Group listing with search
│   │   ├── GroupDetail.tsx       # Group view — expenses, members, balances
│   │   ├── AddExpenseSheet.tsx   # Bottom sheet — add expense
│   │   ├── SettleUpSheet.tsx     # Settlement recording
│   │   ├── CreateGroupSheet.tsx  # Create new group
│   │   ├── JoinGroupSheet.tsx    # Join group via invite code
│   │   ├── ActivityScreen.tsx    # Activity feed timeline
│   │   ├── ProfileScreen.tsx     # User profile & settings
│   │   ├── NotificationBell.tsx  # Notification indicator + dropdown
│   │   ├── SendNotificationSheet.tsx # Admin notification sender
│   │   ├── ExpenseImageViewer.tsx    # Full-screen receipt viewer
│   │   ├── UpdateChecker.tsx     # In-app version update prompt
│   │   ├── AnimatedNumber.tsx    # Spring-animated number display
│   │   ├── BottomNav.tsx         # Tab navigation bar
│   │   ├── NavLink.tsx           # Navigation link component
│   │   └── ui/                   # Radix-based UI primitives
│   │       ├── scroll-area.tsx
│   │       ├── sonner.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── tooltip.tsx
│   │
│   ├── context/                  # React Context providers
│   │   ├── AuthContext.tsx       # JWT auth state management
│   │   ├── AppContext.tsx        # Groups, expenses, settlements, balances
│   │   └── NotificationContext.tsx
│   │
│   ├── pages/                    # Route pages
│   │   ├── Index.tsx             # Main app (tabs: dashboard/groups/activity/profile)
│   │   ├── Admin.tsx             # Admin dashboard
│   │   └── NotFound.tsx          # 404 page
│   │
│   ├── lib/                      # Utilities
│   │   ├── api.ts                # Centralized API client with JWT injection
│   │   ├── utils.ts              # Tailwind cn() merge helper
│   │   └── deviceNotifications.ts # Capacitor local notifications
│   │
│   └── hooks/                    # Custom React hooks
│       ├── use-mobile.tsx        # Mobile device detection
│       └── use-toast.ts          # Toast notification hook
│
├── backend/                      # ── Backend (Node.js + Express) ──
│   ├── index.js                  # Entry — starts server on PORT
│   ├── package.json              # Backend dependencies
│   ├── web.config                # Azure IIS configuration
│   ├── .env.example              # Environment variable template
│   │
│   ├── src/
│   │   ├── server.js             # Express app — middleware, routes, errors
│   │   ├── config/
│   │   │   └── db.js             # JSON file DB — generic CRUD helpers
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT authentication middleware
│   │   ├── models/               # Data models
│   │   │   ├── User.js
│   │   │   ├── Group.js
│   │   │   ├── Expense.js
│   │   │   ├── Settlement.js
│   │   │   └── Activity.js
│   │   ├── controllers/          # Business logic
│   │   │   ├── authController.js
│   │   │   ├── groupController.js
│   │   │   ├── expenseController.js
│   │   │   ├── settlementController.js
│   │   │   └── activityController.js
│   │   └── routes/               # Route definitions
│   │       ├── authRoutes.js
│   │       ├── groupRoutes.js
│   │       ├── expenseRoutes.js
│   │       ├── settlementRoutes.js
│   │       ├── activityRoutes.js
│   │       ├── userRoutes.js
│   │       ├── adminRoutes.js
│   │       └── notificationRoutes.js
│   │
│   ├── data/                     # JSON file storage (gitignored)
│   ├── uploads/                  # Receipt images (runtime)
│   ├── downloads/                # APK distribution
│   ├── public/                   # Static pages (landing, admin)
│   └── scripts/
│       └── cleanupUsers.js       # Utility script
│
├── android/                      # ── Capacitor Android Project ──
│   └── app/src/main/
│       ├── AndroidManifest.xml   # Permissions & app config
│       ├── java/com/splitx/app/  # Native entry point
│       ├── res/                  # Icons, splash screens, layouts
│       └── assets/               # Bundled web app
│
├── index.html                    # Vite SPA entry
├── vite.config.ts                # Vite config
├── tailwind.config.ts            # Tailwind theme (dark-gold)
├── tsconfig.json                 # TypeScript config
├── capacitor.config.json         # Capacitor native config
├── .env.example                  # Frontend env template
├── .gitignore                    # Git ignore rules
├── LICENSE                       # MIT License
└── README.md                     # You are here
```

---

## 🔄 Data Flow

### Authentication Flow

```
User enters credentials
        │
        ▼
  AuthScreen.tsx
        │
        ▼
  AuthContext.tsx ──► apiFetch('/auth/login') ──► Backend /api/auth/login
        │                                              │
        │                                    authController.js
        │                                    bcrypt.compare(password)
        │                                    jwt.sign({ userId })
        │                                              │
        ◄──────────────── { token, user } ◄────────────┘
        │
  localStorage.setItem('splitx_token', token)
        │
        ▼
  App renders authenticated UI
```

### Expense Creation Flow

```
User fills expense form
        │
        ▼
  AddExpenseSheet.tsx
        │
        ▼
  AppContext.addExpense()
        │
        ▼
  apiFetch('/expenses', POST, { description, amount, splitType, ... })
        │  ── JWT token auto-injected via api.ts ──
        ▼
  Backend: auth middleware → expenseController.create()
        │
        ├── Validate input & group membership
        ├── Insert expense → expenses.json
        ├── Log activity → activities.json
        │
        ▼
  Response: { success: true, expense }
        │
        ▼
  AppContext refreshes state → UI re-renders
```

### Balance Calculation

```
  GroupDetail.tsx calls AppContext.getGroupBalances(groupId)
        │
        ▼
  apiFetch('/expenses/balances/:groupId')
        │
        ▼
  expenseController.getBalances()
        │
        ├── Fetch all group expenses
        ├── Fetch all group settlements
        ├── Calculate net balances:
        │     payer receives credit = share × (N-1)
        │     each participant owes their share to payer
        ├── Subtract completed settlements
        │
        ▼
  Return: [{ from: userId, to: userId, amount }]
        │
        ▼
  GroupDetail.tsx renders "who owes whom" cards
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ — [download](https://nodejs.org)
- **npm** or **bun** package manager
- **Android Studio** (optional, for Android APK builds)

### 1. Clone the Repository

```bash
git clone https://github.com/strivedi4u/splitx.git
cd splitx
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env         # Edit with your JWT_SECRET
npm install
npm run dev                   # → http://localhost:5000
```

### 3. Setup Frontend

```bash
cd ..                         # Back to project root
cp .env.example .env.local    # Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                   # → http://localhost:8080
```

### 4. Open in Browser

Navigate to **http://localhost:8080** — create an account and start splitting!

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

> All endpoints except `/auth/signup` and `/auth/login` require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login → returns JWT |
| `GET` | `/auth/me` | Get current user profile |
| `PATCH` | `/auth/profile` | Update name/avatar/color |
| `PATCH` | `/auth/change-password` | Change password |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/groups` | List user's groups |
| `POST` | `/groups` | Create a group |
| `POST` | `/groups/join` | Join via invite code |
| `GET` | `/groups/:id` | Group details |
| `PATCH` | `/groups/:id` | Update group |
| `DELETE` | `/groups/:id/leave` | Leave group |
| `GET` | `/groups/:id/invite-code` | Get invite code |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/expenses` | List expenses (filter: `?groupId=`) |
| `POST` | `/expenses` | Add expense |
| `GET` | `/expenses/summary` | Total owed/owe/net balance |
| `GET` | `/expenses/balances/:groupId` | Group balance breakdown |
| `GET` | `/expenses/:id` | Single expense |
| `DELETE` | `/expenses/:id` | Delete expense |

### Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/settlements` | List settlements (filter: `?groupId=`) |
| `POST` | `/settlements` | Record settlement |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/activities` | Activity feed (`?groupId=&page=&limit=`) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users/search?email=` | Search users by email |
| `GET` | `/users/:id` | Get user by ID |

### Utilities
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/upload` | Upload receipt images (multipart, max 5 files) |
| `GET` | `/version` | App version info (for update checker) |
| `GET` | `/health` | Health check |

---

## 📱 Android Build

SplitX uses **Capacitor 8** to wrap the React SPA as a native Android app.

```bash
# 1. Build the web app
npm run build

# 2. Sync web assets to Android
npx cap sync android

# 3. Open in Android Studio
npx cap open android

# 4. Build APK from Android Studio → Build → Build Bundle(s)/APK(s)
```

### Android Permissions
| Permission | Usage |
|------------|-------|
| `INTERNET` | API communication |
| `CAMERA` | Receipt photo capture |
| `POST_NOTIFICATIONS` | Local expense reminders |
| `READ_MEDIA_IMAGES` | Attach gallery images |
| `VIBRATE` | Notification feedback |

---

## ☁️ Deployment

### Backend → Azure App Service

1. Create an Azure App Service (Node.js 18 LTS)
2. Configure environment variables in Azure Portal:
   ```
   PORT=8080
   JWT_SECRET=<your-production-secret>
   JWT_EXPIRES_IN=30d
   NODE_ENV=production
   ADMIN_TOKEN=<your-admin-token>
   ```
3. Deploy:
   ```bash
   az webapp up --name splitx --resource-group <rg> --runtime "NODE:18-lts"
   ```

### Frontend → Any Static Host

```bash
VITE_API_URL=https://your-backend.azurewebsites.net/api npm run build
```

Deploy the `dist/` folder to **Vercel**, **Netlify**, **Cloudflare Pages**, or any static hosting provider.

---

## 🔐 Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `https://splitx.azurewebsites.net/api` |

### Backend (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | — *(required)* |
| `JWT_EXPIRES_IN` | Token expiry duration | `30d` |
| `NODE_ENV` | Environment mode | `development` |
| `ADMIN_TOKEN` | Admin API auth token | — *(required)* |
| `DATA_DIR` | Path to JSON data files | `./data` |

---

## 🤝 Contributing

We love contributions! SplitX is open source and we welcome PRs of all sizes.

Please read our [**Contributing Guide**](CONTRIBUTING.md) and [**Code of Conduct**](CODE_OF_CONDUCT.md) before submitting.

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

Looking for a good first issue? Check out issues tagged with [`good first issue`](https://github.com/strivedi4u/splitx/labels/good%20first%20issue).

---

## 🔒 Security

Found a vulnerability? Please report it responsibly. See our [**Security Policy**](SECURITY.md).

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## ⭐ Star History

<div align="center">

[![Star History Chart](https://api.star-history.com/svg?repos=strivedi4u/splitx&type=Date)](https://star-history.com/#strivedi4u/splitx&Date)

</div>

---

## 💖 Support the Project

If SplitX has helped you, consider supporting:

- ⭐ **Star this repository** — it helps a lot!
- 🐛 **Report bugs** and **suggest features**
- 📣 **Share** SplitX with friends and on social media
- 🤝 **Contribute** code, documentation, or design
- ☕ **[Sponsor](https://github.com/sponsors/strivedi4u)** the development

---

<div align="center">

**Built with ❤️ by [Shashank Trivedi](https://github.com/strivedi4u)**

*SplitX — Because splitting bills shouldn't split friendships.*

<br/>

[![GitHub followers](https://img.shields.io/github/followers/strivedi4u?label=Follow&style=social)](https://github.com/strivedi4u)
[![Twitter Follow](https://img.shields.io/twitter/follow/strivedi4u?style=social)](https://twitter.com/strivedi4u)

</div>
