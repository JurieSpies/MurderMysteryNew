import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Actions
  setSocket: (socket: Socket | null) => void;
  setConnected: (connected: boolean) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;

  // Socket helpers
  emit: (event: string, data?: unknown) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>()(
  devtools(
    (set, get) => ({
      socket: null,
      isConnected: false,
      isConnecting: false,
      error: null,

      setSocket: (socket) => set({ socket }),
      setConnected: (connected) => set({ isConnected: connected }),
      setConnecting: (connecting) => set({ isConnecting: connecting }),
      setError: (error) => set({ error }),

      emit: (event, data) => {
        const { socket } = get();
        if (socket && socket.connected) {
          socket.emit(event, data);
        } else {
          console.warn('Socket not connected, cannot emit event:', event);
        }
      },

      disconnect: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null, isConnected: false });
        }
      },
    }),
    {
      name: 'socket-store',
    }
  )
);
