import express from 'express'
import { userAuth, doctorAuth } from '../middlewares/auth.js'
import Notification from '../models/notification.js'
import Appointment from '../models/appointment.js'

const notificationRouter = express.Router()

// Get all notifications for a user
notificationRouter.get('/user/notification/view', userAuth, async (req, res) => {
    try {
        const userId = req.user._id
        const { unreadOnly } = req.query

        let query = { userId: userId }

        if (unreadOnly === 'true') {
            query.isRead = false
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })

        const safeNotifications = notifications.map((notification) =>
            notification.getSafeData()
        )

        res.status(200).json({
            message: "notifications fetched",
            body: safeNotifications
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Mark notification as read
notificationRouter.patch('/user/notification/mark-read/:notificationId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id
        const { notificationId } = req.params

        const notification = await Notification.findOne({ _id: notificationId, userId: userId })

        if (!notification) {
            throw new Error('notification not found')
        }

        notification.isRead = true
        await notification.save()

        res.status(200).json({
            message: "notification marked as read",
            body: notification.getSafeData()
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Mark all notifications as read
notificationRouter.patch('/user/notification/mark-all-read', userAuth, async (req, res) => {
    try {
        const userId = req.user._id

        await Notification.updateMany(
            { userId: userId, isRead: false },
            { $set: { isRead: true } }
        )

        res.status(200).json({
            message: "all notifications marked as read"
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Delete notification
notificationRouter.delete('/user/notification/delete/:notificationId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id
        const { notificationId } = req.params

        const notification = await Notification.findOneAndDelete({ _id: notificationId, userId: userId })

        if (!notification) {
            throw new Error('notification not found')
        }

        res.status(200).json({
            message: "notification deleted"
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

// Get unread notification count
notificationRouter.get('/user/notification/count/unread', userAuth, async (req, res) => {
    try {
        const userId = req.user._id

        const count = await Notification.countDocuments({ userId: userId, isRead: false })

        res.status(200).json({
            message: "unread notification count fetched",
            body: { unreadCount: count }
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

export default notificationRouter
