"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setScenarioService = exports.setGameManager = void 0;
const express_1 = require("express");
const router = (0, express_1.Router)();
let gameManager;
let scenarioService;
const setGameManager = (gm) => {
    gameManager = gm;
};
exports.setGameManager = setGameManager;
const setScenarioService = (ss) => {
    scenarioService = ss;
};
exports.setScenarioService = setScenarioService;
router.get('/stats', (req, res) => {
    try {
        if (!gameManager) {
            return res.status(500).json({ error: 'Game manager not initialized' });
        }
        const stats = gameManager.getGameStats();
        return res.json({
            success: true,
            data: stats,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to get game statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/scenarios', (req, res) => {
    try {
        if (!scenarioService) {
            return res.status(500).json({ error: 'Scenario service not initialized' });
        }
        const scenarios = scenarioService.getAllScenarios();
        const publicScenarios = scenarios.map(scenario => ({
            id: scenario.id,
            title: scenario.title,
            description: scenario.description,
            minPlayers: scenario.minPlayers,
            maxPlayers: scenario.maxPlayers,
            characterCount: scenario.characters.length,
            clueCount: scenario.clues.length
        }));
        return res.json({
            success: true,
            data: publicScenarios
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to get scenarios',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/scenarios/:id', (req, res) => {
    try {
        if (!scenarioService) {
            return res.status(500).json({ error: 'Scenario service not initialized' });
        }
        const { id } = req.params;
        const scenario = scenarioService.getScenario(id);
        if (!scenario) {
            return res.status(404).json({
                error: 'Scenario not found',
                message: `No scenario found with ID: ${id}`
            });
        }
        const publicScenario = {
            id: scenario.id,
            title: scenario.title,
            description: scenario.description,
            characters: scenario.characters.map(char => ({
                id: char.id,
                name: char.name,
                description: char.description,
                publicInfo: char.publicInfo
            })),
            minPlayers: scenario.minPlayers,
            maxPlayers: scenario.maxPlayers
        };
        return res.json({
            success: true,
            data: publicScenario
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to get scenario',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/validate-code', (req, res) => {
    try {
        const { gameCode } = req.body;
        if (!gameCode || typeof gameCode !== 'string') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Game code is required and must be a string'
            });
        }
        const isValidFormat = /^[A-Z0-9]{6}$/.test(gameCode.toUpperCase());
        return res.json({
            success: true,
            data: {
                isValid: isValidFormat,
                gameCode: gameCode.toUpperCase()
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            error: 'Failed to validate game code',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/health', (req, res) => {
    try {
        const health = {
            gameManager: !!gameManager,
            scenarioService: !!scenarioService,
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        };
        const allHealthy = health.gameManager && health.scenarioService;
        res.status(allHealthy ? 200 : 503).json({
            success: allHealthy,
            data: health
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Health check failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
//# sourceMappingURL=gameRoutes.js.map