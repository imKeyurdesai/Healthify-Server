import validator from 'validator';

const validateSignup = (req) => {
    const { firstName, lastName, emailId, password } = req.body

    const requiredFields = { firstName, emailId, password }

    //for of loop which creates an array of key value pairs from the requiredFields object and checks if any of the values are undefined, null or empty string. If any of the values are invalid, it throws an error with the corresponding key name.
    for (const [key, value] of Object.entries(requiredFields)) {
        if (value === undefined || value === null || value.trim() === '') {
            throw new Error(`${key} is required`)
        }
    }

    if (firstName) {
        if (firstName.length < 2 || firstName.length > 30) {
            throw new Error('firstName length should be between 2 to 30')
        }

        const nameReg = /^[a-z ,.'-]+$/i
        if (!nameReg.test(firstName)) {
            throw new Error('firstName is not valid')
        }
    }

    if (lastName) {
        if (lastName.length < 2 || lastName.length > 30) {
            throw new Error('lastName length should be between 2 to 30')
        }

        const nameReg = /^[a-z ,.'-]+$/i
        if (!nameReg.test(lastName)) {
            throw new Error('lastName is not valid')
        }
    }

    if (emailId) {
        if(!validator.isEmail(emailId)){
            throw new Error('email is not valid')
        }
    }

    if(password){
        if(password.length < 5){
            throw new Error('password should be at least 5 characters long')
        }
        if(!validator.isStrongPassword(password)){
            throw new Error('password should be strong')
        }
    }

}

export default validateSignup 