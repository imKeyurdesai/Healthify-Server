import express from 'express'
import { doctorAuth, userAuth } from '../middlewares/auth.js'
import { validateProfile } from '../validators/index.js'
import Doctor from '../models/doctors.js'
import User from '../models/user.js'

const profileRouter = express.Router()

profileRouter.get('/user/profile/view', userAuth, (req, res) => {
    try {
        const user = req.user
        res.json({
            message: "user fetched!",
            body: user.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: 'unable to get profile ' + error.message,
        })
    }
})

profileRouter.patch('/user/profile/update', userAuth, async (req, res) => {
    try {
        const user = req.user
        const allowedUpdates = ['firstName', 'lastName', 'age', 'gender', 'profileUrl']
        const requestKeys = Object.keys(req.body)
        const isValidUpdate = requestKeys.every((key) => allowedUpdates.includes(key))

        if (!isValidUpdate) {
            throw new Error('invalid update fields')
        }

        validateProfile(req)

        const updates = {}
        allowedUpdates.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== undefined) {
                updates[field] = req.body[field]
            }
        })

        if (Object.keys(updates).length === 0) {
            throw new Error('no valid fields provided for update')
        }

        Object.keys(updates).forEach((key) => {
            user[key] = updates[key]
        })

        const updatedUser = await user.save()

        res.json({
            message: 'profile updated sucessfully',
            body: updatedUser.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: 'unable to update profile : ' + error.message
        })
    }
})

profileRouter.get('/getAllDoctors', userAuth, async (req, res) => {
    try {
        const doctors = await Doctor.find({})

        const doctorSafeData = doctors.map(doctor => {
            return doctor.getSafeData()
        })

        res.status(200).json({
            message: 'fetched doctors',
            body: doctorSafeData
        })
    } catch (error) {
        res.status(400).json({
            message: 'error to list doctors' + error.message
        })
    }
})

profileRouter.get('/getUsers', doctorAuth, async (req, res) => {
    try {
        const { userIDs } = req.body

        if (!userIDs || !Array.isArray(userIDs)) {
            throw new Error('userIDs must be an array of user IDs')
        }

        const users = await Promise.all(userIDs.map(async (userId) => {
            const user = await User.findById(userId)
            if (!user) {
                throw new Error(`User with ID ${userId} not found`)
            }
            return user
        }))

        res.status(200).json({
            message: 'fetched users',
            body: users.map(user => user.getSafeData())
        })

    } catch (error) {
        res.status(400).json({
            message: 'error to list users' + error.message
        })
    }
})

profileRouter.get('/doctor/profile/view', doctorAuth, async (req, res) => {
    try {
        const doctor = req.doctor
        res.status(200).json({
            message: 'user fetched!',
            body: doctor.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: 'unable to get profile : ' + error.message
        })
    }
})

profileRouter.patch('/doctor/profile/update', doctorAuth, async (req, res) => {
    try {
        const doctor = req.doctor
        const allowedUpdates = ['firstName', 'lastName', 'age', 'mobileNumber', 'gender', 'profileUrl', 'skills', 'location', 'about', 'languages']
        const requestKeys = Object.keys(req.body)
        const isValidUpdate = requestKeys.every((key) => allowedUpdates.includes(key))

        if (!isValidUpdate) {
            throw new Error('invalid update fields')
        }

        validateProfile(req)


        const updates = {}
        allowedUpdates.forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(req.body, field) && req.body[field] !== undefined) {
                updates[field] = req.body[field]
            }
        })

        if (Object.keys(updates).length === 0) {
            throw new Error('no valid fields provided for update')
        }

        Object.keys(updates).forEach((key) => {
            doctor[key] = updates[key]
        })

        const updatedUser = await doctor.save()

        res.status(200).json({
            message: 'profile update successfully',
            body: updatedUser.getSafeData()
        })
    } catch (error) {
        res.status(400).json({
            message: 'unable to update profile : ' + error.message
        })
    }
})

export default profileRouter