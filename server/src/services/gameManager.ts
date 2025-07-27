import { v4 as uuidv4 } from 'uuid';
import {
  GameSession,
  Player,
  GamePhase,
  SendMessagePayload,
  SubmitAccusationPayload,
  ChatMessage,
  Accusation,
  GameScenario
} from '../types';
import { ScenarioService } from './scenarioService';

export class GameManager {
  private games: Map<string, GameSession> = new Map();
  private playerToGame: Map<string, string> = new Map(); // socketId -> gameCode
  private scenarioService: ScenarioService;

  constructor() {
    this.scenarioService = new ScenarioService();
    this.startCleanupInterval();
  }

  public createGame(socketId: string, playerName: string, scenarioId?: string): GameSession {
    // Generate unique game code
    let gameCode: string;
    do {
      gameCode = this.generateGameCode();
    } while (this.games.has(gameCode));

    // Get scenario
    const scenario = this.scenarioService.getScenario(scenarioId);
    if (!scenario) {
      throw new Error('Invalid scenario');
    }

    // Create host player
    const hostPlayer: Player = {
      id: uuidv4(),
      socketId,
      name: playerName,
      isHost: true,
      isConnected: true,
      joinedAt: new Date()
    };

    // Create game session
    const game: GameSession = {
      id: uuidv4(),
      code: gameCode,
      scenario,
      players: new Map([[hostPlayer.id, hostPlayer]]),
      currentPhase: GamePhase.LOBBY,
      hostId: hostPlayer.id,
      createdAt: new Date(),
      revealedClues: [],
      accusations: [],
      chatMessages: []
    };

    this.games.set(gameCode, game);
    this.playerToGame.set(socketId, gameCode);

    return game;
  }

  public joinGame(gameCode: string, socketId: string, playerName: string): GameSession {
    const game = this.games.get(gameCode.toUpperCase());
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.currentPhase !== GamePhase.LOBBY) {
      throw new Error('Game has already started');
    }

    if (game.players.size >= game.scenario.maxPlayers) {
      throw new Error('Game is full');
    }

    // Check if player name is already taken
    const existingPlayer = Array.from(game.players.values()).find(p => p.name === playerName);
    if (existingPlayer) {
      throw new Error('Player name already taken');
    }

    // Create new player
    const player: Player = {
      id: uuidv4(),
      socketId,
      name: playerName,
      isHost: false,
      isConnected: true,
      joinedAt: new Date()
    };

    game.players.set(player.id, player);
    this.playerToGame.set(socketId, gameCode);

    return game;
  }

  public leaveGame(socketId: string): { game: GameSession; playerName: string } | null {
    const gameCode = this.playerToGame.get(socketId);
    if (!gameCode) {
      return null;
    }

    const game = this.games.get(gameCode);
    if (!game) {
      return null;
    }

    const player = Array.from(game.players.values()).find(p => p.socketId === socketId);
    if (!player) {
      return null;
    }

    const playerName = player.name;
    game.players.delete(player.id);
    this.playerToGame.delete(socketId);

    // If host left, assign new host or delete game
    if (player.isHost) {
      if (game.players.size > 0) {
        const newHost = Array.from(game.players.values())[0];
        newHost.isHost = true;
        game.hostId = newHost.id;
      } else {
        this.games.delete(gameCode);
        return null;
      }
    }

    // If no players left, delete game
    if (game.players.size === 0) {
      this.games.delete(gameCode);
      return null;
    }

    return { game, playerName };
  }

  public startGame(socketId: string): GameSession {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    if (!player.isHost) {
      throw new Error('Only the host can start the game');
    }

    if (game.players.size < game.scenario.minPlayers) {
      throw new Error(`Need at least ${game.scenario.minPlayers} players to start`);
    }

    if (game.currentPhase !== GamePhase.LOBBY) {
      throw new Error('Game has already started');
    }

    // Assign characters if not already assigned
    this.autoAssignCharacters(game);

    game.currentPhase = GamePhase.INTRODUCTION;
    game.startedAt = new Date();

    return game;
  }
  public assignCharacter(socketId: string, playerId: string, characterId: string): GameSession {
    const game = this.getGameBySocketId(socketId);
    const host = this.getPlayerBySocketId(socketId, game);

    if (!host.isHost) {
      throw new Error('Only the host can assign characters');
    }

    const player = game.players.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const character = game.scenario.characters.find(c => c.id === characterId);
    if (!character) {
      throw new Error('Character not found');
    }

    // Check if character is already assigned
    const existingAssignment = Array.from(game.players.values()).find(p => p.character?.id === characterId);
    if (existingAssignment) {
      throw new Error('Character already assigned');
    }

    player.character = character;
    return game;
  }

  public changePhase(socketId: string, phase: GamePhase): GameSession {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    if (!player.isHost) {
      throw new Error('Only the host can change game phase');
    }

    game.currentPhase = phase;
    return game;
  }

  public releaseClue(socketId: string, clueId: string): GameSession {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    if (!player.isHost) {
      throw new Error('Only the host can release clues');
    }

    const clue = game.scenario.clues.find(c => c.id === clueId);
    if (!clue) {
      throw new Error('Clue not found');
    }

    if (!game.revealedClues.includes(clueId)) {
      game.revealedClues.push(clueId);
      clue.revealedAt = new Date();
    }

    return game;
  }

  public sendMessage(socketId: string, payload: SendMessagePayload): { game: GameSession; message: ChatMessage } | null {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    const message: ChatMessage = {
      id: uuidv4(),
      senderId: player.id,
      senderName: player.name,
      content: payload.content,
      timestamp: new Date(),
      isPrivate: payload.isPrivate,
      recipientId: payload.recipientId
    };

    game.chatMessages.push(message);
    return { game, message };
  }

  public submitAccusation(socketId: string, payload: SubmitAccusationPayload): GameSession {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    if (game.currentPhase !== GamePhase.ACCUSATION) {
      throw new Error('Accusations can only be submitted during the accusation phase');
    }

    // Check if player already submitted an accusation
    const existingAccusation = game.accusations.find(a => a.playerId === player.id);
    if (existingAccusation) {
      throw new Error('You have already submitted an accusation');
    }

    const accusation: Accusation = {
      playerId: player.id,
      playerName: player.name,
      murderer: payload.murderer,
      motive: payload.motive,
      method: payload.method,
      submittedAt: new Date()
    };

    game.accusations.push(accusation);
    return game;
  }

  public revealSolution(socketId: string): GameSession {
    const game = this.getGameBySocketId(socketId);
    const player = this.getPlayerBySocketId(socketId, game);

    if (!player.isHost) {
      throw new Error('Only the host can reveal the solution');
    }

    game.currentPhase = GamePhase.REVEAL;
    return game;
  }

  public handleDisconnect(socketId: string): { game: GameSession; playerName: string } | null {
    const gameCode = this.playerToGame.get(socketId);
    if (!gameCode) {
      return null;
    }

    const game = this.games.get(gameCode);
    if (!game) {
      return null;
    }

    const player = Array.from(game.players.values()).find(p => p.socketId === socketId);
    if (!player) {
      return null;
    }

    player.isConnected = false;
    return { game, playerName: player.name };
  }

  private getGameBySocketId(socketId: string): GameSession {
    const gameCode = this.playerToGame.get(socketId);
    if (!gameCode) {
      throw new Error('Player not in any game');
    }

    const game = this.games.get(gameCode);
    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  private getPlayerBySocketId(socketId: string, game: GameSession): Player {
    const player = Array.from(game.players.values()).find(p => p.socketId === socketId);
    if (!player) {
      throw new Error('Player not found in game');
    }
    return player;
  }
  private autoAssignCharacters(game: GameSession): void {
    const unassignedPlayers = Array.from(game.players.values()).filter(p => !p.character);
    const availableCharacters = game.scenario.characters.filter(c =>
      !Array.from(game.players.values()).some(p => p.character?.id === c.id)
    );

    // Shuffle characters for random assignment
    const shuffledCharacters = this.shuffleArray(availableCharacters);

    unassignedPlayers.forEach((player, index) => {
      if (index < shuffledCharacters.length) {
        player.character = shuffledCharacters[index];
      }
    });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private generateGameCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  private startCleanupInterval(): void {
    // Clean up old games every 30 minutes
    setInterval(() => {
      this.cleanupOldGames();
    }, 30 * 60 * 1000);
  }

  private cleanupOldGames(): void {
    const now = new Date();
    const maxAge = 2 * 60 * 60 * 1000; // 2 hours

    for (const [gameCode, game] of this.games.entries()) {
      const gameAge = now.getTime() - game.createdAt.getTime();

      // Remove games older than 2 hours or finished games older than 30 minutes
      const shouldRemove = gameAge > maxAge ||
        (game.currentPhase === GamePhase.FINISHED && gameAge > 30 * 60 * 1000);

      if (shouldRemove) {
        // Clean up player mappings
        for (const player of game.players.values()) {
          this.playerToGame.delete(player.socketId);
        }

        this.games.delete(gameCode);
        console.log(`🧹 Cleaned up old game: ${gameCode}`);
      }
    }
  }

  // Public methods for monitoring
  public getGameCount(): number {
    return this.games.size;
  }

  public getPlayerCount(): number {
    let totalPlayers = 0;
    for (const game of this.games.values()) {
      totalPlayers += game.players.size;
    }
    return totalPlayers;
  }

  public getGameStats(): { totalGames: number; totalPlayers: number; gamesByPhase: Record<string, number> } {
    const gamesByPhase: Record<string, number> = {};

    for (const game of this.games.values()) {
      gamesByPhase[game.currentPhase] = (gamesByPhase[game.currentPhase] || 0) + 1;
    }

    return {
      totalGames: this.getGameCount(),
      totalPlayers: this.getPlayerCount(),
      gamesByPhase
    };
  }
}
