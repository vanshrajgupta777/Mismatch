import React, { useState, useEffect } from 'react';
import { Shield, Plus, Users, Trash2, Edit3, ArrowRightLeft, RefreshCw, CheckCircle2, AlertCircle, Heart, Flame } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Create Room Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    interestCategory: 'Gym',
    description: '',
    capacityGirls: 25,
    capacityBoys: 25,
  });

  // Move User state
  const [moveModalData, setMoveModalData] = useState(null); // { userId, userName }
  const [selectedTargetRoomId, setSelectedTargetRoomId] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, roomsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/rooms'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (roomsRes.data.success) setRooms(roomsRes.data.rooms);
      if (usersRes.data.success) setUsersList(usersRes.data.users);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const res = await api.post('/admin/rooms', {
        name: newRoom.name,
        interestCategory: newRoom.interestCategory,
        description: newRoom.description,
        capacity: {
          girls: Number(newRoom.capacityGirls) || 25,
          boys: Number(newRoom.capacityBoys) || 25,
        },
      });

      if (res.data.success) {
        setShowCreateModal(false);
        setNewRoom({
          name: '',
          interestCategory: 'Gym',
          description: '',
          capacityGirls: 25,
          capacityBoys: 25,
        });
        setActionFeedback('Room created successfully!');
        await fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create room');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? Members will be unassigned.')) return;
    try {
      const res = await api.delete(`/admin/rooms/${roomId}`);
      if (res.data.success) {
        setActionFeedback('Room deleted successfully');
        await fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleMoveUser = async (e) => {
    e.preventDefault();
    if (!selectedTargetRoomId || !moveModalData) return;

    try {
      const res = await api.post(`/admin/rooms/${selectedTargetRoomId}/move-user`, {
        userId: moveModalData.userId,
      });

      if (res.data.success) {
        setMoveModalData(null);
        setSelectedTargetRoomId('');
        setActionFeedback(res.data.message);
        await fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to place user in room');
    }
  };

  const handleRemoveUserFromRoom = async (roomId, userId) => {
    try {
      const res = await api.post(`/admin/rooms/${roomId}/remove-user`, { userId });
      if (res.data.success) {
        setActionFeedback('User removed from room');
        await fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to remove user');
    }
  };

  const handleToggleVerify = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'verified' ? 'unverified' : 'verified';
    try {
      const res = await api.patch(`/admin/users/${userId}/verify`, {
        verificationStatus: nextStatus,
      });
      if (res.data.success) {
        setActionFeedback(`User verification status updated to ${nextStatus}`);
        setUsersList((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, verificationStatus: nextStatus } : u
          )
        );
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update verification');
    }
  };

  const handleTriggerLikesReset = async () => {
    if (!window.confirm('Run manual weekly likes refresh? This triggers the Sunday midnight cycle for all users.')) return;

    try {
      const res = await api.post('/admin/reset-likes');
      if (res.data.success) {
        setActionFeedback(
          `Weekly likes refreshed! ${res.data.result.carriedOverCount} users carried over (+3) and ${res.data.result.resetCount} users reset to 3.`
        );
      }
    } catch (err) {
      setErrorMsg('Failed to trigger likes refresh');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold mb-2 border border-amber-500/20">
            <Shield className="w-3.5 h-3.5" /> Platform Admin & Moderation
          </div>
          <h1 className="text-3xl font-serif font-bold text-white">
            Admin Management Console
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Oversee room capacity, user placement, weekly reset cycles, and verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerLikesReset}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <Heart className="w-4 h-4 text-rose-400" /> Trigger Weekly Reset Cycle
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Plus className="w-4 h-4" /> Create Room
          </button>
        </div>
      </div>

      {actionFeedback && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
              Total Users
            </span>
            <span className="text-2xl font-bold font-serif text-white">
              {stats.totalUsers}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-pink-400 uppercase tracking-wider block mb-1">
              ♀ Girls
            </span>
            <span className="text-2xl font-bold font-serif text-pink-300">
              {stats.girlCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-indigo-400 uppercase tracking-wider block mb-1">
              ♂ Boys
            </span>
            <span className="text-2xl font-bold font-serif text-indigo-300">
              {stats.boyCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-zinc-500 uppercase tracking-wider block mb-1">
              Rooms
            </span>
            <span className="text-2xl font-bold font-serif text-white">
              {stats.totalRooms}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-rose-400 uppercase tracking-wider block mb-1">
              Matches
            </span>
            <span className="text-2xl font-bold font-serif text-rose-300">
              {stats.totalMatches}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#14151d] border border-white/5">
            <span className="text-[11px] text-amber-400 uppercase tracking-wider block mb-1">
              Likes Sent
            </span>
            <span className="text-2xl font-bold font-serif text-amber-300">
              {stats.totalLikes}
            </span>
          </div>
        </div>
      )}

      {/* Room Management Section */}
      <div className="mb-12">
        <h2 className="text-xl font-bold font-serif text-white mb-4">
          Active Rooms & Capacities
        </h2>

        <div className="bg-[#14151d] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0d12] text-zinc-400 uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">Room Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Girls (Max 25)</th>
                  <th className="p-4">Boys (Max 25)</th>
                  <th className="p-4">Total</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {rooms.map((room) => (
                  <tr key={room._id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4 font-semibold text-white">{room.name}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[11px]">
                        {room.interestCategory}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-pink-300 font-semibold">
                        {room.girlCount}
                      </span>{' '}
                      / {room.capacity?.girls || 25}
                    </td>
                    <td className="p-4">
                      <span className="text-indigo-300 font-semibold">
                        {room.boyCount}
                      </span>{' '}
                      / {room.capacity?.boys || 25}
                    </td>
                    <td className="p-4">{room.totalMembers} / 50</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleDeleteRoom(room._id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Users & Moderation Section */}
      <div>
        <h2 className="text-xl font-bold font-serif text-white mb-4">
          User Roster & Moderation
        </h2>

        <div className="bg-[#14151d] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c0d12] text-zinc-400 uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Gender</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Likes Left</th>
                  <th className="p-4">Carry-Over</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-zinc-300">
                {usersList.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://api.dicebear.com/7.x/notionists/svg?seed=user'}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-semibold text-white">{u.name}</div>
                          <div className="text-[10px] text-zinc-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] ${
                          u.gender === 'girl'
                            ? 'bg-pink-500/10 text-pink-400'
                            : 'bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {u.gender}
                      </span>
                    </td>
                    <td className="p-4 capitalize">{u.role}</td>
                    <td className="p-4 text-rose-400 font-semibold">
                      {u.likesRemaining}
                    </td>
                    <td className="p-4">
                      {u.likesCarryOver ? (
                        <span className="text-emerald-400 font-medium">Rolls Over</span>
                      ) : (
                        <span className="text-zinc-500">Resets</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleVerify(u._id, u.verificationStatus)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                          u.verificationStatus === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {u.verificationStatus}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() =>
                          setMoveModalData({ userId: u._id, userName: u.name })
                        }
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] transition"
                      >
                        Assign Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#171822] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-xl font-bold font-serif mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g. Cinephile Society"
                  className="w-full p-2.5 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1">
                  Interest Category
                </label>
                <input
                  type="text"
                  required
                  value={newRoom.interestCategory}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, interestCategory: e.target.value })
                  }
                  placeholder="e.g. Cinephile, Gym, Travel"
                  className="w-full p-2.5 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoom.description}
                  onChange={(e) =>
                    setNewRoom({ ...newRoom, description: e.target.value })
                  }
                  placeholder="What is this room about?"
                  className="w-full p-2.5 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1">
                    Girls Cap
                  </label>
                  <input
                    type="number"
                    value={newRoom.capacityGirls}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, capacityGirls: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-1">
                    Boys Cap
                  </label>
                  <input
                    type="number"
                    value={newRoom.capacityBoys}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, capacityBoys: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move / Assign User Modal */}
      {moveModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#171822] border border-white/10 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-xl font-bold font-serif mb-2">
              Assign {moveModalData.userName} to Room
            </h3>
            <p className="text-zinc-400 text-xs mb-4">
              Select which room to place this user into:
            </p>

            <form onSubmit={handleMoveUser} className="space-y-4">
              <select
                value={selectedTargetRoomId}
                onChange={(e) => setSelectedTargetRoomId(e.target.value)}
                className="w-full p-3 bg-[#0c0d12] border border-white/10 rounded-xl text-sm"
                required
              >
                <option value="">Select a Room...</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name} ({r.interestCategory}) - {r.totalMembers}/50
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setMoveModalData(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedTargetRoomId}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs disabled:opacity-50"
                >
                  Assign User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
