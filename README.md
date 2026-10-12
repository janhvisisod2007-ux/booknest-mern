# 📚 BookNest

A full-stack MERN book review app. Users can sign up, add books, and rate and review them.

**Live demo:** https://booknest-mern-amber.vercel.app
**API:** https://booknest-mern-3zjv.onrender.com

> The backend is on Render's free plan, so the first request after a period of inactivity can take 30 to 60 seconds while the server wakes up.

## Features

- User registration and login with JWT authentication
- Add, edit and delete books (only the user who added a book can edit or delete it)
- Cover image support through an image URL
- Browse books with search by title or author, genre filter and pagination
- Rate books from 1 to 5 stars and write reviews
- One review per user per book, which can be edited or deleted
- Average rating and review count on every book
- Protected routes and responsive UI

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** JSON Web Tokens, bcrypt
- **Deployment:** Vercel (frontend), Render (backend)

## Project Structure

booknest-mern
├── client # React frontend
└── server # Express API


## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get the logged-in user (protected) |

### Books
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books?search=&genre=&page=&limit=` | List books with search, filter and pagination |
| GET | `/api/books/:id` | Book details with reviews and average rating |
| POST | `/api/books` | Add a book (protected) |
| PUT | `/api/books/:id` | Update a book (owner only) |
| DELETE | `/api/books/:id` | Delete a book and its reviews (owner only) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/books/:id/reviews` | List reviews of a book |
| POST | `/api/books/:id/reviews` | Add a review (protected) |
| PUT | `/api/reviews/:id` | Update a review (owner only) |
| DELETE | `/api/reviews/:id` | Delete a review (owner only) |

## Run Locally

### Prerequisites
- Node.js 18 or later
- A MongoDB Atlas database (or local MongoDB)

### 1. Clone

```bash
git clone https://github.com/janhvisisod2007-ux/booknest-mern.git
cd booknest-mern
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env`:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key


Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

The app runs on `http://localhost:5173`. In development it calls `http://localhost:5000/api`. To use a different API URL, create `client/.env` with `VITE_API_URL=<your api url>`.

## Deployment Notes

- **Backend (Render):** root directory `server`, build command `npm install`, start command `npm start`. Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (the frontend URL, for CORS).
- **Frontend (Vercel):** root directory `client`, build command `npm run build`, output directory `dist`. A `vercel.json` rewrite sends all routes to `index.html` so React Router works on refresh.
- **Database:** MongoDB Atlas with network access allowed from Render.

## Author

Janhvi Sisodiya