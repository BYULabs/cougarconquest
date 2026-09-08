import express from 'express';

import { getHomePage } from './controllers/index.js';
import { getRivalryPage } from './controllers/rivalry.js';

const router = express.Router();

// Home Page Route
router.get('/', getHomePage);

router.get('/vs/:opponentId', getRivalryPage);

export default router;
