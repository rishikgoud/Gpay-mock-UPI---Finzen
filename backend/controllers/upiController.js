import UPIUser from '../models/upiUser.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Transaction from '../models/transaction.js';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import PaymentLock from '../models/PaymentLock.js';

// Helper to generate UPI ID
function generateUpiId(userId) {
  return `${userId}@finzen`;
}

// Utility function to validate user ownership
async function validateUserOwnership(req, upiId) {
  // Check if the authenticated user matches the requested UPI ID
  if (req.user.upiId !== upiId) {
    return { valid: false, error: 'Forbidden: Cannot access other user data' };
  }
  
  // Verify the user exists and belongs to the authenticated user
  const user = await UPIUser.findOne({ upiId });
  if (!user) {
    return { valid: false, error: 'User not found' };
  }
  
  if (user.userId !== req.user.userId) {
    return { valid: false, error: 'Forbidden: User ID mismatch' };
  }
  
  return { valid: true, user };
}

export async function registerUser(req, res) {
  try {
    const { userId, name, password, initialBalance } = req.body;
    if (!userId || !name || !password) {
      return res.status(400).json({ message: 'userId, name, and password are required' });
    }
    const existing = await UPIUser.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const upiId = generateUpiId(userId);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UPIUser.create({
      userId,
      name,
      upiId,
      password: hashedPassword,
      balance: initialBalance || 0,
      transactionHistory: [],
    });
    const token = jwt.sign({ userId: user.userId, upiId: user.upiId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, upiId: user.upiId, name: user.name, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
}

export async function loginUser(req, res) {
  try {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ message: 'userId and password are required' });
    }
    const user = await UPIUser.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user.userId, upiId: user.upiId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, upiId: user.upiId, name: user.name, balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
}

export async function getBalance(req, res) {
  try {
    const { upiId } = req.params;
    
    // Validate user ownership using utility function
    const validation = await validateUserOwnership(req, upiId);
    if (!validation.valid) {
      return res.status(403).json({ message: validation.error });
    }
    
    res.json({ balance: validation.user.balance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch balance', error: err.message });
  }
}

export async function getTransactions(req, res) {
  try {
    const { upiId } = req.params;
    
    // Validate user ownership using utility function
    const validation = await validateUserOwnership(req, upiId);
    if (!validation.valid) {
      return res.status(403).json({ message: validation.error });
    }
    
    // Only fetch transactions for the authenticated user
    const transactions = await Transaction.find({ user: validation.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
}

export async function sendMoney(req, res) {
  const senderUpi = req.user.upiId;
  const { receiverUpi, amount, note, category, paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ message: 'paymentId is required' });
  }

  // Global lock: check for existing lock before creating
  const existingLock = await PaymentLock.findOne({ paymentId });
  if (existingLock) {
    return res.status(409).json({ message: 'Duplicate payment blocked' });
  }
  await PaymentLock.create({ paymentId });

  try {
    // ✅ Continue with rest of logic ONLY if lock succeeded
    if (senderUpi === receiverUpi) {
      return res.status(400).json({ message: 'Cannot send money to yourself.' });
    }
    if (!receiverUpi || !amount || !category) {
      return res.status(400).json({ message: 'receiverUpi, amount, and category are required' });
    }
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const sender = await UPIUser.findOne({ upiId: senderUpi });
    const receiver = await UPIUser.findOne({ upiId: receiverUpi });

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }
    if (sender.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    sender.balance -= amount;
    receiver.balance += amount;

    const date = new Date();

    const senderTx = await Transaction.create({
      user: sender._id,
      type: 'expense',
      amount,
      category,
      description: note,
      date,
      paymentId,
      senderUpi,
      receiverUpi,
    });

    const receiverTx = await Transaction.create({
      user: receiver._id,
      type: 'income',
      amount,
      category,
      description: note,
      date,
      paymentId,
      senderUpi,
      receiverUpi,
    });

    sender.transactionHistory.push(senderTx._id);
    receiver.transactionHistory.push(receiverTx._id);
    await sender.save();
    await receiver.save();

    // Enhanced Finzen integration with user-specific data
    try {
      // Send sender transaction to Finzen with user context
      const senderFinzenPayload = {
        user: {
          userId: sender.userId,
          upiId: sender.upiId,
          name: sender.name
        },
        transaction: {
          type: 'expense',
          amount,
          category,
          description: note,
          date,
          paymentId,
          senderUpi,
          receiverUpi
        }
      };

      // Send receiver transaction to Finzen with user context
      const receiverFinzenPayload = {
        user: {
          userId: receiver.userId,
          upiId: receiver.upiId,
          name: receiver.name
        },
        transaction: {
          type: 'income',
          amount,
          category,
          description: note,
          date,
          paymentId,
          senderUpi,
          receiverUpi
        }
      };

      await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FINZEN_API_KEY || 'default-key'}`
        },
        body: JSON.stringify(senderFinzenPayload)
      });

      await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FINZEN_API_KEY || 'default-key'}`
        },
        body: JSON.stringify(receiverFinzenPayload)
      });
    } catch (finzenErr) {
      console.error('FinZen integration failed:', finzenErr.message);
      // Continue with local transaction even if Finzen fails
    }

    const io = req.app.get('io');
    if (io) {
      // Emit user-specific transaction events
      io.emit(`transaction:${senderUpi}`, {
        type: 'new',
        senderUpi,
        receiverUpi,
        amount,
        category,
        description: note,
        date,
        paymentId,
        transactionType: 'expense'
      });

      io.emit(`transaction:${receiverUpi}`, {
        type: 'new',
        senderUpi,
        receiverUpi,
        amount,
        category,
        description: note,
        date,
        paymentId,
        transactionType: 'income'
      });
    }

    return res.status(200).json({ message: 'Payment successful', senderTx, receiverTx });
  } catch (err) {
    return res.status(500).json({ message: 'Payment failed', error: err.message });
  }
}

export async function authWithUpiId(req, res) {
  const { upiId, password } = req.body;
  try {
    const user = await UPIUser.findOne({ upiId });
    if (!user) return res.status(401).json({ message: 'User not found' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ userId: user.userId, upiId: user.upiId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, userId: user.userId, upiId: user.upiId, name: user.name });
  } catch (err) {
    res.status(500).json({ message: 'Authentication failed', error: err.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await UPIUser.findOne({ userId: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      name: user.name,
      upiId: user.upiId,
      balance: user.balance,
      userId: user.userId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile', error: err.message });
  }
}

// New function to fetch transactions from Finzen for a specific user
export async function fetchFinzenTransactions(req, res) {
  try {
    const { upiId } = req.params;
    
    // Validate user ownership using utility function
    const validation = await validateUserOwnership(req, upiId);
    if (!validation.valid) {
      return res.status(403).json({ message: validation.error });
    }
    
    // Fetch transactions from Finzen for the specific user
    const finzenResponse = await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.FINZEN_API_KEY || 'default-key'}`,
        'User-ID': validation.user.userId,
        'UPI-ID': validation.user.upiId
      }
    });
    
    if (!finzenResponse.ok) {
      throw new Error(`Finzen API error: ${finzenResponse.status}`);
    }
    
    const finzenTransactions = await finzenResponse.json();
    
    // Sync Finzen transactions with local database
    await syncTransactionsWithFinzen(validation.user._id, finzenTransactions);
    
    // Return combined transactions (local + Finzen)
    const localTransactions = await Transaction.find({ user: validation.user._id }).sort({ date: -1 });
    const combinedTransactions = mergeTransactions(localTransactions, finzenTransactions);
    
    res.json(combinedTransactions);
  } catch (err) {
    console.error('Error fetching Finzen transactions:', err);
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
}

// Helper function to sync transactions with Finzen
async function syncTransactionsWithFinzen(userId, finzenTransactions) {
  for (const finzenTx of finzenTransactions) {
    try {
      // Check if transaction already exists locally
      const existingTx = await Transaction.findOne({ 
        user: userId, 
        paymentId: finzenTx.paymentId 
      });
      
      if (!existingTx) {
        // Create local transaction record
        await Transaction.create({
          user: userId,
          type: finzenTx.type,
          amount: finzenTx.amount,
          category: finzenTx.category,
          description: finzenTx.description,
          date: new Date(finzenTx.date),
          paymentId: finzenTx.paymentId,
          senderUpi: finzenTx.senderUpi,
          receiverUpi: finzenTx.receiverUpi,
          source: 'finzen' // Mark as synced from Finzen
        });
      }
    } catch (error) {
      console.error(`Failed to sync transaction ${finzenTx.paymentId}:`, error);
    }
  }
}

// Helper function to merge and deduplicate transactions
function mergeTransactions(localTransactions, finzenTransactions) {
  const allTransactions = [...localTransactions, ...finzenTransactions];
  const uniqueTransactions = new Map();
  
  allTransactions.forEach(tx => {
    const key = tx.paymentId || `${tx.date}-${tx.amount}-${tx.type}`;
    if (!uniqueTransactions.has(key)) {
      uniqueTransactions.set(key, tx);
    }
  });
  
  return Array.from(uniqueTransactions.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date));
} 