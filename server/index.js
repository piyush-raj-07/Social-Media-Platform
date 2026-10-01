import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import postRoute from "./routes/post.route.js";
import messageRoute from './routes/message.route.js';
import notificationRoute from './routes/notification.route.js';
import { app, server } from "./socket/socket.js"; // ✅ already contains express()

dotenv.config();

const PORT = process.env.PORT || 3000;
const API = '/api/v1'; // common part of every api url

// Middleware to parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup to allow frontend requests
app.use(cors({
  origin: process.env.CLIENT_URL, // frontend url from .env
  credentials: true
}));

// Optional test route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the server!'
  });
});

// Mount API routes
app.use(`${API}/user`, userRoute);
app.use(`${API}/post`, postRoute);
app.use(`${API}/message`, messageRoute);
app.use(`${API}/notification`, notificationRoute);

// Start server after DB connection
server.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
