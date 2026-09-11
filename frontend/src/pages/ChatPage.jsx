import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Sparkles, Heart, BadgeCheck, ShieldAlert } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

export default function ChatPage() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [matchData, setMatchData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch initial chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const [matchRes, chatRes] = await Promise.all([
          api.get(`/matches/${matchId}`),
          api.get(`/chat/${matchId}`),
        ]);

        if (matchRes.data.success) {
          setMatchData(matchRes.data.match);
        }
        if (chatRes.data.success && chatRes.data.chat) {
          setMessages(chatRes.data.chat.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [matchId]);

  // Join socket chat room and setup real-time listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_chat', matchId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId !== user?._id) {
        setPartnerTyping(isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.emit('leave_chat', matchId);
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, matchId, user?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, partnerTyping]);

  const handleTyping = (e) => {
    setNewMessageText(e.target.value);

    if (socket) {
      socket.emit('typing', { matchId, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { matchId, isTyping: false });
      }, 1500);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    if (socket) {
      socket.emit('typing', { matchId, isTyping: false });
    }

    try {
      const res = await api.post(`/chat/${matchId}/message`, {
        text: textToSend,
      });

      // If socket already broadcasted it or if running in single-window, ensure message shows up
      if (res.data.success) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === res.data.message._id);
          return exists ? prev : [...prev, res.data.message];
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const partner = matchData?.matchedUser;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-[calc(100vh-5rem)] flex flex-col text-white">
      {/* Top Chat Header */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-[#14151d] border border-white/10 mb-4 shadow-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            to="/matches"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10">
            <img
              src={
                partner?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
              }
              alt={partner?.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold font-serif text-white">
                {partner?.name || 'Matched Partner'}
              </h2>
              {partner?.verificationStatus === 'verified' && (
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="text-rose-400 font-medium">
                Mutual Match from {matchData?.room?.name || 'Room'}
              </span>
            </div>
          </div>
        </div>

        {/* Interests pills */}
        <div className="hidden sm:flex items-center gap-1.5">
          {partner?.interests?.slice(0, 3).map((interest, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] text-zinc-300 border border-white/5"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 rounded-3xl bg-[#101117] border border-white/5 space-y-4 mb-4">
        {/* Intro banner */}
        <div className="text-center py-6 border-b border-white/5 max-w-sm mx-auto">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-2">
            <Heart className="w-5 h-5 fill-rose-500" />
          </div>
          <div className="text-xs font-semibold text-white mb-1">
            Chat Unlocked on Mutual Like
          </div>
          <p className="text-[11px] text-zinc-400">
            You both expressed interest in the {matchData?.room?.name || 'curated room'}. No endless swiping, just real conversation.
          </p>
        </div>

        {messages.map((msg, index) => {
          const senderId =
            typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
          const isMe = senderId?.toString() === user?._id?.toString();

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-br-xs'
                    : 'bg-[#1a1b24] text-zinc-200 border border-white/5 rounded-bl-xs'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 px-1">
                {new Date(msg.sentAt || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          );
        })}

        {partnerTyping && (
          <div className="flex items-center gap-2 text-xs text-zinc-400 italic">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
            {partner?.name || 'Partner'} is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 p-2 rounded-2xl bg-[#14151d] border border-white/10 flex-shrink-0"
      >
        <input
          type="text"
          value={newMessageText}
          onChange={handleTyping}
          placeholder={`Message ${partner?.name || 'your match'}...`}
          className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newMessageText.trim()}
          className="p-3 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white transition flex-shrink-0 shadow-md shadow-rose-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
