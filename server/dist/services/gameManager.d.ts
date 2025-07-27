import { GameSession, GamePhase, SendMessagePayload, SubmitAccusationPayload, ChatMessage } from '../types';
export declare class GameManager {
    private games;
    private playerToGame;
    private scenarioService;
    constructor();
    createGame(socketId: string, playerName: string, scenarioId?: string): GameSession;
    joinGame(gameCode: string, socketId: string, playerName: string): GameSession;
    leaveGame(socketId: string): {
        game: GameSession;
        playerName: string;
    } | null;
    startGame(socketId: string): GameSession;
    assignCharacter(socketId: string, playerId: string, characterId: string): GameSession;
    changePhase(socketId: string, phase: GamePhase): GameSession;
    releaseClue(socketId: string, clueId: string): GameSession;
    sendMessage(socketId: string, payload: SendMessagePayload): {
        game: GameSession;
        message: ChatMessage;
    } | null;
    submitAccusation(socketId: string, payload: SubmitAccusationPayload): GameSession;
    revealSolution(socketId: string): GameSession;
    handleDisconnect(socketId: string): {
        game: GameSession;
        playerName: string;
    } | null;
    private getGameBySocketId;
    private getPlayerBySocketId;
    private autoAssignCharacters;
    private shuffleArray;
    private generateGameCode;
    private startCleanupInterval;
    private cleanupOldGames;
    getGameCount(): number;
    getPlayerCount(): number;
    getGameStats(): {
        totalGames: number;
        totalPlayers: number;
        gamesByPhase: Record<string, number>;
    };
}
//# sourceMappingURL=gameManager.d.ts.map