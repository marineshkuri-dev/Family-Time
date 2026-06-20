# Family Time 🏠

A responsive Hebrew RTL web application for managing family schedules, events and tasks.

## Tech stack

- **React 19** + **Vite 8**
- **React Router v7**
- CSS custom properties — no UI library dependency
- RTL-first design (Hebrew)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project structure

```
src/
├── components/     # Navbar, Footer, Layout, ProtectedRoute
├── pages/          # One file per route
├── styles/         # globals.css — design tokens & base styles
├── data/           # dummyData.js (replaced by Supabase later)
├── hooks/          # Custom React hooks
└── lib/            # Supabase client and helpers (coming soon)
```

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard |
| `/calendar` | Family calendar |
| `/tasks` | Task list |
| `/add-event` | Add event form |
| `/family-members` | Family members |
| `/profile` | User profile |
| `/settings` | Settings |

## Deployment

Deployed on **Vercel**. Push to `main` triggers an automatic build.
Repository: `github.com/<your-org>/family-time`
