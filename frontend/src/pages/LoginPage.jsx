import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 text-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30 group-hover:scale-105 transition">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-wider text-white">
              MISMATCH
            </span>
          </Link>
          <p className="text-zinc-400 text-sm">
            Sign in to access your curated rooms and weekly likes
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#14151d] border border-white/10 rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mismatch.com"
                  className="w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-[0.99]"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3 text-center">
              Instant Demo Fill:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('alex@mismatch.com', 'password123')}
                className="px-2 py-2 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-medium transition"
              >
                Alex (Boy)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('maya@mismatch.com', 'password123')}
                className="px-2 py-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 text-xs font-medium transition"
              >
                Maya (Girl)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@mismatch.com', 'admin123')}
                className="px-2 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium transition"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 mt-6">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-rose-400 hover:text-rose-300 font-medium">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
