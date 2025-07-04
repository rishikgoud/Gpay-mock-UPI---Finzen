// ✅ Load .env FIRST
import dotenv from 'dotenv';
dotenv.config(); // ✅ Must be before anything else

// ✅ Then import DB and others
import connectDB from './config/db.js';
connectDB(); 

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import upiRoutes from './routes/upi.js';

// Import Finzen sync service
import './services/finzenSync.js';

const app = express();

// EJS setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// CORS Configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Development frontend
    'http://localhost:3001', // Development frontend alternative
    'https://gpay-mock-upi-frontend-fizen.onrender.com', // Production frontend
    'https://gpay-mock-upi-fizen.onrender.com', // Alternative production URL
    process.env.FRONTEND_URL // Environment variable for additional frontend URLs
  ].filter(Boolean), // Remove undefined values
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));
app.use(express.json());

// Home page (EJS)
app.get('/', (req, res) => {
  res.render('index', { title: 'GPay Mock API Home' });
});

// UPI API routes
app.use('/upi', upiRoutes);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'https://gpay-mock-upi-frontend-fizen.onrender.com',
      'https://gpay-mock-upi-fizen.onrender.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 