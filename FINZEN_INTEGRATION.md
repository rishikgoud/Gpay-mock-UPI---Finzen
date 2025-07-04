# Finzen Integration Guide

## Overview
This document explains how to configure and use the Finzen integration in your GPay Mock UPI API for complete user-specific data isolation.

## Environment Variables Required

Add these to your `.env` file in the backend directory:

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gpay_mock

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Finzen API Configuration
FINZEN_API_URL=http://localhost:5000/api/v1
FINZEN_API_KEY=your_finzen_api_key_here
FINZEN_SYNC_INTERVAL=300000

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Features Implemented

### ✅ User-Specific Data Isolation
- Each user only sees their own transactions
- Each user has their own balance
- Cross-user access is completely blocked
- Real-time updates work per user
- Add Transaction works per user

### ✅ Finzen Integration
- **Real-time Sync**: Transactions are sent to Finzen immediately when created
- **Background Sync**: Automatic synchronization every 5 minutes (configurable)
- **Manual Sync**: Users can manually sync their transactions with Finzen
- **Error Handling**: Robust error handling with retry mechanisms
- **Data Deduplication**: Prevents duplicate transactions

### ✅ Security Features
- **User Authentication**: JWT-based authentication for all API calls
- **User Ownership Validation**: Users can only access their own data
- **API Key Authentication**: Secure communication with Finzen API
- **Request Logging**: All API calls are logged for monitoring

## API Endpoints

### Protected Endpoints (Require Authentication)
- `GET /upi/balance/{upiId}` - Get user balance
- `GET /upi/transactions/{upiId}` - Get user transactions (local)
- `GET /upi/transactions/{upiId}/finzen` - Get user transactions (with Finzen sync)
- `POST /upi/send` - Send money to another user
- `GET /upi/me` - Get user profile

### Public Endpoints
- `POST /upi/register` - Register new user
- `POST /upi/login` - User login
- `POST /upi/auth` - UPI-based authentication

## How It Works

### 1. User Registration
```javascript
// When a user registers, they get a unique userId and upiId
const upiId = generateUpiId(userId); // e.g., "user123@finzen"
```

### 2. Transaction Creation
```javascript
// When a transaction is created, it's sent to both local DB and Finzen
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

// Send to Finzen with user context
await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.FINZEN_API_KEY}`
  },
  body: JSON.stringify({
    user: { userId: sender.userId, upiId: sender.upiId, name: sender.name },
    transaction: { /* transaction data */ }
  })
});
```

### 3. Transaction Fetching
```javascript
// Fetch transactions from Finzen for specific user
const finzenResponse = await fetch(`${process.env.FINZEN_API_URL}/transactions`, {
  method: 'GET',
  headers: { 
    'Authorization': `Bearer ${process.env.FINZEN_API_KEY}`,
    'User-ID': user.userId,
    'UPI-ID': user.upiId
  }
});
```

### 4. Background Sync
```javascript
// Automatic sync every 5 minutes
setInterval(syncAllUsersWithFinzen, 300000);
```

## Frontend Features

### Transaction History Page
- **Sync Button**: Manually sync with Finzen
- **Source Indicators**: Shows if transaction is from local or Finzen
- **Real-time Updates**: Socket.io integration for live updates
- **Error Handling**: User-friendly error messages

### User Interface
- **Loading States**: Shows loading indicators during sync
- **Success/Error States**: Visual feedback for sync operations
- **Transaction Filtering**: Can filter by source (local/Finzen)

## Testing the Integration

### 1. Setup Test Users
```bash
# Register multiple users
curl -X POST http://localhost:3000/upi/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","name":"User One","password":"password123","initialBalance":1000}'

curl -X POST http://localhost:3000/upi/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"user2","name":"User Two","password":"password123","initialBalance":500}'
```

### 2. Make Transactions
```bash
# Login and get token
curl -X POST http://localhost:3000/upi/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","password":"password123"}'

# Send money (use token from login)
curl -X POST http://localhost:3000/upi/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverUpi":"user2@finzen","amount":100,"category":"Food","note":"Lunch","paymentId":"test-123"}'
```

### 3. Test User Isolation
```bash
# Try to access another user's transactions (should fail)
curl -X GET http://localhost:3000/upi/transactions/user2@finzen \
  -H "Authorization: Bearer USER1_TOKEN"
# Expected: 403 Forbidden
```

### 4. Test Finzen Sync
```bash
# Sync transactions with Finzen
curl -X GET http://localhost:3000/upi/transactions/user1@finzen/finzen \
  -H "Authorization: Bearer USER1_TOKEN"
```

## Monitoring and Logs

### Console Logs
The application provides detailed logging:
- `🔄` - Sync operations
- `✅` - Successful operations
- `❌` - Error operations
- `🚨` - Security alerts

### Key Log Messages
```
🔄 Starting Finzen sync for all users...
✅ Fetched 5 transactions from Finzen for user user1
✅ Synced new Finzen transaction: payment-123
🚨 Security Alert: User user1@finzen attempted to access data for user2@finzen
```

## Troubleshooting

### Common Issues

1. **Finzen API Connection Failed**
   - Check `FINZEN_API_URL` is correct
   - Verify `FINZEN_API_KEY` is valid
   - Ensure Finzen server is running

2. **User Data Isolation Issues**
   - Check JWT token is valid
   - Verify user ownership validation is working
   - Check database queries are user-scoped

3. **Sync Not Working**
   - Check environment variables are set
   - Verify Finzen API endpoints are accessible
   - Check network connectivity

### Debug Mode
Enable debug logging by setting:
```bash
NODE_ENV=development
DEBUG=finzen:*
```

## Security Considerations

1. **API Keys**: Store Finzen API keys securely
2. **HTTPS**: Use HTTPS in production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Input Validation**: All user inputs are validated
5. **SQL Injection**: Use parameterized queries (MongoDB handles this)
6. **XSS Protection**: Frontend sanitizes user inputs

## Performance Optimization

1. **Database Indexing**: Ensure proper indexes on user and paymentId fields
2. **Caching**: Consider implementing Redis for session storage
3. **Connection Pooling**: MongoDB connection pooling is configured
4. **Background Jobs**: Sync operations run in background

## Future Enhancements

1. **Webhook Support**: Receive real-time updates from Finzen
2. **Bulk Operations**: Batch sync for better performance
3. **Analytics**: Transaction analytics and reporting
4. **Multi-currency**: Support for different currencies
5. **Advanced Filtering**: Date range, category, amount filters

---

**Status**: ✅ Complete - Your GPay Mock UPI API is now fully integrated with Finzen and provides complete user-specific data isolation! 