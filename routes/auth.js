const express = require('express');
const router = express.Router();
// Importing Authentication & Test User middleware
const authenticateUser = require('../middleware/authentication');
const testUser = require('../middleware/testUser');
// Importing controller
const { login, register, updateUser } = require('../controllers/auth');
// Importing express-rate-limit to limit the no. of user to login/register within specific time
const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
    windowMs: 60 * 15 * 1000,
    max: 10,
    message: {
        msg: 'Too many request from this IP, please try again after 15 minutes'
    }
})

router.post('/register', apiLimiter, register);
router.post('/login', apiLimiter, login);
router.patch('/updateUser', authenticateUser, testUser, updateUser);

module.exports = router;