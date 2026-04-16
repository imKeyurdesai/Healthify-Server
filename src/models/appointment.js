import mongoose from "mongoose";
import validator from 'validator'

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId
    },
    status: {
        type: String,
        enum: {
            values: ['accepted', 'pending', 'rejected'],
            message: 'invalid status'
        }
    },
    appointmentTime: {
        type: Date,
        validate: {
            validator: function (v) {
                return v > Date.now()
            },
            message: "Appointment time must be in the future"
        }
    }
}, {
    timestamps: true
})

appointmentSchema.methods.getSafeData = function () {
    const { _id, doctorId, patientId, status, appointmentTime } = this
    return { _id, doctorId, patientId, status, appointmentTime }
}

appointmentSchema.methods.validateRequest = function () {
    const appointmentTime = this.appointmentTime

    if (!appointmentTime || isNaN(appointmentTime) || appointmentTime <= Date.now()) {
        throw new Error('invalid date')
    }

    return true
}

const Appointment = mongoose.model('Appointment', appointmentSchema)

export default Appointment