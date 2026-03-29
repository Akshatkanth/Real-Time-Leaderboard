import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types'

declare global{
    namespace Express{
        interface Request{
            user?:JwtPayload
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload

    req.user = payload
    next()

  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}