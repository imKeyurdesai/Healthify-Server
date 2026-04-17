import express from 'express'
import { validateSignup } from '../validators/index.js'
import User from '../models/user.js'
import bcrypt from 'bcryptjs'

const authRouter = express.Router()
const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 3600 * 24 * 7 * 1000
}

const clearCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
}

authRouter.post('/user/signup', async (req, res) => {
    try {
        const { firstName, emailId, password } = req.body

        if (!firstName || !emailId || !password) {
            throw new Error('firstName, emailId and password are required')
        }

        validateSignup(req)

        const isUserExists = await User.findOne({ emailId })

        if (isUserExists) {
            return res.status(400).json({
                message: 'user already exists'
            })
        }

        const passwordHash = await bcrypt.hash(password, 10)
        const user = new User({ firstName, emailId, password: passwordHash })
        await user.save()

        const token = await user.getJWT()

        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            message: 'user registered successfully',
            body: user.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

authRouter.post('/user/login', async (req, res) => {
    try {
        const { emailId, password } = req.body
        if (!emailId || !password) {
            throw new Error('emailId and password are required')
        }
        const user = await User.findOne({ emailId })

        if (!user) throw new Error('invalid credentials')

        const isPasswordValid = user.validatePassword(password)

        if (isPasswordValid) {
            const token = await user.getJWT()
            res.cookie('token', token, cookieOptions)
        }
        else {
            throw new Error('invalid credentials')
        }

        res.status(200).json({
            message: 'logged in successfully',
            body: user.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

authRouter.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token', clearCookieOptions)
        res.status(200).json({
            message: 'logged out successfully'
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

export default authRouter