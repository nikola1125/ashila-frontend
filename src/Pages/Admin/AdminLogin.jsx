import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const AdminLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { publicApi } = useAxiosSecure();

  const fromPath = location.state?.from?.pathname || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const res = await publicApi.post('/admin/auth/login', { username, password, rememberMe });
      const token = res?.token;
      if (!token) {
        toast.error('Login failed');
        return;
      }

      try {
        localStorage.removeItem('adminToken');
      } catch {
        // ignore
      }
      try {
        sessionStorage.removeItem('adminToken');
      } catch {
        // ignore
      }

      if (rememberMe) {
        localStorage.setItem('adminToken', token);
      } else {
        sessionStorage.setItem('adminToken', token);
      }
      toast.success('Hyrja u krye');
      navigate(fromPath, { replace: true });
    } catch (err) {
      console.error(err);
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 401) {
        toast.error('Kredencialet janë gabim');
      } else if (status === 500) {
        toast.error(message || 'Server error. Check backend env config.');
      } else if (err?.code === 'ECONNABORTED') {
        toast.error('Request timed out. Check VITE_BASE_API and backend status.');
      } else {
        toast.error(message || 'Cannot reach server. Check VITE_BASE_API and backend.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet key={location.pathname}>
        <title>Admin Login</title>
      </Helmet>

      <div className="min-h-screen bg-[#f9f7f4] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg p-6">
          <h1 className="text-2xl font-extrabold text-gray-900 text-center">Admin Login</h1>
          <p className="text-sm text-gray-600 text-center mt-2">
            Hyrja është vetëm për pronarin.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5A3F2A]/30"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me (7 days)
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#5A3F2A] hover:bg-[#4A3320] text-white font-semibold transition disabled:opacity-60"
            >
              {loading ? 'Duke hyrë...' : 'Hyr'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
