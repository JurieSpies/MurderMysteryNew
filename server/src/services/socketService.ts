import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import {
  GameSession,
  Player,
  SocketEvents,
  CreateGamePayload,
  JoinGamePayload,
  AssignCharacterPayload,
  SendMessagePayload,
  SubmitAccusationPayload,
  ReleaseCluePayload,
  GamePhase,
  ChatMessage
} from '../types';
import { GameManager } from './gameManager';

export class SocketService {
  private io: Server;
  private gameManager: GameManager;

  constructor(io: Server) {
    this.io = io;
    this.gameManager = new GameManager();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Game Management Events
      socket.on(SocketEvents.CREATE_GAME, (payload: CreateGamePayload) => {
        this.handleCreateGame(socket, payload);
      });

      socket.on(SocketEvents.JOIN_GAME, (payload: JoinGamePayload) => {
        this.handleJoinGame(socket, payload);
      });

      socket.on(SocketEvents.LEAVE_GAME, () => {
        this.handleLeaveGame(socket);
      });

      socket.on(SocketEvents.START_GAME, () => {
        this.handleStartGame(socket);
      });

      // Game Flow Events
      socket.on(SocketEvents.ASSIGN_CHARACTER, (payload: AssignCharacterPayload) => {
        this.handleAssignCharacter(socket, payload);
      });

      socket.on(SocketEvents.CHANGE_PHASE, (phase: GamePhase) => {
        this.handleChangePhase(socket, phase);
      });

      socket.on(SocketEvents.RELEASE_CLUE, (payload: ReleaseCluePayload) => {
        this.handleReleaseClue(socket, payload);
      });

      // Communication Events
      socket.on(SocketEvents.SEND_MESSAGE, (payload: SendMessagePayload) => {
        this.handleSendMessage(socket, payload);
      });

      // Accusation Events
      socket.on(SocketEvents.SUBMIT_ACCUSATION, (payload: SubmitAccusationPayload) => {
        this.handleSubmitAccusation(socket, payload);
      });

      socket.on(SocketEvents.REVEAL_SOLUTION, () => {
        this.handleRevealSolution(socket);
      });

      // Disconnection
      socket.on('disconnect', (reason) => {
        console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
        this.handleDisconnect(socket);
      });

      // Test events
      socket.on('ping', () => {
        socket.emit('pong');
      });
    });
  }

  private handleCreateGame(socket: Socket, payload: CreateGamePayload): void {
    try {
      const game = this.gameManager.createGame(socket.id, payload.playerName, payload.scenarioId);
      socket.join(game.code);

      socket.emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'Game created successfully!'
      });

      console.log(`🎮 Game created: ${game.code} by ${payload.playerName}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to create game'
      });
    }
  }

  private handleJoinGame(socket: Socket, payload: JoinGamePayload): void {
    try {
      const game = this.gameManager.joinGame(payload.gameCode, socket.id, payload.playerName);
      socket.join(payload.gameCode);

      // Notify all players in the game
      this.io.to(payload.gameCode).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: `${payload.playerName} joined the game!`
      });

      console.log(`🎮 Player ${payload.playerName} joined game: ${payload.gameCode}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to join game'
      });
    }
  }

  private handleLeaveGame(socket: Socket): void {
    try {
      const result = this.gameManager.leaveGame(socket.id);
      if (result) {
        const { game, playerName } = result;
        socket.leave(game.code);

        // Notify remaining players
        this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
          success: true,
          game: this.serializeGame(game),
          message: `${playerName} left the game`
        });

        console.log(`🎮 Player ${playerName} left game: ${game.code}`);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to leave game'
      });
    }
  }

  private handleStartGame(socket: Socket): void {
    try {
      const game = this.gameManager.startGame(socket.id);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'Game started!'
      });

      console.log(`🎮 Game started: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to start game'
      });
    }
  }
  private handleAssignCharacter(socket: Socket, payload: AssignCharacterPayload): void {
    try {
      const game = this.gameManager.assignCharacter(socket.id, payload.playerId, payload.characterId);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'Character assigned!'
      });

      console.log(`🎭 Character assigned in game: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to assign character'
      });
    }
  }

  private handleChangePhase(socket: Socket, phase: GamePhase): void {
    try {
      const game = this.gameManager.changePhase(socket.id, phase);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: `Phase changed to ${phase}`
      });

      console.log(`🎮 Phase changed to ${phase} in game: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to change phase'
      });
    }
  }

  private handleReleaseClue(socket: Socket, payload: ReleaseCluePayload): void {
    try {
      const game = this.gameManager.releaseClue(socket.id, payload.clueId);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'New clue revealed!'
      });

      console.log(`🔍 Clue released in game: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to release clue'
      });
    }
  }

  private handleSendMessage(socket: Socket, payload: SendMessagePayload): void {
    try {
      const result = this.gameManager.sendMessage(socket.id, payload);
      if (result) {
        const { game, message } = result;

        if (payload.isPrivate && payload.recipientId) {
          // Send private message to specific player
          const recipient = Array.from(game.players.values()).find(p => p.id === payload.recipientId);
          if (recipient) {
            this.io.to(recipient.socketId).emit(SocketEvents.RECEIVE_MESSAGE, message);
            socket.emit(SocketEvents.RECEIVE_MESSAGE, message); // Send to sender too
          }
        } else {
          // Send public message to all players in the game
          this.io.to(game.code).emit(SocketEvents.RECEIVE_MESSAGE, message);
        }

        console.log(`💬 Message sent in game: ${game.code}`);
      }
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  }

  private handleSubmitAccusation(socket: Socket, payload: SubmitAccusationPayload): void {
    try {
      const game = this.gameManager.submitAccusation(socket.id, payload);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'Accusation submitted!'
      });

      console.log(`⚖️ Accusation submitted in game: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to submit accusation'
      });
    }
  }

  private handleRevealSolution(socket: Socket): void {
    try {
      const game = this.gameManager.revealSolution(socket.id);

      // Notify all players
      this.io.to(game.code).emit(SocketEvents.GAME_UPDATE, {
        success: true,
        game: this.serializeGame(game),
        message: 'Solution revealed!'
      });

      console.log(`🎭 Solution revealed in game: ${game.code}`);
    } catch (error) {
      socket.emit(SocketEvents.ERROR, {
        message: error instanceof Error ? error.message : 'Failed to reveal solution'
      });
    }
  }

  private handleDisconnect(socket: Socket): void {
    try {
      const result = this.gameManager.handleDisconnect(socket.id);
      if (result) {
        const { game, playerName } = result;

        // Notify remaining players
        this.io.to(game.code).emit(SocketEvents.PLAYER_UPDATE, {
          game: this.serializeGame(game),
          message: `${playerName} disconnected`
        });

        console.log(`🔌 Player ${playerName} disconnected from game: ${game.code}`);
      }
    } catch (error) {
      console.error('Error handling disconnect:', error);
    }
  }

  private serializeGame(game: GameSession): any {
    return {
      ...game,
      players: Array.from(game.players.values())
    };
  }

  public getGameManager(): GameManager {
    return this.gameManager;
  }
}
