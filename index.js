const express = require('express')
const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors')
const ConnectDb = require('./Utils/DataBase')

const userRoutes = require('./Routers/AuthRoutes')
const chatRoutes = require('./Routers/message.routes')



const app = express()

app.use(cors({
    origin: ['http://localhost:3000','http://localhost:5173','https://chatter-kid.netlify.app'],
}))
app.use(express.json())




ConnectDb()




app.use('/api/user',userRoutes)
app.use('/api/message',chatRoutes)

app.listen(process.env.PORT , ()=>{
    console.log(`Server is running on port ${process.env.PORT}`)
})