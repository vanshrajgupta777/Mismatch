import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, X, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function MatchModal() {
  const { activeMatchAlert, clearMatchAlert } = useSocket();
  const navigate = useNavigate();

  if (!activeMatchAlert) return null;

  const { matchId, matchedUser, roomName } = activeMatchAlert;

  const handleStartChat = () => {
    clearMatchAlert();
    navigate(`/chat/${matchId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-b from-[#1c1d24] to-[#121318] border border-rose-500/30 p-8 shadow-2xl shadow-rose-950/40 text-center">
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />

        <button
          onClick={clearMatchAlert}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/30 mb-6 shadow-inner animate-pulse">
          <Heart className="w-8 h-8 fill-rose-500" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Mutual Liked
        </div>

        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          It's a Match!
        </h2>

        <p className="text-zinc-400 text-sm mb-6">
          You and <span className="text-white font-medium">{matchedUser?.name || 'your match'}</span> secretly liked each other in{' '}
          <span className="text-rose-400 font-medium">{roomName || 'your room'}</span>.
        </p>

        {/* Matched Avatar */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <img
            src={matchedUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'}
            alt={matchedUser?.name}
            className="w-full h-full object-cover rounded-full border-2 border-rose-500 shadow-lg shadow-rose-500/20"
          />
          <div className="absolute bottom-0 right-0 p-1.5 bg-rose-500 rounded-full text-white">
            <Heart className="w-4 h-4 fill-white" />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStartChat}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="w-5 h-5" /> Open Chat Now
          </button>

          <button
            onClick={clearMatchAlert}
            className="w-full py-3 px-6 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-sm transition"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  );
}
