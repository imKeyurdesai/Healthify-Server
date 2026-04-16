import validator from 'validator'
import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs';

dotenv.config()

const userSchema = new Schema({
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
        default: 'patient'
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
    }
}, {
    timestamps: true
})

userSchema.methods.getSafeData = function () {
    const { _id, firstName, lastName, emailId, age, gender, profileUrl, role } = this
    return { 
        _id,
        firstName,
        lastName,
        emailId,
        age,
        gender,
        profileUrl,
        role
    }

}

userSchema.methods.getJWT = async function () {
    const user = this

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return token
}

userSchema.methods.validatePassword = async function (userPassword) {
    const user = this
    const passwordHash = user.password

    const isPasswordValid = bcrypt.compare(userPassword, passwordHash)
    return isPasswordValid;
}

const User = mongoose.model('User', userSchema)


export default User