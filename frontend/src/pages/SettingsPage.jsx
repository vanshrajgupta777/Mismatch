import React, { useState } from 'react';
import { Sparkles, Heart, Check, AlertCircle, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AVAILABLE_INTERESTS = [
  'Gym',
  'Cinephile',
  'Travel',
  'Tech',
  'Art',
  'Coffee',
  'Music',
  'Books',
  'Foodie',
  'Gaming',
];

export default function SettingsPage() {
  const { user, updatePreferences } = useAuth();

  const [likesCarryOver, setLikesCarryOver] = useState(user?.likesCarryOver || false);
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests || []);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await updatePreferences({
        likesCarryOver,
        bio,
        interests,
      });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-white mb-2">
          Preferences & Settings
        </h1>
        <p className="text-zinc-400 text-sm">
          Customize your matching preferences, bio, and weekly likes carry-over behavior.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Weekly Likes Carry-Over Mechanics Toggle */}
        <div className="p-6 rounded-3xl bg-[#14151d] border border-white/10 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-base font-bold text-white mb-1">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Unused Weekly Likes Carry-Over
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                By default, users receive a fresh set of 3 likes each weekly cycle. With carry-over turned{' '}
                <strong className="text-rose-400">ON</strong>, any unused likes carry over into the next week (+3 to remaining count).
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={likesCarryOver}
                onChange={(e) => setLikesCarryOver(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:after:w-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
            <span>Current Status:</span>
            <span
              className={`font-semibold ${
                likesCarryOver ? 'text-emerald-400' : 'text-zinc-400'
              }`}
            >
              {likesCarryOver ? 'Carries over to next week' : 'Resets to 3 every Sunday'}
            </span>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-[#14151d] border border-white/10 space-y-5">
          <h2 className="text-lg font-serif font-bold text-white">
            Profile Details
          </h2>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#0c0d12] rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-1 uppercase tracking-wider font-semibold">
                Gender Role
              </span>
              <span className="font-semibold text-white capitalize">
                {user?.gender}
              </span>
            </div>

            <div className="p-3 bg-[#0c0d12] rounded-xl border border-white/5">
              <span className="text-zinc-500 block mb-1 uppercase tracking-wider font-semibold">
                Weekly Likes Remaining
              </span>
              <span className="font-semibold text-rose-400">
                {user?.likesRemaining} likes
              </span>
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Your Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const selected = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      selected
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-[#0c0d12] text-zinc-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 inline mr-1" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Short Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others what you love..."
              className="w-full p-3 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3.5 px-6 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-[0.99]"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </form>
    </div>
  );
}
