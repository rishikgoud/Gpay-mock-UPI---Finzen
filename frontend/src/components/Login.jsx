import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiEndpoint, API_ENDPOINTS } from '../config/api.js';

function Login() {
  const [form, setForm] = useState({ userId: '', password: '' });
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
      const loginUrl = getApiEndpoint(API_ENDPOINTS.LOGIN);
      console.log('Attempting login to:', loginUrl);
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: form.userId,
          password: form.password,
        }),
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
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
      
      console.log('Login successful:', data);
      
      // Validate response data
      if (!data.token || !data.upiId || !data.name) {
        throw new Error('Invalid response format from server');
      }
      
      // Store JWT and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('upiId', data.upiId);
      localStorage.setItem('name', data.name);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
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
          name="password" 
          type="password" 
          placeholder="Password" 
          className="border p-2 rounded" 
          value={form.password} 
          onChange={handleChange} 
          required 
          disabled={loading}
        />
        <button 
          type="submit" 
          className={`bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
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
      {success && <div className="text-green-600 mt-2">{success}</div>}
    </div>
  );
}

export default Login; 