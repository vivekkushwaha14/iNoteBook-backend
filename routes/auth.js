const express = require('express');
const User = require('../models/Users')
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

//ROUTE 1 :  create a user using: POST "/api/auth/createUser": no login required

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Add it to backend/.env");
    }

    return process.env.JWT_SECRET;
}

router.post('/createUser', [
    body('name', 'Name length should be 10 to 20 characters').isLength({ min: 2, max: 20 }),
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password length should be 8 to 10 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false
    //If there are error , return bad requests and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    //check whether  the user with this email  exist already
    try {
        let existinguser = await User.findOne({ email: req.body.email })
        if (existinguser) {
            return res.status(400).json({ success, error: "Sorry  a user with this email is already exists" })
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass,
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, getJwtSecret())
        // res.json({ newuser })
        success= true
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
}
)

//ROUTE 2 : Authenticate a user using: POST "/api/auth/login": no login required

router.post('/login', [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'password cannot be blank').exists(),
], async (req, res) => {
    let success = false
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: "please try with correct credentials" });
            success = false;
        }
        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            return res.status(400).json({ success, error: "please try with correct credentials" })
        }

        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, getJwtSecret());
        success = true;
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

//ROUTE 3 : get logged in user detail using: POST "/api/auth/getuser" :login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        userid = req.user.id
        const user = await User.findById(userid).select("-password")
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal server error")
    }

})


module.exports = router
