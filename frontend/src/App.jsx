import { useState } from 'react';
import axiosInstance from './api/axiosInstance';

function App() {
  const [email, setEmail] = useState('sathish@gmail.com');
  const [password, setPassword] = useState('password123');
  const [status, setStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setStatus('Logging in...');
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/login', {
        email,
        password,
      });
      console.log('Login successful! Token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setStatus('Login successful! Token logged in console.');
    } catch (err) {
      console.error('Login error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(`Error (${err.response?.status || 'Network'}): ${errMsg}`);
      setStatus('Login failed');
    }
  };

  const handleRegister = async () => {
    setStatus('Registering test user...');
    setError('');
    try {
      const response = await axiosInstance.post('/api/auth/register', {
        email,
        password,
      });
      console.log('Registration successful! Token:', response.data.token);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setStatus('Registered and authenticated! Token logged in console.');
    } catch (err) {
      console.error('Registration error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Registration failed';
      setError(`Error (${err.response?.status || 'Network'}): ${errMsg}`);
      setStatus('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/20">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">PortSight</h1>
            <p className="text-xs text-slate-400">Phase 10: Setup, CORS & API Layer</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
            <input
              id="test-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
            <input
              id="test-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            id="test-login-btn"
            onClick={handleLogin}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition shadow-lg shadow-cyan-600/20 cursor-pointer"
          >
            Test POST /api/auth/login
          </button>
          <button
            id="test-register-btn"
            onClick={handleRegister}
            className="bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-300 font-medium text-sm py-2.5 px-4 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Register
          </button>
        </div>

        {status && (
          <div className="mb-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <span className="font-semibold text-slate-300">Status: </span>
            <span className="text-cyan-400">{status}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-xs text-red-300">
            {error}
          </div>
        )}

        {token && (
          <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-800 text-xs">
            <div className="text-slate-400 font-medium mb-1">Received JWT Token:</div>
            <div className="font-mono text-cyan-300 break-all select-all max-h-24 overflow-y-auto">
              {token}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-xs text-slate-500 text-center">
        Backend: <span className="font-mono text-slate-400">http://localhost:8080</span> | Frontend: <span className="font-mono text-slate-400">http://localhost:5173</span>
      </div>
    </div>
  );
}

export default App;
