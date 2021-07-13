const express = require('express')
const router = express.Router()
const Response = require('../models/Response')
const UserModel = require('../models/UserModel')
const jwt = require('jsonwebtoken')

const authMid = (req, res, next) => {
    try {

        const token = req.cookies.token
        console.log("token=", token);
        if (!token) {
            throw new Error("Unauthorized Access")
        }
        //token validation

        const { email } = jwt.verify(token, process.env.JWT_SEC)
        //set user email in request
        req.email = email
        next()
    } catch (e) {
        console.log("error: token: ", e.message);
        res.status(401).json(Response(true, e.message, e))
    }
}

//@private route
router.get('/show-all', authMid, async (req, res) => {
    try {
        const docs = await UserModel.find()
        res.status(200).json(Response(false, "data loaded.. for user: " + req.email, { customers: docs }))
    } catch (e) {
        res.status(500).json(Response(true, e.message, e))
    }
})





module.exports = router