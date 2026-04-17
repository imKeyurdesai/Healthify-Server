import express from 'express'
import connectDB from './config/db.js'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { appointmentRouter, authRouter, doctorRouter, profileRouter } from './routes/index.js'

dotenv.config()

const app = express()

const allowedOrigins = ['http://localhost:5173']

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use('/', authRouter, profileRouter, appointmentRouter, doctorRouter)

connectDB().then(() => {
    console.log('Database connection established...')
    app.listen(process.env.PORT, () => {
        console.log("Server running on port " + process.env.PORT)
    })
}).catch(
    (err) => {
        console.log('databse connection failed', err)
    }
)
