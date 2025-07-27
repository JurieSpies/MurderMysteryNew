"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketService = void 0;
const types_1 = require("../types");
const gameManager_1 = require("./gameManager");
class SocketService {
    constructor(io) {
        this.io = io;
        this.gameManager = new gameManager_1.GameManager();
        this.setupSocketHandlers();
    }
    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`🔌 User connected: ${socket.id}`);
            socket.on(types_1.SocketEvents.CREATE_GAME, (payload) => {
                this.handleCreateGame(socket, payload);
            });
            socket.on(types_1.SocketEvents.JOIN_GAME, (payload) => {
                this.handleJoinGame(socket, payload);
            });
            socket.on(types_1.SocketEvents.LEAVE_GAME, () => {
                this.handleLeaveGame(socket);
            });
            socket.on(types_1.SocketEvents.START_GAME, () => {
                this.handleStartGame(socket);
            });
            socket.on(types_1.SocketEvents.ASSIGN_CHARACTER, (payload) => {
                this.handleAssignCharacter(socket, payload);
            });
            socket.on(types_1.SocketEvents.CHANGE_PHASE, (phase) => {
                this.handleChangePhase(socket, phase);
            });
            socket.on(types_1.SocketEvents.RELEASE_CLUE, (payload) => {
                this.handleReleaseClue(socket, payload);
            });
            socket.on(types_1.SocketEvents.SEND_MESSAGE, (payload) => {
                this.handleSendMessage(socket, payload);
            });
            socket.on(types_1.SocketEvents.SUBMIT_ACCUSATION, (payload) => {
                this.handleSubmitAccusation(socket, payload);
            });
            socket.on(types_1.SocketEvents.REVEAL_SOLUTION, () => {
                this.handleRevealSolution(socket);
            });
            socket.on('disconnect', (reason) => {
                console.log(`🔌 User disconnected: ${socket.id}, reason: ${reason}`);
                this.handleDisconnect(socket);
            });
            socket.on('ping', () => {
                socket.emit('pong');
            });
        });
    }
    handleCreateGame(socket, payload) {
        try {
            const game = this.gameManager.createGame(socket.id, payload.playerName, payload.scenarioId);
            socket.join(game.code);
            socket.emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'Game created successfully!'
            });
            console.log(`🎮 Game created: ${game.code} by ${payload.playerName}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to create game'
            });
        }
    }
    handleJoinGame(socket, payload) {
        try {
            const game = this.gameManager.joinGame(payload.gameCode, socket.id, payload.playerName);
            socket.join(payload.gameCode);
            this.io.to(payload.gameCode).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: `${payload.playerName} joined the game!`
            });
            console.log(`🎮 Player ${payload.playerName} joined game: ${payload.gameCode}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to join game'
            });
        }
    }
    handleLeaveGame(socket) {
        try {
            const result = this.gameManager.leaveGame(socket.id);
            if (result) {
                const { game, playerName } = result;
                socket.leave(game.code);
                this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                    success: true,
                    game: this.serializeGame(game),
                    message: `${playerName} left the game`
                });
                console.log(`🎮 Player ${playerName} left game: ${game.code}`);
            }
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to leave game'
            });
        }
    }
    handleStartGame(socket) {
        try {
            const game = this.gameManager.startGame(socket.id);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'Game started!'
            });
            console.log(`🎮 Game started: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to start game'
            });
        }
    }
    handleAssignCharacter(socket, payload) {
        try {
            const game = this.gameManager.assignCharacter(socket.id, payload.playerId, payload.characterId);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'Character assigned!'
            });
            console.log(`🎭 Character assigned in game: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to assign character'
            });
        }
    }
    handleChangePhase(socket, phase) {
        try {
            const game = this.gameManager.changePhase(socket.id, phase);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: `Phase changed to ${phase}`
            });
            console.log(`🎮 Phase changed to ${phase} in game: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to change phase'
            });
        }
    }
    handleReleaseClue(socket, payload) {
        try {
            const game = this.gameManager.releaseClue(socket.id, payload.clueId);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'New clue revealed!'
            });
            console.log(`🔍 Clue released in game: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to release clue'
            });
        }
    }
    handleSendMessage(socket, payload) {
        try {
            const result = this.gameManager.sendMessage(socket.id, payload);
            if (result) {
                const { game, message } = result;
                if (payload.isPrivate && payload.recipientId) {
                    const recipient = Array.from(game.players.values()).find(p => p.id === payload.recipientId);
                    if (recipient) {
                        this.io.to(recipient.socketId).emit(types_1.SocketEvents.RECEIVE_MESSAGE, message);
                        socket.emit(types_1.SocketEvents.RECEIVE_MESSAGE, message);
                    }
                }
                else {
                    this.io.to(game.code).emit(types_1.SocketEvents.RECEIVE_MESSAGE, message);
                }
                console.log(`💬 Message sent in game: ${game.code}`);
            }
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to send message'
            });
        }
    }
    handleSubmitAccusation(socket, payload) {
        try {
            const game = this.gameManager.submitAccusation(socket.id, payload);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'Accusation submitted!'
            });
            console.log(`⚖️ Accusation submitted in game: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to submit accusation'
            });
        }
    }
    handleRevealSolution(socket) {
        try {
            const game = this.gameManager.revealSolution(socket.id);
            this.io.to(game.code).emit(types_1.SocketEvents.GAME_UPDATE, {
                success: true,
                game: this.serializeGame(game),
                message: 'Solution revealed!'
            });
            console.log(`🎭 Solution revealed in game: ${game.code}`);
        }
        catch (error) {
            socket.emit(types_1.SocketEvents.ERROR, {
                message: error instanceof Error ? error.message : 'Failed to reveal solution'
            });
        }
    }
    handleDisconnect(socket) {
        try {
            const result = this.gameManager.handleDisconnect(socket.id);
            if (result) {
                const { game, playerName } = result;
                this.io.to(game.code).emit(types_1.SocketEvents.PLAYER_UPDATE, {
                    game: this.serializeGame(game),
                    message: `${playerName} disconnected`
                });
                console.log(`🔌 Player ${playerName} disconnected from game: ${game.code}`);
            }
        }
        catch (error) {
            console.error('Error handling disconnect:', error);
        }
    }
    serializeGame(game) {
        return {
            ...game,
            players: Array.from(game.players.values())
        };
    }
    getGameManager() {
        return this.gameManager;
    }
}
exports.SocketService = SocketService;
//# sourceMappingURL=socketService.js.map