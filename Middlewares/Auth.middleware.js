const jwt = require("jsonwebtoken");

 const Authorize = async (req,res,next)=>{
    const token = req.headers['authorization'];
    if(!token) return res.status(401).send({error:'Unauthorized'});
    const Tokens = token.split(' ')
    const actualToken = Tokens[1]
    if(!actualToken)return res.status(401).send({error:'Unauthorized'})
    try {
        const data = jwt.verify(actualToken,process.env.JWT_SECRET)
        req.user = data
        next()
    } catch (error) {
        return res.status(400).json({
            message: "Invalid token",
            log:error
        })
    }
 }

 module.exports = Authorize