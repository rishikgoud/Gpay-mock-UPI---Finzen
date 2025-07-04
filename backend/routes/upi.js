import express from 'express';
import { registerUser, loginUser, getBalance, getTransactions, sendMoney, authWithUpiId, getMe, fetchFinzenTransactions } from '../controllers/upiController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/auth', authWithUpiId);

// Protect all routes below
router.use(auth);

router.get('/me', getMe);
router.get('/balance/:upiId', getBalance);
router.get('/transactions/:upiId', getTransactions);
router.get('/transactions/:upiId/finzen', fetchFinzenTransactions);
router.post('/send', sendMoney);

export default router; 