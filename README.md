# Team Task Manager

> A professional‑grade, full‑stack SaaS for collaborative project and task management.
> Live demo: https://energetic-courtesy-production-0418.up.railway.app
> Source code: https://github.com/HARSHVARDHAN-SINGH8/team-task-manager

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Key Features](#key-features)
3. [Demo Screenshots](#demo-screenshots)
4. [Local Development Setup](#local-development-setup)
5. [Environment Variables](#environment-variables)
6. [Database Initialization](#database-initialization)
7. [Running the App (Production Mode)](#running-the-app-production-mode)
8. [Deployment to Railway](#deployment-to-railway)
9. [Project Structure](#project-structure)
10. [Contributing](#contributing)
11. [License](#license)

---

## Tech Stack

| Layer | Technology | Why it was chosen |
|-------|------------|-------------------|
| **Frontend** | **React 19** + **Vite** | Latest React features, lightning‑fast dev server. |
| | **Tailwind CSS v4** | Modern utility‑first styling with high performance and zero‑config. |
| | **React Context** (Auth, Theme, Notification, Search) | Lightweight global state without Redux overhead. |
| | **@hello-pangea/dnd** | Robust Drag‑and‑drop Kanban board support for React 19. |
| **Backend** | **Node.js 20** + **Express** | Minimalist, performant HTTP API. |
| | **MySQL 8** (via **mysql2/promise**) | Relational data model, strong ACID guarantees for tasks & permissions. |
| | **JWT** (jsonwebtokens) | Stateless authentication, easy to integrate with Railway’s environment variables. |
| **DevOps** | **Railway** (auto‑deploy, environment management) | Zero‑config CI/CD, built‑in MySQL provisioning. |
| | **dotenv** | Local environment configuration. |
| **Testing (future)** | **Jest** + **React Testing Library** | Planned unit/integration test suite. |

---

## Key Features

### Core Functionality
- **User Accounts** – Sign‑up, login, JWT‑based auth.
- **Projects** – Create, edit, delete, view, and invite members.
- **Roles & Permissions** – `admin`, `editor`, `commenter`, `viewer` with granular API guards.
- **Kanban Board** – Dynamic columns, drag‑and‑drop tasks, progress tracking.
- **Task Management** – Rich task model (title, description, due date, priority, status, assignee).
- **Comments** – Threaded comments per task with delete rights.
- **Activity Log** – Full audit trail for project events (creation, updates, invites, role changes).

### UI / UX Enhancements
- **Premium Design System** – Glass‑morphic cards, smooth gradients, modern typography (Inter).
- **Dark / Light Mode** – User‑controlled via ThemeContext, persisted in `localStorage`.
- **Personal Project Themes** – Each member can pick a background color for a project (saved in DB).
- **Invite‑Link System** – One‑time token with expiry and role selection, auto‑creates `invite_tokens` table if missing.
- **Search** – Global project & task search with debounced API calls.
- **Responsive Layout** – Mobile‑first design, collapsible sidebar, adaptive navigation.
- **Toast Notifications** – Success / error feedback for all async actions.
- **Progress Bars** – Real‑time completion percentages on dashboards & project cards.

### Extra (Beyond Basic CRUD)
- **Transactional Operations** – Project creation + admin membership + activity log in a single DB transaction.
- **Automatic DB Migrations** – Certain routes create missing tables/columns on‑the‑fly (e.g., `invite_tokens`).
- **Invite‑Link Expiration** – 7‑day TTL, auto‑cleaned on use.

---

## Demo Screenshots


<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/cb9e68a9-f6ab-4943-80cb-12d03c9adcb2" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f12a4f57-b7a4-4e80-ba47-4710b7f64b3b" />

*Dashboard with project summary, progress bars, and activity feed*

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9b1df15e-ea7e-45ca-b127-cac36831b81c" />
<img width="512" height="663" alt="image" src="https://github.com/user-attachments/assets/f630994d-f0d0-40b5-b4f4-1c2282158a21" />

*Kanban board with drag‑and‑drop columns and tasks*


<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a4ecddad-77ea-4597-90a4-3372e3105371" />

*Task cards details*

<img width="472" height="1079" alt="image" src="https://github.com/user-attachments/assets/1a401c09-f4ec-4f71-bf02-489522d50deb" />
<img width="466" height="454" alt="image" src="https://github.com/user-attachments/assets/57bc0caa-7ad6-4a44-a07e-8814e73d18f6" />

*Invite link generation modal with role selector*

---

## Local Development Setup

### Prerequisites
- **Node.js >= 20** (LTS)
- **npm >= 9** (`npm i -g npm` to update)
- **MySQL 8** (local or Docker)

### 1️⃣ Clone the repository
```bash
git clone https://github.com/HARSHVARDHAN-SINGH8/team-task-manager.git
cd team-task-manager
```

### 2️⃣ Install dependencies
```bash
# Server dependencies
npm ci
# Client dependencies (separate Vite app)
cd client
npm ci
cd ..
```

### 3️⃣ Set up the `.env` file
Copy the sample and fill in your local credentials:
```bash
cp server/.env.example server/.env
```
| Variable | Description |
|----------|-------------|
| `PORT` | Port for the Express server (default `5000`). |
| `DB_HOST` | MySQL host (e.g., `localhost`). |
| `DB_USER` | MySQL username. |
| `DB_PASSWORD` | MySQL password. |
| `DB_NAME` | Database name (`taskmanager`). |
| `JWT_SECRET` | Secret key for signing JWTs – keep it random and safe. |

### 4️⃣ Initialise the database
```bash
node server/init-db.js
```
This script creates the `taskmanager` database and all required tables (`users`, `projects`, `project_members`, `project_columns`, `tasks`, `task_comments`, `activity_logs`, `invite_tokens`).

### 5️⃣ Run the application
```bash
# Start the API server
npm run dev   # defined in server/package.json → starts nodemon on PORT

# In a new terminal, start the Vite front‑end
cd client
npm run dev   # Vite dev server (default http://localhost:5173)
```
Visit **http://localhost:5173** – you should see the login page. Register a new account and explore the full feature set.

---

## Environment Variables (Full List)
| Variable | Required | Default / Example | Description |
|----------|----------|-------------------|-------------|
| `PORT` | ✔ | `5000` | Express listening port. |
| `DB_HOST` | ✔ | `localhost` | MySQL host address. |
| `DB_USER` | ✔ | `root` | MySQL username. |
| `DB_PASSWORD` | ✔ | `yourpassword` | MySQL password. |
| `DB_NAME` | ✔ | `taskmanager` | Database name. |
| `JWT_SECRET` | ✔ | `supersecretkey123` | Secret for JWT signing – **must be long & random**. |
| `BASE_URL` *(optional)* | – | `http://localhost:5000` | Base API URL used by the client; Railway will set this automatically. |
| `RAILWAY_STATIC_URL` *(Railway auto‑set)* | – | – | Used for serving static files on Railway; no manual config required. |
> **Important:** Never commit `.env` or `JWT_SECRET` to version control.

---

## Database Initialization Details
`server/init-db.js` creates the following tables (see **Database Schema** section in the README for column definitions). It also runs *idempotent* `CREATE TABLE IF NOT EXISTS` statements, so you can re‑run the script safely.

If you need to reset the DB:
```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS taskmanager; CREATE DATABASE taskmanager;"
node server/init-db.js
```
---

## Running the App (Production Mode)
```bash
# Build the client
cd client
npm run build   # creates ./dist
cd ..

# Start the server in production
npm start       # runs node server/index.js
```
The Express server serves the static files from `client/dist` and proxies API routes under `/api/*`.

---

## Deployment to Railway
Railway provides a one‑click deployment for Node.js + MySQL projects.

1. **Create a Railway project** and link the GitHub repository:
   - In Railway dashboard → **New Project** → **Deploy from GitHub** → select `team-task-manager`.
2. **Add a MySQL plugin** (Railway automatically provisions a MySQL instance).
3. **Configure environment variables** (Railway → Settings → Variables):
```
PORT=5000
DB_HOST=<Railway‑MySQL‑Host>
DB_USER=<Railway‑MySQL‑User>
DB_PASSWORD=<Railway‑MySQL‑Password>
DB_NAME=taskmanager
JWT_SECRET=<Your‑Own‑Secure‑Secret>
BASE_URL=https://<your‑custom‑domain>.up.railway.app   # optional, otherwise Railway provides the default URL.
```
4. **Set the start command** (Railway detects it automatically from `package.json`):
```json
"start": "node server/index.js"
```
5. **Deploy** – Railway will run `npm ci`, build the Vite client (`npm run build`), and start the server.
6. **Custom domain (optional)** – In Railway → **Settings → Domains**, add your own domain (e.g., `app.myteam.com`) and update DNS CNAME to `cname.up.railway.app`. The live URL will change instantly.
7. **Verify** – Visit the live URL (default: `https://energetic-courtesy-production-0418.up.railway.app`). Register a user and confirm that all features (project creation, Kanban board, invite link) work as expected.

---

## Project Structure
```
team-task-manager/
│
├─ server/                     # Express API
│   ├─ config/
│   │   └─ db.js               # MySQL connection pool
│   ├─ middleware/
│   │   ├─ auth.js              # JWT verification
│   │   └─ role.js              # role‑based guards
│   ├─ routes/
│   │   ├─ auth.js
│   │   ├─ projects.js
│   │   ├─ tasks.js
│   │   ├─ comments.js
│   │   ├─ messages.js
│   │   ├─ activity.js
│   │   └─ search.js
│   ├─ scripts/
│   │   ├─ setup-dynamic-columns.js
│   │   └─ setup-messages.js
│   ├─ init-db.js               # DB schema creation
│   ├─ index.js                 # Express entry point
│   └─ .env                     # Local environment variables
│
├─ client/                     # Vite + React front‑end
│   ├─ src/
│   │   ├─ assets/               # Images, icons
│   │   ├─ components/
│   │   │   ├─ ActivityLog.jsx
│   │   │   ├─ GlobalCreateModal.jsx
│   │   │   ├─ MemberList.jsx
│   │   │   ├─ Navbar.jsx
│   │   │   ├─ ProgressBar.jsx
│   │   │   ├─ Sidebar.jsx
│   │   │   ├─ TaskBoard.jsx
│   │   │   ├─ TaskCard.jsx
│   │   │   └─ TaskDetailModal.jsx
│   │   ├─ contexts/
│   │   │   ├─ AuthContext.jsx
│   │   │   ├─ ThemeContext.jsx
│   │   │   ├─ NotificationContext.jsx
│   │   │   └─ SearchContext.jsx
│   │   ├─ pages/
│   │   │   ├─ Dashboard.jsx
│   │   │   ├─ Projects.jsx
│   │   │   ├─ ProjectDetail.jsx
│   │   │   ├─ TaskDetail.jsx
│   │   │   ├─ MyTasks.jsx
│   │   │   ├─ Signup.jsx
│   │   │   └─ Inbox.jsx
│   │   ├─ api/                 # thin wrappers around fetch()
│   │   ├─ App.jsx
│   │   └─ main.jsx
│   ├─ vite.config.js
│   └─ index.html
│
├─ .gitignore
├─ package.json                # root scripts, shared dev deps
└─ README.md                  # <-- this file
```
---

## Contributing
1. **Fork** the repository.
2. Create a **feature branch** (`git checkout -b feat/your-feature`).
3. Follow the existing **code style** (ESLint config is present).
4. Write **unit tests** for new logic (future test suite).
5. Submit a **Pull Request** with a clear description.

All contributions are welcome – especially enhancements such as:
- Full test coverage (Jest + React Testing Library).
- Real‑time updates via WebSockets (Socket.io).
- Improved accessibility (ARIA, keyboard navigation).
- CI pipeline with linting & automated tests.

---

## License
This project is licensed under the **MIT License** – see the `LICENSE` file for details.

---

*Happy coding! *
