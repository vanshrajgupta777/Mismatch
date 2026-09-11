import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ShieldCheck, HeartHandshake, Sparkles, ArrowRight, Check, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (email, password) => {
    try {
      await login(email, password);
      navigate('/rooms');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] text-white flex flex-col justify-between">
      {/* Top Banner */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
            <Flame className="w-6 h-6 fill-white" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-wider">
            MISMATCH
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-semibold text-zinc-300 hover:text-white px-4 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-rose-600/30 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-widest mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Anti-Swipe Intentional Dating
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-white max-w-4xl mb-6 leading-[1.15]">
          Curated rooms. <br />
          <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
            Blind, scarce likes.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed font-light">
          No infinite swiping casino. Join interest-based rooms capped strictly at{' '}
          <strong className="text-white font-medium">25 girls + 25 boys</strong>. Spend just{' '}
          <strong className="text-white font-medium">3 blind likes per week</strong>. Chat unlocks only when the feeling is mutual.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full max-w-md justify-center">
          <Link
            to="/register"
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-base shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 transition transform hover:-translate-y-0.5"
          >
            Join Mismatch <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold text-base border border-white/10 transition"
          >
            Sign In
          </Link>
        </div>

        {/* Quick Demo Test Bar */}
        <div className="w-full max-w-2xl bg-[#13141c] border border-white/10 rounded-3xl p-6 mb-16">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-4 flex items-center justify-center gap-2">
            <Users className="w-4 h-4 text-rose-400" /> Instant Demo Sign-In
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleQuickDemo('alex@mismatch.com', 'password123')}
              className="py-3 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              ♂ Alex (Boy)
            </button>
            <button
              onClick={() => handleQuickDemo('maya@mismatch.com', 'password123')}
              className="py-3 px-4 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              ♀ Maya (Girl)
            </button>
            <button
              onClick={() => handleQuickDemo('admin@mismatch.com', 'admin123')}
              className="py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              ⚡️ Admin Moderator
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 mt-3 text-center">
            Tip: Maya has already liked Alex in the Gym room. Log in as Alex and like Maya to see an instant mutual Match!
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
          <div className="p-6 rounded-3xl bg-[#121319] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif">
              Strict 25/25 Capacity
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Every room holds at most 25 girls and 25 boys matched around a real interest. No crowd dilution. Leave or shuffle rooms whenever you choose.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121319] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif">
              3 Blind Weekly Likes
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Scarcity breeds intentionality. No one sees who liked them. Choose whether your unused likes carry over or reset each week.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#121319] border border-white/5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-serif">
              Mutual-Only Chat
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Unsolicited DMs are impossible. Real-time chat unlocks only when two members like each other in the room.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-white/5 text-center text-xs text-zinc-500">
        Mismatch — Intentional MERN Stack Dating Platform
      </footer>
    </div>
  );
}
