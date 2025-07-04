import Transaction from '../models/transaction.js';
import UPIUser from '../models/upiUser.js';

// Retry mechanism for failed Finzen API calls
async function retryFinzenAPI(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Sync all users with Finzen
export async function syncAllUsersWithFinzen() {
  try {
    const users = await UPIUser.find({});
    
    for (const user of users) {
      await syncUserTransactionsWithFinzen(user);
    }
  } catch (error) {
    console.error('Finzen sync failed:', error);
  }
}

// Sync transactions for a specific user with Finzen
async function syncUserTransactionsWithFinzen(user) {
  try {
    // Fetch transactions from Finzen for this user
    const finzenResponse = await retryFinzenAPI(async () => {
      return await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FINZEN_API_KEY || 'default-key'}`,
          'User-ID': user.userId,
          'UPI-ID': user.upiId
        }
      });
    });
    
    if (finzenResponse.ok) {
      const finzenTransactions = await finzenResponse.json();
      
      // Sync transactions with local database
      await syncTransactionsWithFinzen(user._id, finzenTransactions);
      
      // Mark local transactions as synced
      await markLocalTransactionsAsSynced(user._id);
    } else {
      console.error(`Failed to fetch Finzen transactions for user ${user.userId}: ${finzenResponse.status}`);
    }
  } catch (error) {
    console.error(`Failed to sync user ${user.userId}:`, error);
  }
}

// Sync transactions with Finzen
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
          source: 'finzen',
          syncedWithFinzen: true
        });
      }
    } catch (error) {
      console.error(`Failed to sync transaction ${finzenTx.paymentId}:`, error);
    }
  }
}

// Mark local transactions as synced with Finzen
async function markLocalTransactionsAsSynced(userId) {
  try {
    const result = await Transaction.updateMany(
      { 
        user: userId, 
        source: 'local', 
        syncedWithFinzen: false 
      },
      { syncedWithFinzen: true }
    );
  } catch (error) {
    console.error(`Failed to mark transactions as synced for user ${userId}:`, error);
  }
}

// Start background sync if environment variable is set
const syncInterval = parseInt(process.env.FINZEN_SYNC_INTERVAL) || 300000; // 5 minutes default

if (process.env.FINZEN_API_URL) {
  setInterval(syncAllUsersWithFinzen, syncInterval);
  
  // Initial sync on startup
  setTimeout(syncAllUsersWithFinzen, 5000); // Wait 5 seconds after startup
} else {
  console.log('⚠️ Finzen sync disabled - FINZEN_API_URL not set');
} 