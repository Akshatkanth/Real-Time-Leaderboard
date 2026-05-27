import 'dotenv/config'
import express, {Application, Request, Response} from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.routes'
import scoreRoutes from './routes/score.routes'
import leaderboardRoutes from './routes/leaderboard.routes'
import { rebuildLeaderboards } from './services/leaderboard.service'

const app: Application = express()
const PORT = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/scores', scoreRoutes)//submit score
app.use('/leaderboard', leaderboardRoutes)

//health check
app.get('/health', (req: Request, res:Response)=>{
    res.json({status:"ok"})
})



//start server
const startServer = async () => {
    try {
        await rebuildLeaderboards()
        app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Failed to rebuild leaderboards:', error)
        app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    }
}

startServer()

