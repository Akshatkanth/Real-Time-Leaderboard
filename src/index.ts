import 'dotenv/config'
import express, {Application, Request, Response} from 'express'
import authRoutes from './routes/auth.routes'
import scoreRoutes from './routes/score.routes'
import leaderboardRoutes from './routes/leaderboard.routes'

const app: Application = express()
const PORT = process.env.PORT || 3000

//middleware
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/scores', scoreRoutes)//submit score
app.use('/leaderboard', leaderboardRoutes)

//health check
app.get('/health', (req: Request, res:Response)=>{
    res.json({status:"ok"})
})



//start server
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})

console.log('DATABASE_URL:', process.env.DATABASE_URL)