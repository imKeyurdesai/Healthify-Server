import mongoose from "mongoose";
import validator from 'validator'

const appointmentSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Doctor'
    },
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
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

appointmentSchema.methods.getSafeData = async function () {
    const { _id, doctorId, patientId, status, appointmentTime } = this

    await this.populate(['doctorId', 'patientId'])

    const doctorData = (this.doctorId && typeof this.doctorId.getSafeData === 'function')
        ? this.doctorId.getSafeData()
        : (this.doctor || {})

    const patientData = (this.patientId && typeof this.patientId.getSafeData === 'function')
        ? this.patientId.getSafeData()
        : (this.patient || {})

    return { _id, doctorId, patientId, status, appointmentTime, patient: patientData, doctor: doctorData }
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