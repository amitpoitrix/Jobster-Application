const { StatusCodes } = require('http-status-codes');

const notFound = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).send('Route doesnot exist');
    next;
}

module.exports = notFound;