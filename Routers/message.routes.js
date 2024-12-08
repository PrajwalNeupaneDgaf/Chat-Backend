const express = require('express')
const Authorize = require('../Middlewares/Auth.middleware')
const { getMyChatList, myMessages, deleteChat, SendMesage } = require('../Controllers/Message.Controller')

const app = express()
const router = express.Router()



router.get('/getmychatlist',Authorize,getMyChatList)
router.delete('/delete/:otherUserId',Authorize,deleteChat)
router.get('/mymessages/:userId',Authorize,myMessages)
router.post('/sendmessage/:to',Authorize,SendMesage)


module.exports = router;