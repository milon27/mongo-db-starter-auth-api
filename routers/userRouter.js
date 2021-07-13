const express = require('express')
const router = express.Router()
const Response = require('../models/Response')
const UserModel = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

//register
//http://localhost:2727/user/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, name, pass } = req.body
        //validatioin
        if (!email || !name || !pass) {
            throw new Error("Enter email,name,pass")
        }
        if (pass.length < 6) {
            throw new Error("pass length should be atleast 6 char.")
        }
        //ck already have an account or not
        const existing_user = await UserModel.findOne({ email: email })
        if (existing_user) {
            throw new Error("email is already used,try to login")
        }

        //create the user now
        const salt = await bcrypt.genSalt(5)
        const hashpass = bcrypt.hashSync(pass, salt)
        const newuser = new UserModel({ email: email.toString().trim(), name: name.toString().trim(), pass: hashpass })
        let userDoc = await newuser.save()

        //log in the user
        const expires = moment().add(5, "days").valueOf();
        const token = jwt.sign({ email }, process.env.JWT_SEC, { expiresIn: expires })

        //send token in http cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,//only for browser
            sameSite: 'lax',
            expires: new Date(expires)
        })

        const user = {
            id: userDoc._id,
            email: userDoc.email,
            name: userDoc.name,
            token: token
        }

        res.status(200).json(Response(false, "user created", user))
    } catch (e) {
        res.status(500).json(Response(true, e.message, e))
    }

})


//login
//http://localhost:2727/user/login
router.post('/login', async (req, res) => {
    try {
        const { email, pass } = req.body
        //validate
        if (!email || !pass) {
            throw new Error("Enter email,pass")
        }
        //fetch user from db
        const userDoc = await UserModel.findOne({ email: email })
        if (!userDoc) {
            throw new Error("no user found with this email")
        }
        const ckPass = await bcrypt.compare(pass, userDoc.pass)
        if (!ckPass) {
            throw new Error("Wrong email or password")
        }
        //log in the user
        const expires = moment().add(5, "days").valueOf();
        const token = jwt.sign({ email }, process.env.JWT_SEC, { expiresIn: expires })

        //send token in http cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,//only for browser
            sameSite: 'lax',
            expires: new Date(expires)
        })

        const user = {
            id: userDoc._id,
            email: userDoc.email,
            name: userDoc.name,
            token: token
        }

        res.status(200).json(Response(false, "user logged in", user))

    } catch (e) {
        console.log(e.message)
        res.status(500).json(Response(true, e.message, e))
    }
})

//ck logged in or not
////http://localhost:2727/user/isloggedin
router.get('/isloggedin', (req, res) => {
    try {
        const token = req.cookies.token
        if (!token) {
            throw new Error("Unauthorized Access")
        }
        //token validation
        const { email } = jwt.verify(token, process.env.JWT_SEC)

        res.send({ isloggedin: true, email: email })// logged in
    } catch (e) {
        //remove the old/expire token
        res.cookie("token", "", {
            httpOnly: true,
            secure: true,//only for browser
            sameSite: 'lax',
            expires: new Date(0)
        })
        res.send({ isloggedin: false, email: null })//not logged in
    }
})

//logout
//http:localhost:2727/user/logout
router.get('/logout', (req, res) => {

    res.cookie("token", "", {
        httpOnly: true,
        secure: true,//only for browser
        sameSite: 'lax',
        expires: new Date(0)
    })
    res.status(200).json(Response(false, "user logged out", {}))
})


module.exports = router