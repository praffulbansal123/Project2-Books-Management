const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    title :{
        type     : String,
        required : [ true, `title must be provided from these values: ["Mr", "Mrs", "Miss"]`],
        enum     : ["Mr", "Mrs", "Miss"],
        trim     : true
    },
    name :{
        type     : String,
        required : [true, "User name must be provided"],
        trim     : true
    },
    phone :{
        type     : String,
        required : [true, "mobile number must be provided"],
        unique   : [true, "mobile number already exist"],
        trim     : true,
    },
    email :{
        type     : String,
        required : [true, "email address must be provided"],
        unique   : [true, "email address already exist"],
        trim     : true,
        lowercase: true,
    },
    password :{
        type     : String,
        required : [true, "password must be provided"],
        minlength: 8,
        maxlength: 15
    },
    address :{
        street : {type :String, trim : true},
        city   : {type :String, trim : true},
        pincode: {type :String, trim : true}

    }

}, {timestamps : true
})

// hashing the password
userSchema.pre('save', async function(next) {
    try{
        const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUND))
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    } catch(err){
        next(err)
    }
})

module.exports = mongoose.model('User', userSchema)