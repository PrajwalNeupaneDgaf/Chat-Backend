const express = require('express')
const { login, register, me, search, userData } = require('../Controllers/User.controller')
const Authorize = require('../Middlewares/Auth.middleware')

const app = express()
const router = express.Router()

router.post('/login',login)

router.post('/register',register)


router.get('/search/:searchTerm',Authorize,search)

router.get('/userdata/:id',Authorize,userData)

router.get('/me',Authorize,me)


module.exports = router;