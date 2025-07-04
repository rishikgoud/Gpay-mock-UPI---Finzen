import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function NavBar() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
  });
  const navigate = useNavigate();

  // Listen for login/logout changes (including from other tabs)
  useEffect(() => {
    const syncAuth = () => setAuth({ token: localStorage.getItem('token') });
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Update auth state on login/logout in this tab
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      setAuth(prev => (prev.token !== token ? { token } : prev));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuth({ token: null });
    navigate('/login');
  };

  return (
    <nav className="w-full bg-gray-900 text-white px-6 py-4 mb-8">
      <div className="max-w-3xl mx-auto flex gap-6 items-center">
        <Link to="/" className="font-bold">GPay Mock</Link>
        {!auth.token ? (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        ) : (
          <>
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="ml-4 bg-red-600 px-3 py-1 rounded">Logout</button>
          </>
        )}
      </div>
    </nav>
  );
} 