import { Router } from 'express'
import { getLeaderboardController, getUserRankController } from '../controllers/leaderboard.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/:category', authenticate, getLeaderboardController)
router.get('/rank/:category', authenticate, getUserRankController)

export default router