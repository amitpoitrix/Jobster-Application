// const { CustomAPIError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    let customError = {
        // Set default
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || 'Something went wrong try again later'
    }

    // if (err instanceof CustomAPIError) {
    //     res.status(err.statusCode).json({ msg: err.message });
    // }

    // Custom Validation Error - If value is not provided
    if (err.name === 'ValidationError') {
        customError.statusCode = StatusCodes.BAD_REQUEST;  // 400
        customError.msg = Object.values(err.errors)
            .map((item) => item.message)
            .join(',');
    }

    // Custom Error for Duplicacy
    if (err.code && err.code === 11000) {
        customError.statusCode = StatusCodes.BAD_REQUEST;   // 400
        customError.msg = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another value`;
    }

    // Custom Cast Error - if Job Id provided is in wrong format
    if(err.name === 'CastError'){
        customError.statusCode = StatusCodes.NOT_FOUND; // 404
        customError.msg = `No record found with Job ID : ${err.value}`;
    }

    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err });
    return res.status(customError.statusCode).json({ msg: customError.msg });
}

module.exports = errorHandlerMiddleware;