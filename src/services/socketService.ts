import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '../stores/socketStore';
import { useGameStore } from '../stores/gameStore';
import { SocketEvents } from '../types/index';
import { SOCKET_CONFIG } from '../utils/constants';

class SocketService {
  private socket: Socket | null = null;

  public connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve(this.socket);
        return;
      }

      const socketStore = useSocketStore.getState();
      const gameStore = useGameStore.getState();

      socketStore.setConnecting(true);
      socketStore.setError(null);

      this.socket = io(SOCKET_CONFIG.SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('🔌 Connected to server');
        socketStore.setSocket(this.socket);
        socketStore.setConnected(true);
        socketStore.setConnecting(false);
        gameStore.setConnectionState(true);
        resolve(this.socket!);
      });

      // Game events - automatically update store
      this.socket.on('game_created', (data) => {
        console.log('🎮 Game created event received:', data);
        if (data.game && data.player) {
          gameStore.setCurrentGame(data.game);
          gameStore.setCurrentPlayer(data.player);
          console.log('✅ Store updated from game_created event');
        }
      });

      this.socket.on('game_joined', (data) => {
        console.log('🎮 Game joined event received:', data);
        if (data.game && data.player) {
          gameStore.setCurrentGame(data.game);
          gameStore.setCurrentPlayer(data.player);
          console.log('✅ Store updated from game_joined event');
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        socketStore.setConnected(false);
        gameStore.setConnectionState(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('🔌 Connection error:', error);
        socketStore.setConnecting(false);
        socketStore.setError('Failed to connect to server');
        gameStore.setError('Connection failed. Please try again.');
        reject(error);
      });

      // Game events
      this.setupGameEventListeners();
    });
  }

  private setupGameEventListeners(): void {
    if (!this.socket) return;

    const gameStore = useGameStore.getState();

    // Game updates
    this.socket.on(SocketEvents.GAME_UPDATE, (data) => {
      console.log('🎮 Game update received:', data);
      if (data.success && data.game) {
        gameStore.setCurrentGame(data.game);
        if (data.game.currentPhase) {
          gameStore.setGamePhase(data.game.currentPhase);
        }
      }
      if (data.message) {
        // Could show a toast notification here
        console.log('📢 Game message:', data.message);
      }
    });

    // Player updates
    this.socket.on(SocketEvents.PLAYER_UPDATE, (data) => {
      console.log('👤 Player update received:', data);
      if (data.game) {
        gameStore.setCurrentGame(data.game);
      }
    });

    // Chat messages
    this.socket.on(SocketEvents.RECEIVE_MESSAGE, (message) => {
      console.log('💬 Message received:', message);
      gameStore.addChatMessage(message);
    });

    // Errors
    this.socket.on(SocketEvents.ERROR, (error) => {
      console.error('❌ Server error:', error);
      gameStore.setError(error.message || 'An error occurred');
    });

    // Test events
    this.socket.on('pong', () => {
      console.log('🏓 Pong received');
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;

      const socketStore = useSocketStore.getState();
      const gameStore = useGameStore.getState();

      socketStore.setSocket(null);
      socketStore.setConnected(false);
      gameStore.setConnectionState(false);
    }
  }

  public emit(event: string, data?: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  public createGame(playerName: string, scenarioId?: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit(
          SocketEvents.CREATE_GAME,
          { playerName, scenarioId },
          (response: unknown) => {
            if (
              response &&
              typeof response === 'object' &&
              'success' in response &&
              response.success
            ) {
              resolve(response);
            } else {
              reject(new Error('Failed to create game'));
            }
          }
        );
      } else {
        reject(new Error('Socket not connected'));
      }
    });
  }

  public joinGame(gameCode: string, playerName: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.emit(
          SocketEvents.JOIN_GAME,
          { gameCode, playerName },
          (response: unknown) => {
            if (
              response &&
              typeof response === 'object' &&
              'success' in response &&
              response.success
            ) {
              resolve(response);
            } else {
              reject(new Error('Failed to join game'));
            }
          }
        );
      } else {
        reject(new Error('Socket not connected'));
      }
    });
  }

  public leaveGame(): void {
    this.emit(SocketEvents.LEAVE_GAME);
  }

  public startGame(): void {
    this.emit(SocketEvents.START_GAME);
  }

  public assignCharacter(playerId: string, characterId: string): void {
    this.emit(SocketEvents.ASSIGN_CHARACTER, { playerId, characterId });
  }

  public changePhase(phase: string): void {
    this.emit(SocketEvents.CHANGE_PHASE, phase);
  }

  public kickPlayer(playerId: string): void {
    this.emit('kick_player', { playerId });
  }

  public endGame(): void {
    this.emit('end_game');
  }

  public releaseClue(clueId: string): void {
    this.emit(SocketEvents.RELEASE_CLUE, { clueId });
  }

  public sendMessage(
    content: string,
    isPrivate: boolean = false,
    recipientId?: string
  ): void {
    this.emit(SocketEvents.SEND_MESSAGE, { content, isPrivate, recipientId });
  }

  public submitAccusation(
    murderer: string,
    motive: string,
    method: string
  ): void {
    this.emit(SocketEvents.SUBMIT_ACCUSATION, { murderer, motive, method });
  }

  public revealSolution(): void {
    this.emit(SocketEvents.REVEAL_SOLUTION);
  }

  public ping(): void {
    this.emit('ping');
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
