import { Request, Response } from 'express'
import { submitScore } from '../services/score.service'

export const submitScoreController = async (req: Request, res: Response) => {
  try {
    const { text } = req.body
    const userId = req.user?.userId

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ message: 'Text is required' })
      return
    }

    const scores = await submitScore(userId, text)

    res.status(201).json({
      message: 'Score submitted successfully',
      data: scores
    })

  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}