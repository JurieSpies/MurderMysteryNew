import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  GameSession,
  Player,
  ChatMessage,
  Accusation,
} from '../types/index';
import { GamePhase } from '../types/index';

interface GameState {
  // Current game session
  currentGame: GameSession | null;
  currentPlayer: Player | null;

  // Connection state
  isConnected: boolean;
  isHost: boolean;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Game flow
  gamePhase: GamePhase;

  // Actions
  setCurrentGame: (game: GameSession | null) => void;
  setCurrentPlayer: (player: Player | null) => void;
  setConnectionState: (connected: boolean) => void;
  setHostStatus: (isHost: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setGamePhase: (phase: GamePhase) => void;

  // Game actions
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  addAccusation: (accusation: Accusation) => void;
  revealClue: (clueId: string) => void;

  // Reset
  resetGame: () => void;
}

const initialState = {
  currentGame: null,
  currentPlayer: null,
  isConnected: false,
  isHost: false,
  isLoading: false,
  error: null,
  gamePhase: GamePhase.LOBBY,
};

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Basic setters
      setCurrentGame: (game) => {
        console.log(
          '🎮 Setting current game in store:',
          game ? game.code : 'null'
        );
        set({ currentGame: game });
      },
      setCurrentPlayer: (player) => {
        console.log(
          '👤 Setting current player in store:',
          player ? player.name : 'null'
        );
        set({ currentPlayer: player });
      },
      setConnectionState: (connected) => set({ isConnected: connected }),
      setHostStatus: (isHost) => set({ isHost }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setGamePhase: (phase) => set({ gamePhase: phase }),

      // Game actions
      updatePlayer: (playerId, updates) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const updatedPlayers = currentGame.players.map((player) =>
          player.id === playerId ? { ...player, ...updates } : player
        );

        set({
          currentGame: {
            ...currentGame,
            players: updatedPlayers,
          },
        });
      },

      addPlayer: (player) => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            players: [...currentGame.players, player],
          },
        });
      },

      removePlayer: (playerId) => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            players: currentGame.players.filter((p) => p.id !== playerId),
          },
        });
      },

      addChatMessage: (message) => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            chatMessages: [...(currentGame.chatMessages || []), message],
          },
        });
      },

      addAccusation: (accusation) => {
        const { currentGame } = get();
        if (!currentGame) return;

        set({
          currentGame: {
            ...currentGame,
            accusations: [...(currentGame.accusations || []), accusation],
          },
        });
      },

      revealClue: (clueId) => {
        const { currentGame } = get();
        if (!currentGame) return;

        const revealedClues = currentGame.revealedClues || [];
        if (!revealedClues.includes(clueId)) {
          set({
            currentGame: {
              ...currentGame,
              revealedClues: [...revealedClues, clueId],
            },
          });
        }
      },

      resetGame: () => set(initialState),
    }),
    {
      name: 'game-store',
    }
  )
);
