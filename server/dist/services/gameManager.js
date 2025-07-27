"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const uuid_1 = require("uuid");
const types_1 = require("../types");
const scenarioService_1 = require("./scenarioService");
class GameManager {
    constructor() {
        this.games = new Map();
        this.playerToGame = new Map();
        this.scenarioService = new scenarioService_1.ScenarioService();
        this.startCleanupInterval();
    }
    createGame(socketId, playerName, scenarioId) {
        let gameCode;
        do {
            gameCode = this.generateGameCode();
        } while (this.games.has(gameCode));
        const scenario = this.scenarioService.getScenario(scenarioId);
        if (!scenario) {
            throw new Error('Invalid scenario');
        }
        const hostPlayer = {
            id: (0, uuid_1.v4)(),
            socketId,
            name: playerName,
            isHost: true,
            isConnected: true,
            joinedAt: new Date()
        };
        const game = {
            id: (0, uuid_1.v4)(),
            code: gameCode,
            scenario,
            players: new Map([[hostPlayer.id, hostPlayer]]),
            currentPhase: types_1.GamePhase.LOBBY,
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
    joinGame(gameCode, socketId, playerName) {
        const game = this.games.get(gameCode.toUpperCase());
        if (!game) {
            throw new Error('Game not found');
        }
        if (game.currentPhase !== types_1.GamePhase.LOBBY) {
            throw new Error('Game has already started');
        }
        if (game.players.size >= game.scenario.maxPlayers) {
            throw new Error('Game is full');
        }
        const existingPlayer = Array.from(game.players.values()).find(p => p.name === playerName);
        if (existingPlayer) {
            throw new Error('Player name already taken');
        }
        const player = {
            id: (0, uuid_1.v4)(),
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
    leaveGame(socketId) {
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
        if (player.isHost) {
            if (game.players.size > 0) {
                const newHost = Array.from(game.players.values())[0];
                newHost.isHost = true;
                game.hostId = newHost.id;
            }
            else {
                this.games.delete(gameCode);
                return null;
            }
        }
        if (game.players.size === 0) {
            this.games.delete(gameCode);
            return null;
        }
        return { game, playerName };
    }
    startGame(socketId) {
        const game = this.getGameBySocketId(socketId);
        const player = this.getPlayerBySocketId(socketId, game);
        if (!player.isHost) {
            throw new Error('Only the host can start the game');
        }
        if (game.players.size < game.scenario.minPlayers) {
            throw new Error(`Need at least ${game.scenario.minPlayers} players to start`);
        }
        if (game.currentPhase !== types_1.GamePhase.LOBBY) {
            throw new Error('Game has already started');
        }
        this.autoAssignCharacters(game);
        game.currentPhase = types_1.GamePhase.INTRODUCTION;
        game.startedAt = new Date();
        return game;
    }
    assignCharacter(socketId, playerId, characterId) {
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
        const existingAssignment = Array.from(game.players.values()).find(p => p.character?.id === characterId);
        if (existingAssignment) {
            throw new Error('Character already assigned');
        }
        player.character = character;
        return game;
    }
    changePhase(socketId, phase) {
        const game = this.getGameBySocketId(socketId);
        const player = this.getPlayerBySocketId(socketId, game);
        if (!player.isHost) {
            throw new Error('Only the host can change game phase');
        }
        game.currentPhase = phase;
        return game;
    }
    releaseClue(socketId, clueId) {
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
    sendMessage(socketId, payload) {
        const game = this.getGameBySocketId(socketId);
        const player = this.getPlayerBySocketId(socketId, game);
        const message = {
            id: (0, uuid_1.v4)(),
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
    submitAccusation(socketId, payload) {
        const game = this.getGameBySocketId(socketId);
        const player = this.getPlayerBySocketId(socketId, game);
        if (game.currentPhase !== types_1.GamePhase.ACCUSATION) {
            throw new Error('Accusations can only be submitted during the accusation phase');
        }
        const existingAccusation = game.accusations.find(a => a.playerId === player.id);
        if (existingAccusation) {
            throw new Error('You have already submitted an accusation');
        }
        const accusation = {
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
    revealSolution(socketId) {
        const game = this.getGameBySocketId(socketId);
        const player = this.getPlayerBySocketId(socketId, game);
        if (!player.isHost) {
            throw new Error('Only the host can reveal the solution');
        }
        game.currentPhase = types_1.GamePhase.REVEAL;
        return game;
    }
    handleDisconnect(socketId) {
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
    getGameBySocketId(socketId) {
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
    getPlayerBySocketId(socketId, game) {
        const player = Array.from(game.players.values()).find(p => p.socketId === socketId);
        if (!player) {
            throw new Error('Player not found in game');
        }
        return player;
    }
    autoAssignCharacters(game) {
        const unassignedPlayers = Array.from(game.players.values()).filter(p => !p.character);
        const availableCharacters = game.scenario.characters.filter(c => !Array.from(game.players.values()).some(p => p.character?.id === c.id));
        const shuffledCharacters = this.shuffleArray(availableCharacters);
        unassignedPlayers.forEach((player, index) => {
            if (index < shuffledCharacters.length) {
                player.character = shuffledCharacters[index];
            }
        });
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    generateGameCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupOldGames();
        }, 30 * 60 * 1000);
    }
    cleanupOldGames() {
        const now = new Date();
        const maxAge = 2 * 60 * 60 * 1000;
        for (const [gameCode, game] of this.games.entries()) {
            const gameAge = now.getTime() - game.createdAt.getTime();
            const shouldRemove = gameAge > maxAge ||
                (game.currentPhase === types_1.GamePhase.FINISHED && gameAge > 30 * 60 * 1000);
            if (shouldRemove) {
                for (const player of game.players.values()) {
                    this.playerToGame.delete(player.socketId);
                }
                this.games.delete(gameCode);
                console.log(`🧹 Cleaned up old game: ${gameCode}`);
            }
        }
    }
    getGameCount() {
        return this.games.size;
    }
    getPlayerCount() {
        let totalPlayers = 0;
        for (const game of this.games.values()) {
            totalPlayers += game.players.size;
        }
        return totalPlayers;
    }
    getGameStats() {
        const gamesByPhase = {};
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
exports.GameManager = GameManager;
//# sourceMappingURL=gameManager.js.map