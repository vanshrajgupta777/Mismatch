import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Heart, Sparkles, ArrowRight, RefreshCw, BadgeCheck } from 'lucide-react';
import api from '../api/client';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/matches');
      if (res.data.success) {
        setMatches(res.data.matches);
      }
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-2 border border-rose-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Mutual Connections
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">
            Your Matches & Chats
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Unlocked 1:1 messaging from mutual room likes.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-24 rounded-3xl bg-zinc-900/50 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 bg-[#14151d] rounded-3xl border border-white/5 p-8">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 font-serif">
            No matches yet
          </h3>
          <p className="text-zinc-400 text-xs max-w-md mx-auto mb-6 leading-relaxed">
            Likes in Mismatch are scarce and blind. Spend your 3 weekly likes in your rooms — when someone likes you back, your match and chat unlock here!
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition"
          >
            Explore Rooms & Spend Likes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((match) => (
            <div
              key={match._id}
              onClick={() => navigate(`/chat/${match._id}`)}
              className="group flex items-center justify-between p-4 rounded-3xl bg-[#14151d] hover:bg-[#181a24] border border-white/10 hover:border-rose-500/40 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 flex-shrink-0 border border-white/10">
                  <img
                    src={
                      match.matchedUser?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                    }
                    alt={match.matchedUser?.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-0 right-0 p-1 bg-rose-500 rounded-full text-white">
                    <Heart className="w-2.5 h-2.5 fill-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition font-serif">
                      {match.matchedUser?.name}
                    </h3>
                    {match.matchedUser?.verificationStatus === 'verified' && (
                      <BadgeCheck className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
                      from {match.room?.name || 'Room'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-1 max-w-md">
                    {match.lastMessage || 'Say hello! Chat is unlocked.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  {new Date(match.lastMessageAt || match.matchedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <div className="w-9 h-9 rounded-xl bg-white/5 group-hover:bg-rose-500 text-zinc-400 group-hover:text-white flex items-center justify-center transition">
                  <MessageCircle className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
