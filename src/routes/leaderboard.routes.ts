import { Router } from 'express'
import {
  getLeaderboardController,
  getUserRankController,
  getReportController
} from '../controllers/leaderboard.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.get('/report', authenticate, getReportController)
router.get('/rank/:category', authenticate, getUserRankController)
router.get('/:category', authenticate, getLeaderboardController)

export default router