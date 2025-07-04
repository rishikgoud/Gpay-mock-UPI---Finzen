import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ userId: '', name: '', password: '', initialBalance: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/upi/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: form.userId,
          name: form.name,
          password: form.password,
          initialBalance: Number(form.initialBalance) || 0,
        }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input name="userId" placeholder="User ID" className="border p-2 rounded" value={form.userId} onChange={handleChange} required />
          <input name="name" placeholder="Name" className="border p-2 rounded" value={form.name} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" className="border p-2 rounded" value={form.password} onChange={handleChange} required />
          <input name="initialBalance" type="number" placeholder="Initial Balance (optional)" className="border p-2 rounded" value={form.initialBalance} onChange={handleChange} />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded">Register</button>
        </form>
        {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        {success && <div className="text-green-600 mt-2 text-center">{success}</div>}
      </div>
    </div>
  );
}

export default Register; 