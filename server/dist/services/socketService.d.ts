import { Server } from 'socket.io';
import { GameManager } from './gameManager';
export declare class SocketService {
    private io;
    private gameManager;
    constructor(io: Server);
    private setupSocketHandlers;
    private handleCreateGame;
    private handleJoinGame;
    private handleLeaveGame;
    private handleStartGame;
    private handleAssignCharacter;
    private handleChangePhase;
    private handleReleaseClue;
    private handleSendMessage;
    private handleSubmitAccusation;
    private handleRevealSolution;
    private handleDisconnect;
    private serializeGame;
    getGameManager(): GameManager;
}
//# sourceMappingURL=socketService.d.ts.map