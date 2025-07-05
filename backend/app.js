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
    'https://finzen-z1gq.onrender.com',        // Your FinZen frontend
    'https://gpay-mock-upi-frontend-fizen.onrender.com', // GPay frontend
    'http://localhost:5173',                   // Local development
    'http://localhost:3000',                   // Local development
    'http://localhost:5174',                   // Alternative local port
    'http://localhost:3001',                   // Development frontend alternative
    'https://gpay-mock-upi-fizen.onrender.com', // Alternative production URL
    process.env.FRONTEND_URL // Environment variable for additional frontend URLs
  ].filter(Boolean), // Remove undefined values
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.options('/upi/*', cors(corsOptions));
app.options('/socket.io/*', cors(corsOptions));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origins: corsOptions.origin,
      credentials: corsOptions.credentials
    }
  });
});

// API status endpoint
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

// Home page (EJS)
app.get('/', (req, res) => {
  res.render('index', { title: 'GPay Mock API Home' });
});

// UPI API routes
app.use('/upi', upiRoutes);

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// Socket.io Configuration with improved CORS
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'https://finzen-z1gq.onrender.com',        // Your FinZen frontend
      'https://gpay-mock-upi-frontend-fizen.onrender.com', // GPay frontend
      'http://localhost:5173',                   // Local development
      'http://localhost:3000',                   // Local development
      'http://localhost:5174',                   // Alternative local port
      'http://localhost:3001',                   // Development frontend alternative
      'https://gpay-mock-upi-fizen.onrender.com', // Alternative production URL
      process.env.FRONTEND_URL // Environment variable for additional frontend URLs
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  transports: ['websocket', 'polling'] // Allow both WebSocket and polling
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('CORS enabled for origins:', corsOptions.origin);
});

export default app; 