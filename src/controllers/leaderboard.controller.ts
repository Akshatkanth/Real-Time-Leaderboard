import { Request, Response } from 'express'
import { getLeaderboard, getUserRank, getReport } from '../services/leaderboard.service'

export const getLeaderboardController = async (req: Request, res: Response) => {
  try {
    const category = req.params.category as string

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
    const category = req.params.category as string
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

export const getReportController = async (req: Request, res: Response) => {
  try {
    const { period } = req.query as { period: string }

    if (!period) {
      res.status(400).json({ message: 'Period is required. Use: 7d, 30d, or 1y' })
      return
    }

    const report = await getReport(period)

    res.status(200).json({
      message: `Top players report for the last ${period}`,
      data: report
    })

  } catch (error: any) {
    res.status(400).json({ message: error.message })
  }
}