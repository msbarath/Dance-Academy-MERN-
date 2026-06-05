# Dance Academy — Backend

Node.js + Express + MongoDB REST API for the Dance Academy Management System. Includes JWT authentication, CSRF protection, rate limiting, and role-based access control.

---

## Tech Stack

| Technology        | Usage                              |
|-------------------|------------------------------------|
| Node.js           | Runtime                            |
| Express 5         | Web framework                      |
| MongoDB + Mongoose| Database and ODM                   |
| bcryptjs          | Password hashing                   |
| jsonwebtoken      | JWT auth tokens                    |
| csrf-csrf         | Double-submit CSRF protection      |
| cookie-parser     | Signed cookie handling             |
| helmet            | HTTP security headers              |
| express-rate-limit| Rate limiting                      |
| express-validator | Request body validation            |
| dotenv            | Environment variable loading       |

---

## API Endpoints

### Auth — `/api/user`
| Method | Path              | Access    | Description          |
|--------|-------------------|-----------|----------------------|
| POST   | `/signup`         | Public    | Register user        |
| POST   | `/login`          | Public    | Login user           |
| POST   | `/reset-password` | Public    | Reset password       |
| GET    | `/profile`        | Protected | Get own profile      |
| PUT    | `/profile`        | Protected | Update own profile   |
| GET    | `/all`            | Admin     | Get all users        |
| DELETE | `/:id`            | Admin     | Delete user          |

### Courses — `/api/courses`
| Method | Path    | Access | Description      |
|--------|---------|--------|------------------|
| GET    | `/`     | Public | Get all courses  |
| POST   | `/`     | Admin  | Create course    |
| PUT    | `/:id`  | Admin  | Update course    |
| DELETE | `/:id`  | Admin  | Delete course    |

### Students — `/api/students`
| Method | Path      | Access | Description        |
|--------|-----------|--------|--------------------|
| GET    | `/count`  | Public | Get student count  |
| GET    | `/`       | Admin  | Get all students   |
| POST   | `/`       | Admin  | Enroll student     |
| PUT    | `/:id`    | Admin  | Update student     |
| DELETE | `/:id`    | Admin  | Delete student     |

### Attendance — `/api/attendance`
| Method | Path   | Access | Description           |
|--------|--------|--------|-----------------------|
| GET    | `/`    | Admin  | Get attendance records |
| POST   | `/`    | Admin  | Mark attendance        |
| PUT    | `/:id` | Admin  | Update attendance      |
| DELETE | `/:id` | Admin  | Delete record          |

### Fees — `/api/fees`
| Method | Path   | Access | Description      |
|--------|--------|--------|------------------|
| GET    | `/`    | Admin  | Get fee records  |
| POST   | `/`    | Admin  | Record payment   |
| PUT    | `/:id` | Admin  | Update payment   |
| DELETE | `/:id` | Admin  | Delete record    |

### Events — `/api/events`
| Method | Path   | Access | Description    |
|--------|--------|--------|----------------|
| GET    | `/`    | Public | Get all events |
| POST   | `/`    | Admin  | Create event   |
| PUT    | `/:id` | Admin  | Update event   |
| DELETE | `/:id` | Admin  | Delete event   |

### Contact — `/api/contact`
| Method | Path   | Access | Description        |
|--------|--------|--------|--------------------|
| GET    | `/`    | Admin  | Get all messages   |
| POST   | `/`    | Public | Send message       |
| DELETE | `/:id` | Admin  | Delete message     |

### Threads — `/api/threads`
| Method | Path               | Access    | Description        |
|--------|--------------------|-----------|--------------------|
| GET    | `/`                | Protected | Get user threads   |
| POST   | `/`                | Protected | Create thread      |
| GET    | `/:id`             | Protected | Get thread by ID   |
| PUT    | `/:id`             | Protected | Update thread      |
| DELETE | `/:id`             | Protected | Delete thread      |
| GET    | `/:id/messages`    | Protected | Get messages       |
| POST   | `/:id/messages`    | Protected | Send message       |

### Utility
| Method | Path            | Description         |
|--------|-----------------|---------------------|
| GET    | `/api/health`   | Health check        |
| GET    | `/api/csrf-token` | Get CSRF token    |

---

## Environment Variables

Create a `.env` file in the backend root:

```
MONGODB_URL=your_mongodb_atlas_connection_string
CLIENT_URL=http://localhost:3000
CSRF_SECRET=your_csrf_secret
COOKIE_SECRET=your_cookie_secret
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=Admin@123
```

For production (Render), set these in the Render dashboard:

```
NODE_ENV=production
CLIENT_URL=https://your-app.netlify.app
```

All other variables remain the same.

---

## Getting Started

```bash
npm install
npm run dev
```

Server runs at [http://localhost:5000](http://localhost:5000).

---

## Scripts

| Script        | Description                   |
|---------------|-------------------------------|
| `npm start`   | Start with Node (production)  |
| `npm run dev` | Start with Nodemon (dev)      |

---

## Deployment — Render

- Build command: `npm install`
- Start command: `node server.js`
- Add all environment variables in Render → Environment tab.
- The `engines` field in `package.json` pins Node `>=18`.
- `SIGTERM` is handled for graceful shutdown on Render restarts.
