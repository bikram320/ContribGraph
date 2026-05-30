import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import connectDB from './config/db.js'

dotenv.config()
connectDB()

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true  // required for HttpOnly cookies
}))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ContribGraph API running' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))