// Game Configuration
export const GAME_CONFIG = {
  MIN_PLAYERS: 4,
  MAX_PLAYERS: 8,
  GAME_CODE_LENGTH: 6,
  INVESTIGATION_ROUNDS: 3,
  ROUND_DURATION_MINUTES: 15,
  ACCUSATION_TIME_MINUTES: 10,
} as const;

// Socket Configuration
export const SOCKET_CONFIG = {
  SERVER_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001',
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
} as const;

// UI Constants
export const UI_CONFIG = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  ANIMATION_DURATION: 300,
} as const;

// Game Phases
export const PHASE_NAMES = {
  lobby: 'Lobby',
  introduction: 'Introduction',
  investigation: 'Investigation',
  accusation: 'Final Accusations',
  reveal: 'The Reveal',
  finished: 'Game Complete',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GAME_NOT_FOUND: 'Game not found. Please check your game code.',
  GAME_FULL: 'This game is full. Please try another game.',
  INVALID_GAME_CODE: 'Invalid game code format.',
  CONNECTION_FAILED: 'Failed to connect to the game server.',
  PLAYER_NAME_REQUIRED: 'Player name is required.',
  CHARACTER_ASSIGNMENT_FAILED: 'Failed to assign character.',
  MESSAGE_SEND_FAILED: 'Failed to send message.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  GAME_CREATED: 'Game created successfully!',
  GAME_JOINED: 'Successfully joined the game!',
  CHARACTER_ASSIGNED: 'Character assigned successfully!',
  MESSAGE_SENT: 'Message sent!',
  ACCUSATION_SUBMITTED: 'Accusation submitted!',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  PLAYER_NAME: 'murder_mystery_player_name',
  GAME_SESSION: 'murder_mystery_game_session',
  SETTINGS: 'murder_mystery_settings',
} as const;
