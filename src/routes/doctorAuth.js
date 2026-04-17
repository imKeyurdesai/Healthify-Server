import express from 'express'
import { doctorAuth, userAuth } from '../middlewares/auth.js'
import Doctor from '../models/doctors.js'
import User from '../models/user.js'
import bcrypt from 'bcryptjs'

const doctorRouter = express.Router()
const isProduction = process.env.NODE_ENV === 'production'

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: 3600 * 24 * 7 * 1000
}

doctorRouter.post('/doctor/register', userAuth, async (req, res) => {
    try {
        const user = req.user
        const { oldPassword, newPassword } = req.body
        const { firstName, lastName, emailId, age, gender, profileUrl } = user

        if (!newPassword) {
            throw new Error('new password is required')
        }

        if (!oldPassword) {
            throw new Error('old password is required')
        }

        if (!firstName || !emailId) {
            throw new Error('required fields are empty')
        }

        const isDoctorExist = await Doctor.findOne({ emailId: emailId })

        const isOldPasswordValid = await user.validatePassword(oldPassword)

        if (!isOldPasswordValid) {
            throw new Error('invalid old password')
        }

        if (isDoctorExist) {
            throw new Error('doctor already exists')
        }

        const passwordHash = await bcrypt.hash(newPassword, 10)

        const newDoctor = new Doctor({
            firstName: firstName,
            lastName: lastName,
            emailId: emailId,
            password: passwordHash,
            age: age,
            gender: gender,
            profileUrl: profileUrl
        })

        await newDoctor.save()

        await User.findByIdAndDelete(user._id)

        const token = await newDoctor.getJWT()
        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            message: 'congrats! you became doctor',
            body: newDoctor.getSafeData()
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

doctorRouter.post('/doctor/login', async (req, res) => {
    try {
        const { emailId, password } = req.body

        if (!emailId || !password) {
            throw new Error('emailId and password are required')
        }

        const doctor = await Doctor.findOne({ emailId: emailId })
        if (!doctor) {
            throw new Error('invalid credentials')
        }

        const isPasswordValid = await doctor.validatePassword(password)
        if (!isPasswordValid) {
            throw new Error('invalid credentials')
        }

        const token = await doctor.getJWT()
        res.cookie('token', token, cookieOptions)

        res.status(200).json({
            message: 'doctor logged in successfully',
            body: doctor.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

export default doctorRouter