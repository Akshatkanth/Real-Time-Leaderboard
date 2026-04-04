import {Router} from 'express'
import { submitScoreController } from '../controllers/leaderboard.controller'

import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.post('/submit', authenticate, submitScoreController)

export default router