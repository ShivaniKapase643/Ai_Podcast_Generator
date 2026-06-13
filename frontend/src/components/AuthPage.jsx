import React, { useState } from 'react';
import { Mic, LogIn, UserPlus, Mail, Lock, User, Eye, EyeOff, Headphones, Radio, Sparkles } from 'lucide-react';
import { login, register } from '../api/client';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        if (!form.email || !form.password) { setError('All fields are required'); setLoading(false); return; }
        res = await login(form.email, form.password);
      } else {
        if (!form.username || !form.email || !form.password) { setError('All fields are required'); setLoading(false); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
        res = await register(form.username, form.email, form.password, form.displayName || form.username);
      }
      localStorage.setItem('authToken', res.data.token);
      onAuth(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-brand-50 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-dark to-brand items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full bg-emerald-300 blur-3xl" />
        </div>
        <div className="relative z-10 text-white max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
            <Mic className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold mb-4 leading-tight">AI News Podcast Generator</h1>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            Your daily AI-powered news digest. Automatically curated, scripted, and narrated.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">8+ News Sources</p>
                <p className="text-sm text-white/60">TechCrunch, Wired, HN, ArXiv & more</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">AI-Generated Audio</p>
                <p className="text-sm text-white/60">Natural TTS with multiple voices</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">Personalized For You</p>
                <p className="text-sm text-white/60">Recommendations based on your interests</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-surface-900">AI News Podcast</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-surface-900">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-surface-600 mt-2">
              {mode === 'login' ? 'Sign in to access your personalized podcast experience' : 'Start your personalized AI news journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-1 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-surface-400" />
                    <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                      placeholder="johndoe" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-1 block">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-surface-400" />
                    <input type="text" value={form.displayName} onChange={e => setForm({...form, displayName: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                      placeholder="John Doe" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-1 block">
                {mode === 'login' ? 'Email or Username' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-surface-400" />
                <input type={mode === 'register' ? 'email' : 'text'} value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                  placeholder={mode === 'login' ? 'you@email.com or username' : 'you@email.com'} />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-surface-600 uppercase tracking-wide mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-surface-400" />
                <input type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-300 rounded-xl text-sm text-surface-900 placeholder-surface-400 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-surface-400 hover:text-surface-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white rounded-xl font-bold text-sm hover:bg-brand-dark transition-all shadow-md disabled:opacity-50 mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Sign In</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-sm text-brand font-semibold hover:underline">
              {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          <p className="text-xs text-surface-400 text-center mt-8">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
