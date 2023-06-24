const express = require('express');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = 'Rashiis@goodgirl'

// Route 1 : Create a User using POST "/api/auth/ceateuser" No login Required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({min : 3}),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password must be at least 5 Characters').isLength({min : 5}),
], async (req, res) =>{
    // If there are errors, return Bad Request and errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({success, errors: errors.array() });
    }
    // Check whether user email already exists
    try {
        let user = await User.findOne({email: req.body.email});
        if(user){
            return res.status(400).json({success, error: "Sorry a user with this Email already exists."})
        }
        const salt = await bcrypt.genSaltSync(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const data = {
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({success, authtoken})
        // res.json(user);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
})

// Route 2 : Create a User Authentication using POST "/api/auth/login" No login Required
router.post('/login', [
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Password cannot be Empty').exists(),
], async (req, res) =>{
    // If there are errors, return Bad Request and errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            res.status(400).json({success, error: 'Please try to Login with Correct Credentials!!'})
        }
        const comparePassword = await bcrypt.compare(password, user.password);
        if(!comparePassword){
            res.status(400).json({success, error: 'Please try to Login with Correct Credentials!!'})
        }
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({success, authtoken})
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
})

// Route 3 : Get LoggedIn User Details using POST "/api/auth/getuser" Login Required
router.post('/getuser', fetchuser, async (req, res) =>{
    try {
        userId = req.user.id
        const user = await User.findById(userId).select('-password');
        res.send(user);
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal server error Occurred')
    }
})

module.exports = router