# Dance Academy - Backend

This is the backend for the Dance Academy management system. Built with Node.js and Express 5, connected to MongoDB. Handles everything from user auth to student records, attendance, fees, events, and the contact/thread system.

---

## what's used

- Node.js (18+)
- Express 5
- MongoDB + Mongoose
- JWT for auth
- bcryptjs for password hashing
- express-validator for input validation
- Nodemailer for emails
- Helmet, CORS, express-rate-limit, express-mongo-sanitize, compression for security/perf

---

## folder structure

```
├── Controllers/
│   ├── AttendanceController.js
│   ├── ContactController.js
│   ├── CourseController.js
│   ├── EventController.js
│   ├── FeeController.js
│   ├── StudentController.js
│   ├── ThreadController.js
│   └── UserController.js
├── Models/
│   ├── AttendanceModel.js
│   ├── ContactModel.js
│   ├── CourseModel.js
│   ├── EventModel.js
│   ├── FeeModel.js
│   ├── MessageModel.js
│   ├── PasswordResetTokenModel.js
│   ├── StudentModel.js
│   ├── ThreadModel.js
│   └── UserModel.js
├── Routes/
│   ├── AttendanceRoutes.js
│   ├── ContactRoutes.js
│   ├── CourseRoutes.js
│   ├── EventRoutes.js
│   ├── FeeRoutes.js
│   ├── StudentRoutes.js
│   ├── ThreadRoutes.js
│   └── UserRoutes.js
├── Utils/
│   ├── authMiddleware.js
│   └── resetTokenStore.js
├── server.js
├── package.json
└── render.yaml
```

---

## setting up .env

make a `.env` file in the root of this folder. it won't be committed, it's already in `.gitignore`.

```env
MONGODB_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/DanceAcademy
CLIENT_URL=http://localhost:3000
JWT_SECRET=<random 64-char hex>
JWT_EXPIRES_IN=7d
COOKIE_SECRET=<random 64-char hex>
NODE_ENV=development
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong password>
```

the `ADMIN_EMAIL` and `ADMIN_PASSWORD` are used to auto-seed the first admin account on startup if one doesn't already exist.

---

## running locally

```bash
npm install
npm run dev
```

runs on `http://localhost:5000` with nodemon hot-reload.

---

## api routes

### open to everyone

| method | path | what it does |
|--------|------|--------------|
| GET | `/api/health` | checks if the server + db are up |
| GET | `/api/db-status` | shows detailed db connection state |
| GET | `/api/courses` | lists all courses |
| GET | `/api/students/count` | returns total student count |
| GET | `/api/events` | lists all events |
| POST | `/api/contact` | submits a contact form message |
| POST | `/api/user/signup` | creates a new account |
| POST | `/api/user/login` | logs in, returns JWT |
| POST | `/api/user/request-reset` | sends a password reset token |
| POST | `/api/user/reset-password` | resets password using the token |

### needs a valid JWT (Authorization: Bearer ...)

| method | path | what it does |
|--------|------|--------------|
| GET | `/api/user/profile` | get your own profile |
| PUT | `/api/user/profile` | update your own profile |
| GET/POST/PUT/DELETE | `/api/threads/*` | thread + message management |

### admin only

| method | path | what it does |
|--------|------|--------------|
| GET | `/api/user/all` | list all users |
| DELETE | `/api/user/:id` | delete a user |
| POST/PUT/DELETE | `/api/courses/*` | manage courses |
| GET/POST/PUT/DELETE | `/api/students/*` | manage students |
| GET/POST/PUT/DELETE | `/api/attendance/*` | manage attendance |
| GET/POST/PUT/DELETE | `/api/fees/*` | manage fees |
| POST/PUT/DELETE | `/api/events/*` | manage events |
| GET/DELETE | `/api/contact/*` | view/delete contact messages |

---

## password reset

tokens are stored in mongodb (not in-memory), hashed with SHA-256, and expire after 15 minutes. requesting a new token invalidates any old one for that email.

1. POST to `/api/user/request-reset` with `{ email }` — get back a `resetToken`
2. POST to `/api/user/reset-password` with `{ resetToken, newPassword }` — done

---

## security stuff worth knowing

- rate limiting: 200 req/15min across the board, 20 req/15min on login/signup/reset routes
- all inputs validated with express-validator before hitting the controller
- mongo queries sanitized to block injection
- passwords use bcrypt with cost factor 12
- helmet sets a strict content security policy
- deleting a student cascades and removes their attendance + fee records too
- server shuts down cleanly on SIGINT/SIGTERM, closes the mongo connection properly

---

## deploying to render

env vars are set in the render dashboard. `render.yaml` has the service config.

- build: `npm install`
- start: `npm start`
- health check path: `/api/health`
