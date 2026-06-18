import React, { useState } from 'react';
import { X, LogIn, UserPlus } from 'lucide-react';
import { login, register } from '../api/client';

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await login(form.email || form.username, form.password);
      } else {
        if (!form.username || !form.email || !form.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }
        res = await register(form.username, form.email, form.password, form.displayName);
      }
      localStorage.setItem('authToken', res.data.token);
      onAuth(res.data.user);
    } catch (err) {
      const errData = err.response?.data?.error;
      setError(typeof errData === 'string' ? errData : errData?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-surface-200">
        <div className="flex items-center justify-between p-5 border-b border-surface-200">
          <h2 className="text-lg font-bold text-surface-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-surface-400 hover:text-surface-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">Username</label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                  placeholder="johndoe" />
              </div>
              <div>
                <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">Display Name</label>
                <input type="text" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})}
                  className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                  placeholder="John Doe" />
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">
              {mode === 'login' ? 'Email or Username' : 'Email'}
            </label>
            <input type={mode === 'register' ? 'email' : 'text'} value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              placeholder={mode === 'login' ? 'email or username' : 'email@example.com'} />
          </div>

          <div>
            <label className="text-xs font-bold text-surface-600 uppercase tracking-wide">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full mt-1 px-4 py-2.5 bg-surface-50 border border-surface-300 rounded-xl text-sm text-surface-900 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
              placeholder="••••••••" />
          </div>

          {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-all disabled:opacity-50">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
              mode === 'login' ? <><LogIn className="w-4 h-4" /> Sign In</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>
        </form>

        <div className="p-4 border-t border-surface-200 text-center">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            className="text-sm text-brand font-semibold hover:underline">
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
