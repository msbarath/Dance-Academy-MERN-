# Dance Academy - Frontend

React frontend for the Dance Academy management system. It's a single page app that talks to the backend API. Has a public-facing side for visitors and a full admin panel for managing students, courses, attendance, fees, events, and messages.

---

## what's used

- React 19
- React Router v7
- Axios
- plain CSS (per-page stylesheets, no CSS framework)

---

## folder structure

```
├── public/
│   ├── index.html
│   └── _redirects          (netlify spa fallback)
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.jsx
│   │   ├── Footer.jsx
│   │   ├── FormField.jsx
│   │   ├── PageHero.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatCard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   ├── useSessionStorage.js
│   │   └── useStore.js
│   ├── pages/
│   │   ├── About.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── AttendanceManagement.jsx
│   │   ├── Contact.jsx
│   │   ├── ContactManagement.jsx
│   │   ├── CourseManagement.jsx
│   │   ├── EventManagement.jsx
│   │   ├── FAQ.jsx
│   │   ├── FeeManagement.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── NotFound.jsx
│   │   ├── Privacy.jsx
│   │   ├── Profile.jsx
│   │   ├── Signup.jsx
│   │   ├── StudentManagement.jsx
│   │   ├── Terms.jsx
│   │   └── ThreadManagement.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── utils/
│   │   ├── api.js
│   │   └── validation.js
│   ├── App.js
│   └── index.js
├── .env
├── .env.production         (gitignored - set in netlify dashboard)
└── netlify.toml
```

---

## env setup

for local dev, create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

for production, set this in **netlify → site settings → environment variables**:

```
REACT_APP_API_URL=https://dance-academy-backend.onrender.com/api
```

don't commit `.env.production`, it's gitignored. set it in netlify directly.

---

## running locally

```bash
npm install
npm start
```

opens at `http://localhost:3000`.

for a production build:

```bash
npm run build
```

---

## pages and routes

all pages are lazy loaded with React.lazy so the initial bundle stays small.

| path | who can access | page |
|------|---------------|------|
| `/` | everyone | Home |
| `/about` | everyone | About |
| `/faq` | everyone | FAQ |
| `/contact` | everyone | Contact |
| `/privacy` | everyone | Privacy |
| `/terms` | everyone | Terms |
| `/login` | everyone | Login |
| `/signup` | everyone | Signup |
| `/forgot-password` | everyone | ForgotPassword |
| `/reset-password` | everyone | ForgotPassword |
| `/profile` | logged in | Profile |
| `/threads` | logged in | ThreadManagement |
| `/admin` | admin only | AdminDashboard |
| `/admin/courses` | admin only | CourseManagement |
| `/admin/students` | admin only | StudentManagement |
| `/admin/attendance` | admin only | AttendanceManagement |
| `/admin/fees` | admin only | FeeManagement |
| `/admin/events` | admin only | EventManagement |
| `/admin/messages` | admin only | ContactManagement |
| `/admin/threads` | admin only | ThreadManagement |
| `*` | everyone | NotFound |

`ProtectedRoute` handles the auth and role checks. pass `adminOnly` prop for admin-only routes.

---

## how auth works

JWT is stored in localStorage after login. axios picks it up automatically and attaches the `Authorization: Bearer` header on every request. if a request comes back with a 401, it fires an `auth:logout` event which logs the user out and clears state. guests can browse public pages but get redirected if they try to hit a protected route.

---

## password reset

1. user enters their email on `/forgot-password`, hits the API to get a reset token
2. user goes to `/reset-password`, enters the new password along with the token
3. token is only valid for 15 minutes

---

## deploying to netlify

- build command: `npm run build`
- publish directory: `build`
- node version: 20
- the `_redirects` file and `netlify.toml` handle SPA routing so deep links don't 404
- remember to set `REACT_APP_API_URL` in the netlify env vars dashboard
