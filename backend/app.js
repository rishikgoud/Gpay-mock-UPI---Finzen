// ✅ Load .env FIRST
import dotenv from 'dotenv';
dotenv.config(); // ✅ Must be before anything else

// ✅ DB Connection
import connectDB from './config/db.js';
connectDB();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import upiRoutes from './routes/upi.js';

// Optional sync service (if used)
import './services/finzenSync.js';

const app = express();

// ✅ EJS Setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ✅ CORS Dynamic Origin Check
const allowedOrigins = [
  'https://finzen-z1gq.onrender.com',
  'https://gpay-mock-upi-frontend-fizen.onrender.com',
  'https://gpay-mock-upi-fizen.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
  'http://localhost:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight support

// ✅ JSON Middleware
app.use(express.json());

// ✅ Health Check Route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origins: allowedOrigins,
      credentials: true
    }
  });
});

// ✅ API Status
app.get('/api/status', (req, res) => {
  res.json({
    message: 'GPay Mock UPI API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/status',
      upi: '/upi/*'
    }
  });
});

// ✅ Home Page (EJS View)
app.get('/', (req, res) => {
  res.render('index', { title: 'GPay Mock API Home' });
});

// ✅ UPI API Routes
app.use('/upi', upiRoutes);

// ✅ Start Server + Socket.IO
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Socket.IO CORS: Not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
    optionsSuccessStatus: 200
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// ✅ Socket.IO Events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join', (data) => {
    console.log('📲 Client joined room:', data);
    socket.join(data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.set('io', io); // Optional if used in other files

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('✅ CORS allowed for:', allowedOrigins);
});
