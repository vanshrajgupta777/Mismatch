import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Compass, Shield, Settings, LogOut, Flame, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0b0c10]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/rooms" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-lg tracking-wider text-white">
              MISMATCH
            </span>
            <span className="text-[10px] uppercase font-semibold text-rose-400 tracking-widest -mt-1">
              Curated & Blind
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          <Link
            to="/rooms"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive('/rooms')
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4" /> Rooms
          </Link>

          <Link
            to="/matches"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              isActive('/matches')
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageCircle className="w-4 h-4" /> Matches & Chat
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                isActive('/admin')
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin Panel
            </Link>
          )}
        </nav>

        {/* Right Info: Likes counter & User Profile */}
        <div className="flex items-center gap-3">
          {/* Weekly Likes Meter */}
          <Link
            to="/settings"
            title="Click to manage carry-over settings"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>{user.likesRemaining ?? 3} likes left</span>
            {user.likesCarryOver && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/30 text-[10px] text-white">
                Rolls Over
              </span>
            )}
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-white/20 transition bg-white/5"
            >
              <img
                src={user.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-white/10"
              />
              <span className="hidden sm:inline text-xs font-medium text-zinc-300 px-1">
                {user.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pr-1" />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#171821] border border-white/10 shadow-2xl p-2 text-sm z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-white/5 mb-1">
                  <div className="font-medium text-white">{user.name}</div>
                  <div className="text-xs text-zinc-400 capitalize">
                    {user.gender} • {user.role}
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition"
                >
                  <Settings className="w-4 h-4 text-zinc-400" /> Preferences & Carry-over
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition"
                  >
                    <Shield className="w-4 h-4 text-amber-400" /> Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition text-left mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
