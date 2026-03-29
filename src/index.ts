import express, {Application, Request, Response} from 'express'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'

dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 3000

//middleware
app.use(express.json())

app.use('/auth', authRoutes)

//health check
app.get('/health', (req: Request, res:Response)=>{
    res.json({status:"ok"})
})

//start server
app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})