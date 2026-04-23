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
            values: ['accepted', 'pending', 'rejected', 'cancelled', 'expired'],
            message: 'invalid status'
        }
    },
    patient: {
        type: Object,
        required: true
    },
    doctor: {
        type: Object,
        required: true
    },
    appointmentTime: {
        type: Date
    }
}, {
    timestamps: true
})

appointmentSchema.methods.getSafeData = function () {
    const { _id, doctorId, patientId, status, appointmentTime, patient, doctor } = this
    return { _id, doctorId, patientId, status, appointmentTime, patient, doctor }
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