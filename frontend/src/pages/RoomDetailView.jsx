import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Users, Sparkles, ArrowLeft, LogOut, CheckCircle2, AlertCircle, Info, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import MemberCard from '../components/MemberCard';

export default function RoomDetailView() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser, updatePreferences } = useAuth();

  const [roomData, setRoomData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likingId, setLikingId] = useState(null);
  const [likeSuccessMessage, setLikeSuccessMessage] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);

  const fetchRoomAndMembers = async () => {
    try {
      setLoading(true);
      setError('');
      const [roomRes, membersRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.get(`/rooms/${roomId}/members`),
      ]);

      if (roomRes.data.success) {
        setRoomData(roomRes.data.room);
      }
      if (membersRes.data.success) {
        setMembers(membersRes.data.members);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load room details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomAndMembers();
  }, [roomId]);

  const handleSendLike = async (toUserId) => {
    try {
      setLikingId(toUserId);
      setLikeSuccessMessage('');
      const res = await api.post('/likes', {
        toUserId,
        roomId,
      });

      if (res.data.success) {
        // Mark member as liked locally
        setMembers((prev) =>
          prev.map((m) =>
            m._id === toUserId ? { ...m, hasLikedThisWeek: true } : m
          )
        );

        await refreshUser();

        if (res.data.isMatch) {
          setLikeSuccessMessage("It's a Match! Chat has unlocked!");
        } else {
          setLikeSuccessMessage('Blind like sent! It remains 100% secret unless mutual.');
        }

        setTimeout(() => setLikeSuccessMessage(''), 6000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send like');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLikingId(null);
    }
  };

  const handleLeaveRoom = async () => {
    if (!window.confirm('Are you sure you want to leave this room? You can shuffle into another room anytime.')) {
      return;
    }

    try {
      setIsLeaving(true);
      const res = await api.post(`/rooms/${roomId}/leave`);
      if (res.data.success) {
        await refreshUser();
        navigate('/rooms');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to leave room');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleToggleCarryOver = async () => {
    try {
      await updatePreferences({ likesCarryOver: !user?.likesCarryOver });
    } catch (err) {
      console.error('Failed to update carry over preference:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-4" />
        <p className="text-zinc-400 text-sm">Loading room members...</p>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-white">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold mb-2">Room not found</h2>
        <p className="text-zinc-400 text-sm mb-6">{error || 'Could not load room'}</p>
        <Link to="/rooms" className="px-6 py-2.5 bg-rose-500 rounded-xl text-sm font-semibold">
          Back to Rooms
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Back button */}
      <Link
        to="/rooms"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" /> All Rooms
      </Link>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#14151d] border border-white/10 p-8 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {roomData.interestCategory}
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-full">
                <Users className="w-3.5 h-3.5" /> ♀ {roomData.girlCount}/25 • ♂ {roomData.boyCount}/25
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-2">
              {roomData.name}
            </h1>
            <p className="text-zinc-400 text-sm max-w-2xl">
              {roomData.description || 'Welcome to this room! Browse opposite-gender members and spend your weekly likes.'}
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Weekly Likes badge */}
            <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{user?.likesRemaining ?? 3} likes remaining this week</span>
            </div>

            {/* Carry-over Toggle Button */}
            <button
              onClick={handleToggleCarryOver}
              title="Click to toggle carry-over preference"
              className={`px-3 py-2 rounded-2xl border text-xs font-medium flex items-center gap-1.5 transition ${
                user?.likesCarryOver
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Carry-Over: {user?.likesCarryOver ? 'ON (Rolls Over)' : 'OFF (Resets to 3)'}
            </button>

            {/* Leave / Shuffle Button */}
            <button
              onClick={handleLeaveRoom}
              disabled={isLeaving}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 border border-white/5 hover:border-rose-500/20 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              {isLeaving ? 'Leaving...' : 'Shuffle / Leave Room'}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {likeSuccessMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-sm flex items-center gap-3 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{likeSuccessMessage}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Mechanics Explanation Bar */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#14151d] border border-white/5 mb-8 text-xs text-zinc-400">
        <Info className="w-5 h-5 text-rose-400 flex-shrink-0" />
        <p>
          <strong className="text-white font-medium">Blind Privacy Guard:</strong> You are viewing opposite-gender members in this room. Like counts, viewer history, and who-liked-whom are completely hidden. If two members like each other, a match is made and chat unlocks!
        </p>
      </div>

      {/* Member Cards Grid */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-serif font-bold text-white">
          Room Members ({members.length})
        </h2>
        <span className="text-xs text-zinc-500">
          Viewing opposite gender ({user?.gender === 'girl' ? 'Boys' : 'Girls'})
        </span>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16 bg-[#14151d] rounded-3xl border border-white/5 p-8">
          <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">
            No opposite-gender members in this room yet
          </h3>
          <p className="text-zinc-500 text-xs">
            As more people join this room, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              onLike={handleSendLike}
              isLiking={likingId === member._id}
              likesRemaining={user?.likesRemaining ?? 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}
