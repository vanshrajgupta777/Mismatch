import React from 'react';
import { Heart, Check, Sparkles, BadgeCheck } from 'lucide-react';

export default function MemberCard({ member, onLike, isLiking, likesRemaining }) {
  const hasLiked = member.hasLikedThisWeek;
  const noLikesLeft = likesRemaining <= 0;

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-[#14151d] border border-white/10 hover:border-rose-500/30 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Photo Container */}
        <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-zinc-900">
          <img
            src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500'}
            alt={member.name}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14151d] via-transparent to-black/20" />

          {/* Verification Badge */}
          {member.verificationStatus === 'verified' && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <BadgeCheck className="w-3.5 h-3.5" /> Verified
            </div>
          )}

          {/* Name overlay at bottom of photo */}
          <div className="absolute bottom-3 left-4 right-4">
            <h4 className="text-xl font-bold text-white font-serif tracking-wide drop-shadow-md">
              {member.name}
            </h4>
          </div>
        </div>

        {/* Bio & Interests */}
        <div className="p-5">
          <p className="text-xs text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
            {member.bio || 'Curating genuine moments in this room.'}
          </p>

          {/* Interest tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {member.interests?.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[11px] font-medium text-zinc-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Like CTA */}
      <div className="p-5 pt-0">
        {hasLiked ? (
          <button
            disabled
            className="w-full py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 cursor-default"
          >
            <Check className="w-4 h-4" /> Liked This Week (Blind)
          </button>
        ) : (
          <button
            onClick={() => onLike(member._id)}
            disabled={isLiking || noLikesLeft}
            className={`w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition duration-200 ${
              noLikesLeft
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:shadow-rose-600/40 active:scale-[0.98]'
            }`}
          >
            <Heart className={`w-4 h-4 ${noLikesLeft ? 'text-zinc-500' : 'fill-white'}`} />
            {noLikesLeft
              ? '0 Likes Left This Cycle'
              : isLiking
              ? 'Sending Secret Like...'
              : 'Send Blind Like'}
          </button>
        )}
      </div>
    </div>
  );
}
