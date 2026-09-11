import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles, Search, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/rooms');
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleJoin = async (roomId) => {
    try {
      setError('');
      setJoiningId(roomId);
      const res = await api.post(`/rooms/${roomId}/join`);
      if (res.data.success) {
        await refreshUser();
        navigate(`/rooms/${roomId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join room');
    } finally {
      setJoiningId(null);
    }
  };

  const categories = ['All', ...new Set(rooms.map((r) => r.interestCategory))];

  const filteredRooms = rooms.filter((r) => {
    const matchesCat = filterCategory === 'All' || r.interestCategory === filterCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.interestCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold mb-2 border border-rose-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Curated Room Capacity: 25 Girls + 25 Boys
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white">
            Curated Interest Rooms
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Pick a room matching your lifestyle. Each room holds at most 50 people.
          </p>
        </div>

        <button
          onClick={fetchRooms}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Status
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by room name or interest..."
            className="w-full pl-11 pr-4 py-2.5 bg-[#14151d] border border-white/10 rounded-2xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                filterCategory === cat
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-[#14151d] text-zinc-400 hover:text-white border border-white/5 hover:border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-3xl bg-zinc-900/50 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-16 bg-[#14151d] rounded-3xl border border-white/5 p-8">
          <Compass className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No rooms found</h3>
          <p className="text-zinc-500 text-xs">
            Try adjusting your search query or selecting a different category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onJoin={handleJoin}
              isJoining={joiningId === room._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
