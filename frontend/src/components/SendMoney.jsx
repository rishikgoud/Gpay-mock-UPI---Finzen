import { useState } from 'react';
import useAuth from './useAuth';

export default function SendMoney() {
  const { token, upiId } = useAuth();
  const [form, setForm] = useState({ receiverUpi: '', amount: '', category: '', note: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <div className="p-8 text-center text-red-600">Please login to send money.</div>;
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    setLoading(true); // Set loading immediately to block double submit
    setError('');
    setSuccess('');
    const paymentId = crypto.randomUUID(); // Use built-in crypto for unique ID
    try {
      const res = await fetch('/upi/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverUpi: form.receiverUpi,
          amount: Number(form.amount),
          category: form.category,
          note: form.note,
          paymentId, // Include paymentId
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || 'Payment failed');
      setSuccess('Payment successful!');
      setForm({ receiverUpi: '', amount: '', category: '', note: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Send Money</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="receiverUpi" placeholder="To UPI ID (e.g. friend@finzen)" className="border p-2 rounded" value={form.receiverUpi} onChange={handleChange} required />
          <input name="amount" type="number" placeholder="Amount" className="border p-2 rounded" value={form.amount} onChange={handleChange} required min="1" />
          <input name="category" placeholder="Category (e.g. Food, Rent)" className="border p-2 rounded" value={form.category} onChange={handleChange} required />
          <input name="note" placeholder="Note (optional)" className="border p-2 rounded" value={form.note} onChange={handleChange} />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded disabled:opacity-50" disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
        {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-2 text-center">{success}</div>}
      </div>
    </div>
  );
} 