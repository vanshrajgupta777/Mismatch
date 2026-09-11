import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, User as UserIcon, Mail, Lock, Sparkles, Check, ArrowRight, AlertCircle, HelpCircle } from 'lucide-react';
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

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: 'girl', // default girl or boy
    interests: ['Gym', 'Cinephile'],
    bio: '',
    likesCarryOver: true,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      if (exists) {
        return { ...prev, interests: prev.interests.filter((i) => i !== interest) };
      } else {
        return { ...prev, interests: [...prev.interests, interest] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.interests.length === 0) {
      setError('Please choose at least 1 interest to match you with rooms.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(formData);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6 text-white py-12">
      <div className="w-full max-w-xl">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <span className="font-serif font-bold text-2xl tracking-wider text-white">
              MISMATCH
            </span>
          </Link>
          <h2 className="text-2xl font-bold font-serif mb-1">Create Your Profile</h2>
          <p className="text-zinc-400 text-xs">
            Join capacity-limited rooms and intentional blind matching.
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

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Gender Selection (Crucial for 25/25 cap and opposite-gender blind matching) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Select Your Gender (Enforces 25/25 Room Cap)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'girl' })}
                  className={`p-4 rounded-2xl border text-center transition ${
                    formData.gender === 'girl'
                      ? 'bg-pink-500/10 border-pink-500 text-pink-300 shadow-md shadow-pink-500/10'
                      : 'bg-[#0c0d12] border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">♀</div>
                  <div className="font-semibold text-sm">Girl</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Female participant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: 'boy' })}
                  className={`p-4 rounded-2xl border text-center transition ${
                    formData.gender === 'boy'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                      : 'bg-[#0c0d12] border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-2xl mb-1">♂</div>
                  <div className="font-semibold text-sm">Boy</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Male participant</div>
                </button>
              </div>
            </div>

            {/* Name, Email, Password */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Alex Rivera"
                    className="w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alex@example.com"
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
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full pl-11 pr-4 py-3 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Interests Picker */}
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Your Interests (Select to match relevant rooms)
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
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
                Short Bio (Blind profile overview)
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="What excites you? Favorite weekend ritual, workout style, or cinema obsession..."
                className="w-full p-4 bg-[#0c0d12] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            {/* Weekly Likes Carry-Over Preference */}
            <div className="p-4 rounded-2xl bg-[#0c0d12] border border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-white mb-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" /> Carry Over Unused Likes?
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    If toggled ON, any unused likes out of your 3 weekly likes roll over into the next week. If OFF, likes reset to 3 every Sunday.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.likesCarryOver}
                  onChange={(e) =>
                    setFormData({ ...formData, likesCarryOver: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-rose-500 mt-1 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition transform active:scale-[0.99]"
            >
              {isSubmitting ? 'Creating Account...' : 'Complete & Explore Rooms'}{' '}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-rose-400 hover:text-rose-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
