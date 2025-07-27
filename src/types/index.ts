// Game Types
export interface Player {
  id: string;
  name: string;
  character?: Character;
  isHost: boolean;
  isConnected: boolean;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  publicInfo: string;
  privateInfo: string;
  secrets: string[];
  relationships: Record<string, string>;
  avatar?: string;
}

export interface Clue {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'image' | 'document';
  category: string;
  isPublic: boolean;
  revealedAt?: Date;
  imageUrl?: string;
}

export interface GameScenario {
  id: string;
  title: string;
  description: string;
  characters: Character[];
  clues: Clue[];
  solution: {
    murderer: string;
    motive: string;
    method: string;
    explanation: string;
  };
  minPlayers: number;
  maxPlayers: number;
}

export interface GameSession {
  id: string;
  code: string;
  scenario: GameScenario;
  players: Player[];
  currentPhase: GamePhase;
  hostId: string;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  chatMessages?: ChatMessage[];
  accusations?: Accusation[];
  revealedClues?: string[];
}

export interface Accusation {
  playerId: string;
  playerName: string;
  murderer: string;
  motive: string;
  method: string;
  submittedAt: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isPrivate: boolean;
  recipientId?: string;
}

// Enums
export enum GamePhase {
  LOBBY = 'lobby',
  INTRODUCTION = 'introduction',
  INVESTIGATION = 'investigation',
  ACCUSATION = 'accusation',
  REVEAL = 'reveal',
  FINISHED = 'finished',
}

export enum SocketEvents {
  // Connection
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  // Game Management
  CREATE_GAME = 'create_game',
  JOIN_GAME = 'join_game',
  LEAVE_GAME = 'leave_game',
  START_GAME = 'start_game',

  // Game Flow
  CHANGE_PHASE = 'change_phase',
  ASSIGN_CHARACTER = 'assign_character',
  RELEASE_CLUE = 'release_clue',

  // Communication
  SEND_MESSAGE = 'send_message',
  RECEIVE_MESSAGE = 'receive_message',

  // Accusations
  SUBMIT_ACCUSATION = 'submit_accusation',
  REVEAL_SOLUTION = 'reveal_solution',

  // Updates
  GAME_UPDATE = 'game_update',
  PLAYER_UPDATE = 'player_update',
  ERROR = 'error',
}
