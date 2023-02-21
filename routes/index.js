'use strict'

const express = require('express')
const api = express.Router()
const cors = require('cors')

const nodeCrtl = require('../controllers')

api.post('/user', cors(), nodeCrtl.verifyUser)
api.get('/user/:numDocument', cors(), nodeCrtl.userSearch)
api.put('/user/:numeroDeDocumento', cors(), nodeCrtl.updateInfoIlicitosUser)

module.exports = api
