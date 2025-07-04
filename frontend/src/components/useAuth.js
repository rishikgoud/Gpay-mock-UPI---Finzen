import { useState } from 'react';

export default function useAuth() {
  const [token] = useState(() => localStorage.getItem('token'));
  const [upiId] = useState(() => localStorage.getItem('upiId'));
  const [name] = useState(() => localStorage.getItem('name'));
  return { token, upiId, name };
} 