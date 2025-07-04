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

app.use(cors());
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
    origin: '*', // Adjust as needed for production
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 