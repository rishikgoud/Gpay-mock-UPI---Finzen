import { useState, useEffect } from 'react';
import useAuth from './useAuth';

export default function Transactions() {
  const { token, upiId } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState('idle');

  if (!token) {
    return <div className="p-8 text-center text-red-600">Please login to view transactions.</div>;
  }

  useEffect(() => {
    async function fetchTransactions() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/upi/transactions/${upiId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [token, upiId]);

  const syncWithFinzen = async () => {
    setSyncStatus('syncing');
    setError('');
    try {
      const res = await fetch(`/upi/transactions/${upiId}/finzen`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Sync failed');
      setTransactions(Array.isArray(data) ? data : []);
      setSyncStatus('synced');
    } catch (err) {
      setError(err.message);
      setSyncStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-transparent border border-gray-200 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <button 
          onClick={syncWithFinzen}
          disabled={syncStatus === 'syncing'}
          className={`px-4 py-2 rounded text-white font-medium transition-colors ${
            syncStatus === 'syncing' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : syncStatus === 'synced'
              ? 'bg-green-600 hover:bg-green-700'
              : syncStatus === 'error'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {syncStatus === 'syncing' ? '🔄 Syncing...' : 
           syncStatus === 'synced' ? '✅ Synced' :
           syncStatus === 'error' ? '❌ Retry' : '🔄 Sync with Finzen'}
        </button>
      </div>
      
      {loading && <div className="text-center py-4">Loading transactions...</div>}
      {error && <div className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</div>}
      {!loading && !error && transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found.</p>
          <p className="text-sm mt-2">Try syncing with Finzen to see your transaction history.</p>
        </div>
      )}
      
      <ul className="divide-y">
        {transactions.map((tx, i) => (
          <li key={tx._id || i} className="py-3 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="font-semibold">
                {tx.senderUpi === upiId ? 'Sent to' : 'Received from'} {tx.senderUpi === upiId ? tx.receiverUpi : tx.senderUpi}
              </div>
              <div className="text-sm text-gray-500">
                {tx.category} {tx.description && `- ${tx.description}`}
                {tx.source && (
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    tx.source === 'finzen' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tx.source === 'finzen' ? '🔄 Finzen' : '💾 Local'}
                  </span>
                )}
              </div>
            </div>
            <div className={`font-bold ${tx.senderUpi === upiId ? 'text-red-600' : 'text-green-600'}`}>
              {tx.senderUpi === upiId ? '-' : '+'}₹{tx.amount}
            </div>
            <div className="text-xs text-gray-400 mt-1 md:mt-0">
              {new Date(tx.date).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 