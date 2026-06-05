# Dance Academy — Frontend

React frontend for the Dance Academy Management System. Built with React 19, React Router v7, Axios, and Context API. Connects to the Node.js + Express + MongoDB backend.

---

## Admin Login

| Field    | Value           |
|----------|-----------------|
| Email    | admin@gmail.com |
| Password | Admin@123       |

---

## Tech Stack

| Technology      | Usage                              |
|-----------------|------------------------------------|
| React 19        | UI framework                       |
| React Router v7 | Client-side routing                |
| Axios           | HTTP client for API requests       |
| Context API     | Auth and theme global state        |
| localStorage    | Auth token, user info, theme       |
| sessionStorage  | Form drafts                        |
| CSS Variables   | Dark / light theming               |

---

## Pages

### Public
| Page             | Path              |
|------------------|-------------------|
| Home             | `/`               |
| About Us         | `/about`          |
| FAQ              | `/faq`            |
| Contact Us       | `/contact`        |
| Privacy Policy   | `/privacy`        |
| Terms            | `/terms`          |

### Auth
| Page             | Path                |
|------------------|---------------------|
| Login            | `/login`            |
| Sign Up          | `/signup`           |
| Forgot Password  | `/forgot-password`  |

### Authenticated
| Page             | Path       |
|------------------|------------|
| My Profile       | `/profile` |
| Threads          | `/threads` |

### Admin Only
| Page                 | Path                  |
|----------------------|-----------------------|
| Dashboard            | `/admin`              |
| Course Management    | `/admin/courses`      |
| Student Management   | `/admin/students`     |
| Attendance           | `/admin/attendance`   |
| Fee / Payment        | `/admin/fees`         |
| Events               | `/admin/events`       |
| Contact Messages     | `/admin/messages`     |
| Threads (Admin)      | `/admin/threads`      |

---

## Project Structure

```
src/
├── components/
│   ├── Footer.jsx / Footer.css
│   ├── FormField.jsx / FormField.css
│   ├── Navbar.jsx / Navbar.css
│   ├── PageHero.jsx / PageHero.css
│   ├── ProtectedRoute.jsx
│   ├── ScrollToTop.jsx
│   ├── Sidebar.jsx / Sidebar.css
│   └── StatCard.jsx / StatCard.css
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── hooks/
│   ├── useLocalStorage.js
│   ├── useSessionStorage.js
│   └── useStore.js
├── pages/
│   ├── About.jsx / About.css
│   ├── AdminDashboard.jsx / AdminDashboard.css
│   ├── AdminPanel.css
│   ├── AttendanceManagement.jsx
│   ├── Contact.jsx / Contact.css
│   ├── ContactManagement.jsx
│   ├── CourseManagement.jsx
│   ├── EventManagement.jsx
│   ├── FAQ.jsx / FAQ.css
│   ├── FeeManagement.jsx
│   ├── ForgotPassword.jsx / ForgotPassword.css
│   ├── Home.jsx / Home.css
│   ├── Login.jsx / Login.css
│   ├── NotFound.jsx / NotFound.css
│   ├── Privacy.jsx / Privacy.css
│   ├── Profile.jsx
│   ├── Signup.jsx / Signup.css
│   ├── StudentManagement.jsx
│   ├── Terms.jsx / Terms.css
│   └── ThreadManagement.jsx / ThreadManagement.css
├── routes/
│   └── AppRoutes.jsx
├── utils/
│   ├── api.js
│   └── validation.js
├── App.js / App.css
├── index.js
└── index.css
```

---

## Environment Variables

Create a `.env` file in the root of the frontend folder:

```
REACT_APP_API_URL=http://localhost:5000/api
```

For production (Netlify), set this in Site Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api
```

---

## Getting Started

```bash
npm install
npm start
```

Opens at [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script          | Description                        |
|-----------------|------------------------------------|
| `npm start`     | Start development server           |
| `npm run build` | Build optimised production bundle  |
| `npm test`      | Run tests                          |

---

## Deployment — Netlify

- Build command: `npm run build`
- Publish directory: `build`
- The `netlify.toml` in the root handles the SPA redirect and Node version automatically.
- Set `REACT_APP_API_URL` in Netlify → Site Settings → Environment Variables.
