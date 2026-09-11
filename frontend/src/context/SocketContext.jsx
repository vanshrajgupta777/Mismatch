import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user, refreshUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeMatchAlert, setActiveMatchAlert] = useState(null);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    let socketBase = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.trim().replace(/\/+$/, '').replace(/\/api$/, '')
      : undefined;

    const newSocket = io(socketBase, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Real-time socket connected');
    });

    // Listen for instant mutual match notifications
    newSocket.on('match_found', (data) => {
      console.log('Mutual match found!', data);
      setActiveMatchAlert(data);

      // Fire celebratory confetti!
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#ffffff'],
        });
      } catch (e) {
        // Ignore in environments without canvas
      }

      // Refresh current user data (room states, likes, etc.)
      refreshUser();
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection warning:', err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, user?._id, refreshUser]);

  const clearMatchAlert = () => setActiveMatchAlert(null);

  return (
    <SocketContext.Provider
      value={{
        socket,
        activeMatchAlert,
        clearMatchAlert,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
