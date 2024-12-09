const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const User = require('../Models/User.model');

const register = async (req,res)=>{
    const { userName ,fullName,password ,confirmPassword , gender} = req.body;
    if(!userName || !fullName || !password || !confirmPassword || !gender){
        return res.status(400).json({error : "Please enter all fields"})
        }
        if(password !== confirmPassword){
            return res.status(400).json({error : "Passwords do not match"})
            }
            if(userName.length>14 ){
                return res.status(500).json({
                    error:"Username Should be Less than 15 letter"
                })
            }
            const existingUser = await User.findOne({userName});
            if(existingUser){
                return res.status(400).json({error : "User already exists"})
                }
            try {
                const hashedPassword = await bcrypt.hash(password, 9);
                const avatar = `https://avatar.iran.liara.run/public/${gender==male?'boy':girl}?${userName}`
                const newUser = new User({
                    userName , fullName , password : hashedPassword , gender,avatar
                })

                const token = jwt.sign({userName:userName, _id:newUser._id},process.env.JWT_SECRET,{
                    expiresIn: '15d'
                })
                const savedUser = await newUser.save()

               return res.status(201).json({token , user:savedUser})
            } catch (error) {
                console.log(error) //I will delete at the end
                return res.status(400).json({
                    error : "Error creating user",
                    log:error
                })
            }
}   

const login = async (req,res)=>{
    const {userName,password} = req.body;
    if(!userName || !password){
        return res.status(400).json({error : "Please enter all fields"})
        }
        try {
            const user = await User.findOne({userName})
            if(!user){
                return res.status(400).json({error : "User not found"})
                }
                const isMatch = await bcrypt.compare(password,user.password)
                if(!isMatch){
                    return res.status(400).json({error : "Invalid password"})
                    }
                    const token = jwt.sign({userName:userName, _id:user._id},process.env.JWT_SECRET,{expiresIn:'15d'})
                    return res.status(200).json({user:user,token})
                }

            catch(err){
                console.log(err) //I will remove this too
                return res.status(400).json({
                    error : "Error logging in",
                    log:err
                    })
            }
}

const search = async (req,res)=>{
    const {searchTerm} = req.params;
    let users = await User.find({
        $or: [
          { username: { $regex: searchTerm, $options: "i" } },
          { fullName: { $regex: searchTerm, $options: "i" } },
        ],
      })
      .sort({
        username: { $regex: searchTerm, $options: "i" } ? -1 : 0, // Prioritize matches in the username
        fullName: { $regex: searchTerm, $options: "i" } ? 1 : 0, // Then sort based on fullName
      });
      users = users.filter(itm=>itm._id!= req.user._id)

      return res.status(200).json(users)
}

const me = async (req,res)=>{
    const user = await User.findById(req.user._id)
    return res.status(200).json(user)
}

const userData = async(req,res)=>{
    const {id} = req.params;
    const user = await User.findById(id)
    if(!user){
        return res.status(400).json({error : "User not found"})
    }
    return res.status(200).json({user})
}
module.exports = {
    register,
    login,
    me,
    search,
    userData
}