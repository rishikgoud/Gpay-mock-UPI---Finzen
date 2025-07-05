import Transaction from '../models/transaction.js';
import UPIUser from '../models/upiUser.js';

// Retry mechanism for failed Finzen API calls
async function retryFinzenAPI(apiCall, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`Finzen API attempt ${attempt} failed:`, error.message);
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Sync all users with Finzen - completely non-blocking
export async function syncAllUsersWithFinzen() {
  // Run in a separate process to avoid blocking the main app
  setImmediate(async () => {
    try {
      console.log('🔄 Starting Finzen sync...');
      const users = await UPIUser.find({});
      
      for (const user of users) {
        // Process each user independently
        syncUserTransactionsWithFinzen(user).catch(err => {
          console.error(`❌ Finzen sync failed for user ${user.userId}:`, err.message);
        });
      }
      console.log('✅ Finzen sync completed');
    } catch (error) {
      console.error('❌ Finzen sync failed:', error.message);
    }
  });
}

// Sync transactions for a specific user with Finzen
async function syncUserTransactionsWithFinzen(user) {
  try {
    // Check if Finzen API is configured
    if (!process.env.FINZEN_API_URL) {
      console.log(`⚠️ Finzen sync skipped for user ${user.userId} - API URL not configured`);
      return;
    }

    // Fetch transactions from Finzen for this user
    const finzenResponse = await retryFinzenAPI(async () => {
      const response = await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FINZEN_API_KEY || 'default-key'}`,
          'User-ID': user.userId,
          'UPI-ID': user.upiId
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    });
    
    const finzenTransactions = await finzenResponse.json();
    
    // Sync transactions with local database
    await syncTransactionsWithFinzen(user._id, finzenTransactions);
    
    // Mark local transactions as synced
    await markLocalTransactionsAsSynced(user._id);
    
    console.log(`✅ Synced ${finzenTransactions.length} transactions for user ${user.userId}`);
    
  } catch (error) {
    console.error(`❌ Failed to sync user ${user.userId}:`, error.message);
    // Don't throw - just log the error
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
      console.error(`❌ Failed to sync transaction ${finzenTx.paymentId}:`, error.message);
      // Continue with other transactions
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
    console.error(`❌ Failed to mark transactions as synced for user ${userId}:`, error.message);
  }
}

// DISABLED: Finzen sync is DISABLED to prevent connection errors
// Only enable if you have a working Finzen API endpoint
console.log('⚠️ Finzen sync is DISABLED to prevent connection errors');
console.log('To enable: Set FINZEN_API_URL environment variable to a working API endpoint');

/*
// Start background sync if environment variable is set
const syncInterval = parseInt(process.env.FINZEN_SYNC_INTERVAL) || 300000; // 5 minutes default

if (process.env.FINZEN_API_URL) {
  console.log(`🔄 Finzen sync enabled - running every ${syncInterval/1000} seconds`);
  setInterval(syncAllUsersWithFinzen, syncInterval);
  
  // Initial sync on startup (delayed to avoid blocking startup)
  setTimeout(syncAllUsersWithFinzen, 10000); // Wait 10 seconds after startup
} else {
  console.log('⚠️ Finzen sync disabled - FINZEN_API_URL not set');
}
*/ 