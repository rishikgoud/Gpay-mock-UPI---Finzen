# GPay Mock UPI API with Finzen Integration

A complete UPI payment simulation system with user-specific data isolation and real-time Finzen integration.

## 🚀 Features

### ✅ User-Specific Data Isolation
- **Complete User Separation**: Each user only sees their own data
- **Secure Authentication**: JWT-based authentication with user ownership validation
- **Cross-User Access Blocked**: 403 Forbidden responses for unauthorized access
- **Real-time Updates**: User-specific Socket.io events

### ✅ Finzen Integration
- **Real-time Sync**: Transactions sent to Finzen immediately
- **Background Sync**: Automatic synchronization every 5 minutes
- **Manual Sync**: Users can manually sync their transactions
- **Error Handling**: Robust retry mechanisms and error logging

### ✅ Payment Features
- **UPI ID Generation**: Unique UPI IDs for each user
- **Transaction History**: Complete transaction tracking
- **Balance Management**: Real-time balance updates
- **Payment Validation**: Duplicate payment prevention

## 🏗️ Architecture

```
├── backend/                 # Node.js + Express API
│   ├── controllers/        # API controllers
│   ├── models/            # MongoDB models
│   ├── middleware/        # Authentication middleware
│   ├── routes/            # API routes
│   ├── services/          # Finzen sync service
│   └── app.js            # Main server file
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── main.jsx      # App entry point
│   └── package.json
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local or cloud)

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/gpay_mock

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret

# Finzen API Configuration
FINZEN_API_URL=http://localhost:5000/api/v1
FINZEN_API_KEY=your_finzen_api_key
FINZEN_SYNC_INTERVAL=300000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file:
```bash
VITE_API_URL=http://localhost:3000
VITE_FINZEN_URL=http://localhost:5000
```

## 🚀 Running the Application

### Development Mode
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Production Mode
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

## 📚 API Endpoints

### Public Endpoints
- `POST /upi/register` - User registration
- `POST /upi/login` - User authentication
- `POST /upi/auth` - UPI-based authentication

### Protected Endpoints
- `GET /upi/me` - Get user profile
- `GET /upi/balance/{upiId}` - Get user balance
- `GET /upi/transactions/{upiId}` - Get user transactions
- `GET /upi/transactions/{upiId}/finzen` - Sync with Finzen
- `POST /upi/send` - Send money

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **User Ownership Validation** - Users can only access their own data
- **Password Hashing** - bcrypt password encryption
- **Input Validation** - All user inputs are validated
- **CORS Protection** - Cross-origin request protection
- **Rate Limiting** - API rate limiting (configurable)

## 🔄 Finzen Integration

### Real-time Sync
Transactions are automatically sent to Finzen when created:
```javascript
// Send transaction to Finzen with user context
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

### Background Sync
Automatic synchronization every 5 minutes:
```javascript
// Background sync service
setInterval(syncAllUsersWithFinzen, 300000);
```

### Manual Sync
Users can manually sync their transactions:
```javascript
// Frontend sync button
const syncWithFinzen = async () => {
  const res = await fetch(`/upi/transactions/${upiId}/finzen`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  // Handle response
};
```

## 🧪 Testing

### User Registration
```bash
curl -X POST http://localhost:3000/upi/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","name":"User One","password":"password123","initialBalance":1000}'
```

### User Login
```bash
curl -X POST http://localhost:3000/upi/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"user1","password":"password123"}'
```

### Send Money
```bash
curl -X POST http://localhost:3000/upi/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"receiverUpi":"user2@finzen","amount":100,"category":"Food","note":"Lunch","paymentId":"test-123"}'
```

## 📊 Database Schema

### User Model
```javascript
{
  userId: String,           // Unique user identifier
  name: String,            // User's full name
  upiId: String,           // Unique UPI ID (userId@finzen)
  password: String,        // Hashed password
  balance: Number,         // Current balance
  transactionHistory: []   // Array of transaction IDs
}
```

### Transaction Model
```javascript
{
  user: ObjectId,          // Reference to user
  type: String,           // 'income' or 'expense'
  amount: Number,         // Transaction amount
  category: String,       // Transaction category
  description: String,    // Optional description
  senderUpi: String,      // Sender's UPI ID
  receiverUpi: String,    // Receiver's UPI ID
  date: Date,            // Transaction date
  paymentId: String,     // Unique payment identifier
  source: String,        // 'local' or 'finzen'
  syncedWithFinzen: Boolean // Sync status
}
```

## 🚀 Deployment

### Render Deployment
1. Connect your GitHub repository to Render
2. Set environment variables in Render dashboard
3. Deploy backend and frontend services
4. Configure custom domains

### Other Platforms
- **Heroku** - See `DEPLOYMENT.md`
- **Railway** - See `DEPLOYMENT.md`
- **AWS** - See `DEPLOYMENT.md`
- **Docker** - See `DEPLOYMENT.md`

## 📖 Documentation

- [Security Documentation](SECURITY.md) - Security features and best practices
- [Finzen Integration](FINZEN_INTEGRATION.md) - Complete Finzen integration guide
- [Deployment Guide](DEPLOYMENT.md) - Deployment instructions for various platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation files
- Review the deployment guide

---

**Built with ❤️ for secure and scalable UPI payment simulation** 