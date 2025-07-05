import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.js';

export default function Home() {
  const { token, upiId, name } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !upiId) return;
    setLoading(true);
    setError('');
    
    const balanceUrl = getApiEndpoint(API_ENDPOINTS.BALANCE(upiId));
    console.log('Fetching balance from:', balanceUrl);
    
    fetch(balanceUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    })
      .then(res => {
        console.log('Balance response status:', res.status);
        if (!res.ok) {
          return res.text().then(text => {
            console.log('Error response text:', text);
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Balance data:', data);
        setBalance(data.balance);
      })
      .catch(err => {
        console.error('Balance fetch error:', err);
        setError(err.message || 'Failed to fetch balance');
      })
      .finally(() => setLoading(false));
  }, [token, upiId]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to GPay Mock</h1>
        <p className="mb-6">A demo UPI app for fintech prototyping.</p>
        {token && (
          <div className="mb-6">
            <div className="text-lg font-semibold">Hello, {name}!</div>
            {loading ? (
              <div>Loading balance...</div>
            ) : error ? (
              <div className="text-red-600">{error}</div>
            ) : (
              <div className="text-2xl font-bold mt-2">Balance: ₹{balance}</div>
            )}
          </div>
        )}
        {!token && <div className="mb-6 text-red-600">Please log in to see your balance.</div>}
        <div className="flex flex-col gap-4 items-center">
          <Link to="/send" className="bg-blue-600 text-white px-4 py-2 rounded">Send Money</Link>
          <Link to="/transactions" className="bg-green-600 text-white px-4 py-2 rounded">Transactions</Link>
        </div>
      </div>
    </div>
  );
} 