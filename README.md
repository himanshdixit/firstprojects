# DraftSphere

A production-style full-stack blogging platform built with Next.js App Router, Express, and MongoDB.

DraftSphere combines a polished editorial UI with secure backend architecture, role-based administration, rich content workflows, and real-world product features such as comments, bookmarks, contact inbox management, SEO improvements, and media uploads.

> Designed as a portfolio-quality project to demonstrate full-stack engineering, UI/UX execution, API design, security, and scalable project structure.

## Highlights

- Premium blogging experience with a modern editorial interface
- Full authentication flow with JWT + `httpOnly` cookies
- Role-based access for `user` and `admin`
- Rich text post editor with media uploads
- Advanced engagement system with comments, replies, likes, and bookmarks
- Production-minded backend with validation, rate limiting, secure middleware, and centralized error handling
- Responsive admin dashboard for moderation and platform management
- SEO-focused frontend with dynamic metadata, Open Graph tags, structured data, optimized images, and App Router best practices

## Features

### Core Platform

- User registration, login, logout, and profile management
- User avatar upload and profile editing
- Create, edit, delete, draft, and publish blog posts
- Post cover image upload stored in backend file storage
- Reading time calculation and related posts section
- Search with debounce, tag/category filters, and pagination

### Engagement

- Comments CRUD
- Nested replies
- Like comments
- Like posts
- Bookmark posts
- Live comment count and like count per post

### Admin Features

- Role-based admin dashboard
- Manage users
- Manage posts
- Moderate comments
- View analytics cards and charts
- Manage contact form submissions through an inbox-style admin view

### UX & Product Quality

- Premium responsive UI with dark mode
- Reusable component system
- Smooth transitions and micro-interactions
- Skeleton loaders, empty states, and error states
- Toast notifications for key actions
- Contact page with backend-powered submission flow

### Backend & Security

- Express MVC architecture
- Zod request validation
- Centralized error handling
- JWT auth with secure cookie support
- Rate limiting and security middleware
- MongoDB with Mongoose models and relationships

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- JavaScript
- Tailwind CSS
- Framer Motion
- React Hook Form
- Zod
- Axios
- Tiptap Rich Text Editor
- Lucide React
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- multer
- sanitize-html
- Helmet
- express-rate-limit
- cookie-parser
- compression
- Zod

### Testing

- Jest
- Supertest
- React Testing Library

## Screenshots

Add your screenshots to `docs/screenshots/` and update the paths below.

| Screen | Suggested File |
| --- | --- |
| Home Page | `docs/screenshots/home.png` |
| Post Detail | `docs/screenshots/post-detail.png` |
| Admin Dashboard | `docs/screenshots/admin-dashboard.png` |
| Profile Page | `docs/screenshots/profile.png` |
| Contact Page | `docs/screenshots/contact.png` |

Example markdown:

```md
![DraftSphere Home](docs/screenshots/home.png)
![DraftSphere Admin Dashboard](docs/screenshots/admin-dashboard.png)
```

## Live Demo

- Frontend Demo: Add your deployed frontend URL here
- Live API Demo: `https://firstprojects-tiz9.onrender.com/api`

If you deploy the frontend, update this section to:

```txt
Frontend Demo: https://your-frontend-domain.com
Live API Demo: https://firstprojects-tiz9.onrender.com/api
```

## Demo Credentials

No public seeded credentials are committed to the repository.

For local review or demo purposes, you can use sample accounts like:

```txt
Standard User
Email: user@example.com
Password: User@12345

Admin User
Email: admin@example.com
Password: Admin@12345
```

Notes:

- These accounts are examples for local/demo setup only
- Users are not auto-seeded by the project
- To create an admin locally, register a user first and then promote the role in MongoDB

Example MongoDB command:

```js
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
);
```

## Project Structure

```txt
draftsphere/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- validators/
|   |-- tests/
|   `-- uploads/
|-- docs/
|-- frontend/
|   |-- public/
|   `-- src/
|       |-- app/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- lib/
|       |-- services/
|       `-- validators/
`-- README.md
```

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url> draftsphere
cd draftsphere
```

### 2. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/Codex_test_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=7d
BACKEND_PUBLIC_URL=http://localhost:5000
```

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
BACKEND_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

Make sure MongoDB is running locally at:

```txt
mongodb://localhost:27017/Codex_test_db
```

### 5. Run the backend

```bash
cd backend
npm run dev
```

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

### 7. Open the application

```txt
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
npm test
```

### Frontend

```bash
npm run dev
npm run build
npm run start
npm test
```

## Why This Project Stands Out

DraftSphere is more than a CRUD demo. It highlights:

- end-to-end product thinking across frontend, backend, database, and admin workflows
- strong separation of concerns with scalable service and component architecture
- modern UI/UX details such as premium layouts, motion, skeleton states, and polished interaction flows
- real-world backend concerns like validation, role-based auth, rate limiting, media handling, and secure cookies
- recruiter-friendly evidence of both engineering depth and product sensibility

## Roadmap Ideas

- Social login
- Email notifications for contact submissions and moderation events
- Richer analytics and author insights
- Saved posts page and reading history
- CI/CD pipeline and deployment guide
- Dockerized local setup

## License

This project is intended for portfolio, learning, and demonstration purposes.
