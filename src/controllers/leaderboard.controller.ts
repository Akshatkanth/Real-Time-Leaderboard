import { Request, Response } from 'express'
import { getLeaderboard, getUserRank } from '../services/leaderboard.service'

export const getLeaderboardController = async (req: Request, res: Response) => {
  try {
    const { category } = req.params

    const leaderboard = await getLeaderboard(category)

    res.status(200).json({
      message: `Leaderboard for ${category}`,
      data: leaderboard
    })

  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}

export const getUserRankController = async (req: Request, res: Response) => {
  try {
    const { category } = req.params
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    const rankData = await getUserRank(userId, category)

    res.status(200).json({
      message: `Your rank in ${category}`,
      data: rankData
    })

  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}