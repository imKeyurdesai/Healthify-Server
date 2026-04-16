import User from "../models/user.js"
import Doctor from "../models/doctors.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies

        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = decodedMessage

        const user = await User.findOne({ _id: _id })
        if (!user) throw new Error("user does not exists")
        req.user = user
        next()
    } catch (error) {
        res.status(401).json({ message: `UNAUTHENTICATED` })
    }
}

const doctorAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies

        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = decodedMessage

        const doctor = await Doctor.findOne({ _id: _id })
        if (!doctor) throw new Error("doctor does not exist")

        req.doctor = doctor
        next()
    } catch (error) {
        res.status(401).json({ message: `UNAUTHENTICATED` })
    }
}

export { userAuth, doctorAuth }