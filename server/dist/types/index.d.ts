export interface Player {
    id: string;
    socketId: string;
    name: string;
    character?: Character;
    isHost: boolean;
    isConnected: boolean;
    joinedAt: Date;
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
    players: Map<string, Player>;
    currentPhase: GamePhase;
    hostId: string;
    createdAt: Date;
    startedAt?: Date;
    endedAt?: Date;
    revealedClues: string[];
    accusations: Accusation[];
    chatMessages: ChatMessage[];
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
export declare enum GamePhase {
    LOBBY = "lobby",
    INTRODUCTION = "introduction",
    INVESTIGATION = "investigation",
    ACCUSATION = "accusation",
    REVEAL = "reveal",
    FINISHED = "finished"
}
export declare enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    CREATE_GAME = "create_game",
    JOIN_GAME = "join_game",
    LEAVE_GAME = "leave_game",
    START_GAME = "start_game",
    CHANGE_PHASE = "change_phase",
    ASSIGN_CHARACTER = "assign_character",
    RELEASE_CLUE = "release_clue",
    SEND_MESSAGE = "send_message",
    RECEIVE_MESSAGE = "receive_message",
    SUBMIT_ACCUSATION = "submit_accusation",
    REVEAL_SOLUTION = "reveal_solution",
    GAME_UPDATE = "game_update",
    PLAYER_UPDATE = "player_update",
    ERROR = "error"
}
export interface CreateGamePayload {
    playerName: string;
    scenarioId?: string;
}
export interface JoinGamePayload {
    gameCode: string;
    playerName: string;
}
export interface AssignCharacterPayload {
    playerId: string;
    characterId: string;
}
export interface SendMessagePayload {
    content: string;
    isPrivate: boolean;
    recipientId?: string;
}
export interface SubmitAccusationPayload {
    murderer: string;
    motive: string;
    method: string;
}
export interface ReleaseCluePayload {
    clueId: string;
}
//# sourceMappingURL=index.d.ts.map