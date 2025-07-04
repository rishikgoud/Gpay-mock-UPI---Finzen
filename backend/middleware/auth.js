import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Validate that the token contains required user information
    if (!decoded.userId || !decoded.upiId) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }
    
    // Add timestamp validation (optional - tokens already have expiration)
    if (decoded.iat && Date.now() / 1000 - decoded.iat > 7 * 24 * 60 * 60) {
      return res.status(401).json({ message: 'Token expired' });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
} 