const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res) => {
    // Insert the data provided by user during registration
    const user = await User.create({ ...req.body });

    // Invoking function created by instance method on schema to generate the token
    const token = user.createJWT();
    // Giving back response with user_name and token
    res.status(StatusCodes.CREATED).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            password: user.password,
            token
        },
        token
    });
}

const login = async (req, res) => {
    // getting the email & password from user
    const { email, password } = req.body;

    // Checking if user provide above two values or not
    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    // Find the email & check if its exist or not
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError('Invalid Username');
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid Password');
    }

    // Getting the token for the user who provided its credentials
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            password: user.password,
            token
        },
    })
}

const updateUser = async (req, res) => {

    console.log(req.user);
    const { name, email, lastName, location } = req.body;
    if (!name || !email || !lastName || !location) {
        throw new BadRequestError('Please provide all the fields value');
    }

    const user = await User.findOne({ _id: req.user.userId });

    user.name = name;
    user.email = email;
    user.lastName = lastName;
    user.location = location;

    await user.save();

    const token = user.createJWT();
    
    res.status(StatusCodes.OK).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            password: user.password,
            token
        },
    })
}

module.exports = {
    register,
    login,
    updateUser
}