import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";

import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import postRoute from "./routes/post.route.js";
import messageRoute from './routes/message.route.js'; // ✅ use route, not model

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware to parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS setup to allow frontend requests
app.use(cors({
  origin: "http://localhost:5173", // frontend origin
  credentials: true
}));

// Optional test route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the server!'
  });
});

// Mount API routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/post', postRoute);
app.use('/api/v1/message', messageRoute);

// Start server after DB connection
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server is running on port ${PORT}`);
});
