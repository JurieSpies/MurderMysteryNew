"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameRoutes_1 = __importDefault(require("./gameRoutes"));
const router = (0, express_1.Router)();
router.use('/games', gameRoutes_1.default);
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
exports.default = router;
//# sourceMappingURL=index.js.map