const express = require('express')
const Model = require('./models/Model')
require('dotenv').config()
const app = express()
const cookieparser = require('cookie-parser')
const cors = require('cors')

//use middleware

/**
 * use in front end
 * axios.post('url',{},{withCredentials:true})
 * axios.defaults.withCredentials=true
 */


app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieparser())// parse http cookie
// app.use(cors({
//     origin: ["http://localhost:3000/"],
//     credentials: true
// }))
app.use(cors({ origin: true, credentials: true }))

//router
app.use('/user', require('./routers/userRouter'))
app.use('/cus', require('./routers/cusRouter'))

//connection to the db
new Model()
app.listen(2727, () => console.log("run on port 2727"))

