import express from 'express'
import { doctorAuth, userAuth } from '../middlewares/auth.js'
import Appointment from '../models/appointment.js'
import Doctor from '../models/doctors.js'
import Notification from '../models/notification.js'

const appointmentRouter = express.Router()

appointmentRouter.post('/user/appointment/create', userAuth, async (req, res) => {
    try {
        const user = req.user
        const { doctorId, scheduledTime } = req.body

        if (!doctorId || !scheduledTime) {
            throw new Error('doctorId and scheduledTime are required fields')
        }

        const doctor = await Doctor.findById(doctorId)
        const appointmentExists = await Appointment.findOne({
            doctorId: doctorId,
            patientId: user._id,
            status: 'pending'
        })

        if (!doctor) throw new Error('doctor does not exists')

        if (appointmentExists) {
            throw new Error('appointment already exists')
        }

        const appointment = new Appointment({ doctorId: doctorId, patientId: user._id, appointmentTime: scheduledTime, status: "pending", patient: user.getSafeData(), doctor: doctor.getSafeData() })

        appointment.validateRequest()

        await appointment.save()

        const safeAppointment = await appointment.getSafeData()

        res.status(200).json({
            message: "appointment added",
            body: safeAppointment
        })

    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
})

appointmentRouter.get('/user/appointment/view', userAuth, async (req, res) => {
    try {
        const userId = req.user._id
        const now = new Date()

        await Appointment.updateMany(
            {
                patientId: userId,
                status: 'pending',
                appointmentTime: { $lte: now }
            },
            { $set: { status: 'expired' } }
        )
        const Appointments = await Appointment.find({ patientId: userId })

        const safeAppointments = await Promise.all(Appointments.map((appointment) =>
            appointment.getSafeData()
        ))

        res.status(200).json({
            message: "appointments fetched",
            body: safeAppointments.reverse()
        })

    } catch (error) {
        res.status(400).json({
            message: 'unable to view appointment : ' + error.message
        })
    }
})

appointmentRouter.patch('/user/appointment/cancel/:appointmentId', userAuth, async (req, res) => {
    try {
        const userId = req.user._id
        const { appointmentId } = req.params

        const appointment = await Appointment.findOne({ _id: appointmentId, patientId: userId, status: { $in: ['pending', 'accepted'] } })

        if (!appointment) {
            throw new Error('appointment not found')
        }

        appointment.status = 'cancelled';
        await appointment.save()

        const safe = await appointment.getSafeData()

        await Notification.create({
            userId: appointment.patientId,
            title: 'Appointment Cancelled',
            message: `Your appointment with Dr. ${safe.doctor.firstName} ${safe.doctor.lastName} has been cancelled`
        })

        res.status(200).json({
            message: "appointment cancelled",
            body: safe
        })

    } catch (error) {
        res.status(400).json({
            message: error.message,
        })
    }
})

appointmentRouter.get('/doctor/appointment/view', doctorAuth, async (req, res) => {
    try {
        const doctor = req.doctor
        const now = new Date()

        await Appointment.updateMany(
            {
                doctorId: doctor._id,
                status: 'pending',
                appointmentTime: { $lte: now }
            },
            { $set: { status: 'expired' } }
        )

        const appointments = await Appointment.find({ doctorId: doctor._id })

        const safeAppointments = await Promise.all(appointments.map((appointment) => {
            return appointment.getSafeData()
        }))

        res.status(200).json({
            message: "appointments fetched",
            body: safeAppointments.reverse()
        })

    } catch (error) {
        res.status(400).json({
            message: 'unable to review appointment : ' + error.message
        })
    }
})

appointmentRouter.patch('/doctor/appointment/review/:appointmentId', doctorAuth, async (req, res) => {
    try {
        const doctor = req.doctor
        const { appointmentId } = req.params
        const { appointedTime, status } = req.body

        if (!appointmentId) {
            throw new Error('please provide appointment id')
        }

        const allowedStatus = ['accepted', 'rejected']
        const validStatus = allowedStatus.includes(status)

        if (!status || !validStatus) {
            throw new Error('enter valid status')
        }

        if (status === 'accepted' && !appointedTime) {
            throw new Error('appointedTime is required when accepting an appointment')
        }


        const isAppointmentValid = await Appointment.findOne({ _id: appointmentId, doctorId: doctor._id, status: 'pending' })

        if (!isAppointmentValid) {
            throw new Error('invalid appointment')
        }

        const appointment = await Appointment.findById(appointmentId)

        appointment.status = status

        if (appointedTime && status === 'accepted') {
            appointment.appointmentTime = appointedTime
            appointment.validateRequest()
        }

        await appointment.save()

        await Notification.create({
            userId: appointment.patientId,
            title: 'Appointment Rescheduled',
            message: `Your appointment has been rescheduled by Dr. ${doctor.firstName} ${doctor.lastName}`
        })

        const safeEdited = await appointment.getSafeData()

        res.status(200).json({
            message: 'appointment sucessfully edited',
            body: safeEdited
        })

    } catch (error) {
        res.status(400).json({
            message: 'appointment review failed : ' + error.message
        })
    }
})


export default appointmentRouter