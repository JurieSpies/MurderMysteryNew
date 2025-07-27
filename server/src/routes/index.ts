import { Router } from 'express';
import gameRoutes from './gameRoutes';

const router = Router();

// Mount game routes
router.use('/games', gameRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Murder Mystery Game API',
    version: '1.0.0',
    description: 'Backend API for the Murder Mystery Game',
    endpoints: {
      games: '/api/games',
      health: '/health',
      docs: 'API documentation not yet available'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;
