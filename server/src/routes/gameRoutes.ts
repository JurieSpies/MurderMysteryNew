import { Router, Request, Response } from 'express';
import { GameManager } from '../services/gameManager';
import { ScenarioService } from '../services/scenarioService';

const router = Router();

// This will be injected by the main server
let gameManager: GameManager;
let scenarioService: ScenarioService;

export const setGameManager = (gm: GameManager) => {
  gameManager = gm;
};

export const setScenarioService = (ss: ScenarioService) => {
  scenarioService = ss;
};

// GET /api/games/stats - Get server statistics
router.get('/stats', (req: Request, res: Response) => {
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
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get game statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/games/scenarios - Get available game scenarios
router.get('/scenarios', (req: Request, res: Response) => {
  try {
    if (!scenarioService) {
      return res.status(500).json({ error: 'Scenario service not initialized' });
    }

    const scenarios = scenarioService.getAllScenarios();

    // Return scenarios without the solution for security
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
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get scenarios',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/games/scenarios/:id - Get specific scenario details
router.get('/scenarios/:id', (req: Request, res: Response) => {
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

    // Return scenario without the solution for security
    const publicScenario = {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      characters: scenario.characters.map(char => ({
        id: char.id,
        name: char.name,
        description: char.description,
        publicInfo: char.publicInfo
        // Don't include privateInfo or secrets
      })),
      minPlayers: scenario.minPlayers,
      maxPlayers: scenario.maxPlayers
    };

    return res.json({
      success: true,
      data: publicScenario
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to get scenario',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/games/validate-code - Validate a game code
router.post('/validate-code', (req: Request, res: Response) => {
  try {
    const { gameCode } = req.body;

    if (!gameCode || typeof gameCode !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Game code is required and must be a string'
      });
    }

    // Basic format validation
    const isValidFormat = /^[A-Z0-9]{6}$/.test(gameCode.toUpperCase());

    return res.json({
      success: true,
      data: {
        isValid: isValidFormat,
        gameCode: gameCode.toUpperCase()
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to validate game code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/games/health - Health check for game services
router.get('/health', (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
