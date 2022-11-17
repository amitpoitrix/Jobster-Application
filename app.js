require('dotenv').config();
require('express-async-errors');

// Extra Security packages
const helmet = require('helmet');
const xss = require('xss-clean');

const path = require('path');
const express = require('express');
const app = express();

// Importing connectDB
const connectDB = require('./db/connect');

// Importing Auth middleware
const authenticateUser = require('./middleware/authentication');

// Importing Routes 
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// Importing Error Handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');


// Middleware
app.use(express.static(path.resolve(__dirname, './client/build'))); // For serving the static files from client folder
app.use(express.json());
app.use(helmet());
app.use(xss());

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter);  // Passing middleware as we want to protect all the job routes

// serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
})

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


const port = process.env.PORT || 3000;
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log(`Connected to DB`);
        app.listen(port, () => {
            console.log(`Server is running at Port ${port}...`);
        })
    } catch (error) {
        console.log(error);
    }
}

start();