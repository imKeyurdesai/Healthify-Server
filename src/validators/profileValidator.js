import validator from 'validator'

const validateProfile = (req) => {
    const { firstName, lastName, age, gender, profileUrl, skills } = req.body

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
    if (age !== undefined && (!Number.isInteger(age) || age < 15 || age > 100)) {
        throw new Error('user must be in between 15 to 100 years old')
    }

    if (gender && !['male', 'female', 'other'].includes(String(gender).toLowerCase())) {
        throw new Error("gender should be male, female, or other")
    }

    if (profileUrl && !validator.isURL(profileUrl)) {
        throw new Error("profileUrl should be a valid URL")
    }

    if(skills && skills.length > 10){
        throw new Error("maximum amount of skill reached.")
    }

    return true;
}

export default validateProfile