import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

notificationSchema.methods.getSafeData = function () {
    const { _id, userId, appointmentId, type, title, message, isRead, createdAt, updatedAt } = this
    return { _id, userId, appointmentId, type, title, message, isRead, createdAt, updatedAt }
}

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification
