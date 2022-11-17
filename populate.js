require('dotenv').config();

const mockData = require('./mock_date.json');
const Jobs = require('./models/Jobs');
const connectDB = require('./db/connect');

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        console.log('Connected to DB');

        await Jobs.create(mockData);
        console.log('Success, data is populated !!!');

        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

start();