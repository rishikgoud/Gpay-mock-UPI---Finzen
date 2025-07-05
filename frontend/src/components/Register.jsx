import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.js';

function Register() {
  const [form, setForm] = useState({ userId: '', name: '', password: '', initialBalance: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const registerUrl = getApiEndpoint(API_ENDPOINTS.REGISTER);
      console.log('Attempting registration to:', registerUrl);
      
      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: form.userId,
          name: form.name,
          password: form.password,
          initialBalance: Number(form.initialBalance) || 0,
        }),
      });
      
      console.log('Response status:', res.status);
      
      // Check if response is ok before trying to parse JSON
      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorMessage = `Server error (${res.status}). Please check if the backend is running.`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Try to parse the response
      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error('Failed to parse response:', jsonError);
        console.log('Response text:', await res.text());
        throw new Error('Invalid response from server. Please check if the backend is running.');
      }
      
      console.log('Registration successful:', data);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            name="userId" 
            placeholder="User ID" 
            className="border p-2 rounded" 
            value={form.userId} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <input 
            name="name" 
            placeholder="Name" 
            className="border p-2 rounded" 
            value={form.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Password" 
            className="border p-2 rounded" 
            value={form.password} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
          <input 
            name="initialBalance" 
            type="number" 
            placeholder="Initial Balance (optional)" 
            className="border p-2 rounded" 
            value={form.initialBalance} 
            onChange={handleChange} 
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        {error && (
          <div className="text-red-600 mt-2 p-3 bg-red-50 rounded">
            <strong>Error:</strong> {error}
            <br />
            <small className="text-gray-600">
              If this persists, please check if the backend server is running.
            </small>
          </div>
        )}
        {success && <div className="text-green-600 mt-2 text-center">{success}</div>}
      </div>
    </div>
  );
}

export default Register; 