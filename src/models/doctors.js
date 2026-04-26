import mongoose from "mongoose";
import validator from 'validator'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const doctorSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 30,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 2,
        maxLength: 30,
    },
    emailId: {
        type: String,
        trim: true,
        lowercase: true,
        required: true,
        unique: true,
        validate: {
            validator: function (email) {
                return validator.isEmail(email)
            },
            message: "enter a valid email"
        }
    },
    mobileNumber: {
        type: String,
        trim: true,
        unique: true,
        validate: {
            validator: function (mobile) {
                return validator.isMobilePhone(mobile)
            },
            message: "enter a valid mobile number"
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 5,
        validate: {
            validator: function (pass) {
                return validator.isStrongPassword(pass)
            },
            message: "enter a strong password"
        }
    },
    role: {
        type: String,
        required: true,
        default: 'doctor'
    },
    age: {
        type: Number,
        min: 15,
        max: 100,
    },
    gender: {
        type: String,
        lowercase: true,
        trim: true,
        enum: {
            values: ['male', 'female', 'other'],
            message: '{VALUE} is not valid gender'
        }
    },
    profileUrl: {
        type: String,
        default: 'https://www.pngall.com/wp-content/uploads/5/Profile-Avatar-PNG-Picture.png',
        trim: true,
        validate: {
            validator: function (url) {
                return validator.isURL(url)
            },
            message: 'enter a valid url'
        }
    },
    skills: {
        type: [String],
        max: 10
    },
    languages: {
        type: [String],
        max: 10,
        default: ['English']
    },
    about: {
        type: String
    },
    location: {
        type: String
    }
}, {
    timestamps: true
})

doctorSchema.methods.getSafeData = function () {
    const { _id, firstName, lastName, emailId, mobileNumber, age, gender, profileUrl, role, skills, languages, about, location } = this
    return { _id, firstName, lastName, emailId, mobileNumber, age, gender, profileUrl, role, skills, location, about, languages }

}

doctorSchema.methods.getJWT = async function () {
    const doctor = this

    const token = jwt.sign({ _id: doctor._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return token
}

doctorSchema.methods.validatePassword = async function (doctorPassword) {
    const doctor = this
    const passwordHash = doctor.password

    const isPasswordValid = bcrypt.compare(doctorPassword, passwordHash)
    return isPasswordValid
}

const Doctor = mongoose.model('Doctor', doctorSchema)

export default Doctor