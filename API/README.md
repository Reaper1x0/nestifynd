# NestifyNd Backend (MERN Stack)

This is the complete backend for the NestifyNd productivity app, built with Node.js, Express, MongoDB, and Mongoose.

## 🚀 Features

- JWT Authentication
- Role-Based Access Control
- Modular Folder Structure
- API Routes for Users, Routines, Tasks, etc.
- Full CRUD and AI Session Ready
- MongoDB (Atlas or Local)
- **Swagger API Documentation**

## 📦 Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JSON Web Token (JWT)
- bcrypt for password hashing
- Dotenv for environment configs

## 🛠️ Setup Instructions

1. **Clone the repo**

```
git clone <your-repo-url>
cd nestifynd-backend
```

2. **Install dependencies**

```
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. **Run the server**

```
npm start
```

The server will run on `http://localhost:5000` by default.

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger API documentation at:

**http://localhost:5000/api-docs**

This provides a complete interactive interface to explore and test all API endpoints, including:
- Authentication endpoints
- Task management
- Routine management
- User management
- And many more...

The documentation includes request/response schemas, authentication requirements, and example payloads.

## 📂 Folder Structure

```
nestifynd-backend/
│
├── config/          # MongoDB connection setup
├── controllers/     # Business logic for routes
├── models/          # Mongoose schemas
├── routes/          # Express routes
├── middlewares/     # Auth and error handling
├── utils/           # Helper functions (if any)
├── .env             # Environment variables (not committed)
├── .gitignore       # Files to ignore in Git
├── package.json     # Project dependencies
└── server.js        # Entry point
```

## ✅ Ready to Deploy

You can easily deploy this backend on:
- Railway
- Render
- Heroku
- VPS / Docker
