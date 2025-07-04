# Security & User Data Isolation Documentation

## Overview
This GPay Mock API application is designed with robust user data isolation to ensure that each user's data is completely separated and secure from other users' data.

## User Data Isolation Architecture

### 1. Authentication & Authorization
- **JWT-based Authentication**: Each user receives a unique JWT token containing their `userId` and `upiId`
- **Token Validation**: All protected routes validate JWT tokens before allowing access
- **User Context**: Authenticated user information is attached to each request via middleware

### 2. Database Design
- **User Model (`UPIUser`)**:
  - Unique `userId` and `upiId` for each user
  - Individual balance storage per user
  - Reference to user's transaction history

- **Transaction Model (`Transaction`)**:
  - Each transaction linked to specific user via `user` field (ObjectId reference)
  - Separate collection ensures data isolation
  - User-specific queries only return transactions for the authenticated user

### 3. API Security Measures

#### Route Protection
- All user-specific routes are protected by authentication middleware
- Routes require valid JWT token in Authorization header
- Unauthorized access returns 401 status

#### User Ownership Validation
- **UPI ID Matching**: Ensures authenticated user matches requested UPI ID
- **User ID Validation**: Double-checks that user document belongs to authenticated user
- **Forbidden Access Prevention**: Returns 403 status for unauthorized data access attempts

#### Security Logging
- All security violations are logged with detailed information
- Authentication events are tracked
- Failed access attempts are monitored

### 4. Frontend Security
- **Local Storage**: User tokens and data stored locally per user session
- **Token-based API Calls**: All requests include user authentication context
- **Session Management**: Proper logout functionality clears all user data

## Security Implementation Details

### Authentication Middleware (`backend/middleware/auth.js`)
```javascript
// Validates JWT tokens and ensures proper user context
// Logs authentication events and security violations
// Prevents access with invalid or expired tokens
```

### User Ownership Validation (`backend/controllers/upiController.js`)
```javascript
// Utility function to validate user ownership
// Ensures users can only access their own data
// Provides consistent security checks across all user-specific endpoints
```

### Database Queries
- **User-specific queries**: All database operations filter by authenticated user
- **Reference integrity**: Transactions are properly linked to users
- **No cross-user data leakage**: Queries are scoped to individual users

## Security Features

### ✅ Implemented Security Measures
1. **JWT Authentication** - Secure token-based authentication
2. **Route Protection** - All sensitive routes require authentication
3. **User Ownership Validation** - Users can only access their own data
4. **Security Logging** - All security events are logged
5. **Input Validation** - All user inputs are validated
6. **Password Hashing** - Passwords are securely hashed using bcrypt
7. **Unique Constraints** - Database enforces unique user identifiers
8. **Session Management** - Proper login/logout functionality

### 🔒 Data Isolation Guarantees
- **Complete User Separation**: No user can access another user's data
- **Transaction Isolation**: Each user's transactions are completely separate
- **Balance Isolation**: User balances are individual and secure
- **Profile Isolation**: User profiles are private and isolated

### 🚨 Security Monitoring
- **Access Attempt Logging**: All unauthorized access attempts are logged
- **Authentication Tracking**: Successful and failed logins are monitored
- **Security Alerts**: Console logging for security violations
- **Token Validation**: Comprehensive token structure and expiration checking

## API Endpoints Security

### Protected Endpoints
- `GET /upi/balance/{upiId}` - User balance (owner only)
- `GET /upi/transactions/{upiId}` - User transactions (owner only)
- `POST /upi/send-money` - Send money (authenticated user only)
- `GET /upi/me` - User profile (authenticated user only)

### Public Endpoints
- `POST /upi/register` - User registration
- `POST /upi/login` - User authentication
- `POST /upi/auth` - UPI-based authentication

## Best Practices Followed

1. **Principle of Least Privilege**: Users only have access to their own data
2. **Defense in Depth**: Multiple layers of security validation
3. **Secure by Default**: All routes are secure unless explicitly made public
4. **Comprehensive Logging**: All security events are tracked
5. **Input Sanitization**: All user inputs are validated and sanitized
6. **Token Security**: JWT tokens have proper expiration and validation

## Testing Security

To verify user data isolation:
1. Register multiple users
2. Login with different users
3. Attempt to access other users' data via API
4. Verify that access is properly denied
5. Check that users can only see their own transactions and balance

## Security Recommendations

1. **Environment Variables**: Ensure JWT_SECRET is properly set and secure
2. **HTTPS**: Use HTTPS in production for secure data transmission
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Database Security**: Ensure database access is properly secured
5. **Regular Audits**: Regularly audit security logs and access patterns 