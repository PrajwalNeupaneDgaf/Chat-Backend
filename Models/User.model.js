const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    avatar:{
        type:String,
        default:"",
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        enum:["male","female"],
        required:true
    }
},{timestamps:true})

const User = mongoose.model('User',userSchema)

module.exports = User