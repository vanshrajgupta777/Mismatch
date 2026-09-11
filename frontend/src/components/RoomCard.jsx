import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RoomCard({ room, onJoin, isJoining }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isMember = user?.currentRoomIds?.some((id) =>
    typeof id === 'string' ? id === room._id : id?._id === room._id
  );

  const isGenderFull =
    user?.gender === 'girl' ? room.isGirlFull : room.isBoyFull;

  const girlPercent = Math.min(100, Math.round((room.girlCount / (room.capacity?.girls || 25)) * 100));
  const boyPercent = Math.min(100, Math.round((room.boyCount / (room.capacity?.boys || 25)) * 100));

  return (
    <div className="relative group flex flex-col justify-between rounded-3xl bg-[#14151d] border border-white/10 hover:border-rose-500/40 p-6 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Sparkles className="w-3 h-3" /> {room.interestCategory}
          </span>

          {isMember && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> In Room
            </span>
          )}
        </div>

        {/* Room Title & Description */}
        <h3 className="text-xl font-bold text-white group-hover:text-rose-400 transition mb-2 font-serif">
          {room.name}
        </h3>
        <p className="text-zinc-400 text-sm line-clamp-2 mb-6">
          {room.description || 'Connect intentionally with members sharing this passion.'}
        </p>

        {/* Capacity Breakdown */}
        <div className="space-y-3 bg-[#0c0d12] p-4 rounded-2xl border border-white/5 mb-6">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1 font-medium text-pink-300">
              ♀ Girls Capacity
            </span>
            <span className="font-semibold text-white">
              {room.girlCount} / {room.capacity?.girls || 25}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${girlPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
            <span className="flex items-center gap-1 font-medium text-indigo-300">
              ♂ Boys Capacity
            </span>
            <span className="font-semibold text-white">
              {room.boyCount} / {room.capacity?.boys || 25}
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${boyPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div>
        {isMember ? (
          <button
            onClick={() => navigate(`/rooms/${room._id}`)}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm flex items-center justify-center gap-2 transition"
          >
            Enter Room <ArrowRight className="w-4 h-4" />
          </button>
        ) : isGenderFull ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-zinc-800 text-zinc-500 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" /> Full for {user?.gender === 'girl' ? 'Girls' : 'Boys'} (25/25)
          </button>
        ) : (
          <button
            onClick={() => onJoin(room._id)}
            disabled={isJoining}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-600/20 transition transform active:scale-[0.99]"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        )}
      </div>
    </div>
  );
}
