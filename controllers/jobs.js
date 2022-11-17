const Job = require('../models/Jobs');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const mongoose = require('mongoose');
const moment = require('moment');

const getAllJobs = async (req, res) => {
    // console.log(req.query);
    const { status, jobType, sort, search } = req.query;

    const queryObject = {
        createdBy: req.user.userId
    }

    // Search Conditions - that limits the amount of result
    // 1. For getting the search results as soon as we starts typing
    if (search) {
        queryObject.position = { $regex: search, $options: 'i' }
    }

    // 2. For getting the search results based on jobType
    if (jobType && jobType !== 'all') {
        queryObject.jobType = jobType;
    }

    // 3. For getting the search results based on status
    if (status && status !== 'all') {
        queryObject.status = status;
    }


    // Now after limiting search condition we'll find that object and store in let variable
    let result = Job.find(queryObject);

    // Sort Condition over result
    if (sort === 'latest') {
        result = result.sort('-createdAt'); // Descending
    }
    if (sort === 'oldest') {
        result = result.sort('createdAt'); // Ascending
    }
    if (sort === 'a-z') {
        result = result.sort('position');
    }
    if (sort === 'z-a') {
        result = result.sort('-position');
    }

    // Pagination Process
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    result = result.skip(skip).limit(limit);

    // fetching all the jobs created by user
    const jobs = await result;

    // As pagintaion setup is done on front-end so here we're just providing the values
    const totalJobs = await Job.countDocuments(queryObject);
    const numOfPages = Math.ceil(totalJobs / limit);

    // Sending response
    res.status(StatusCodes.OK).json({
        jobs,
        totalJobs,
        numOfPages
    });
}

const getJob = async (req, res) => {
    // Fetch the userId from auth middleware(req.user.userId) & jobId from params(req.params.id)
    const {
        user: { userId },
        params: { id: jobId }
    } = req;

    // Now getting the job based on jobId & userId
    const job = await Job.findOne({
        _id: jobId,
        createdBy: userId
    });

    if (!job) {
        throw new NotFoundError(`Job doesnot exist with Job ID: ${jobId}`);
    }

    // Sending response
    res.status(StatusCodes.OK).json({ job });
}

const createJob = async (req, res) => {
    // Getting the createdBy from auth middleware placed in app.js while calling jobsRouter
    req.body.createdBy = req.user.userId;
    // Now we'll create the job after getting the createdBy value
    const job = await Job.create(req.body);
    // Sending response
    res.status(StatusCodes.CREATED).json({ job });
}

const updateJob = async (req, res) => {
    const {
        body: { company, position },
        user: { userId },
        params: { id: jobId }
    } = req;

    if (!company || !position) {
        throw new BadRequestError(`Company and Position cannot be empty`);
    }

    const job = await Job.findOneAndUpdate(
        {
            _id: jobId,
            createdBy: userId
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    )

    if (!job) {
        throw new NotFoundError(`No job exist with Job ID ${jobId}`);
    }

    res.status(StatusCodes.OK).json({ job });
}

const deleteJob = async (req, res) => {
    const {
        user: { userId },
        params: { id: jobId }
    } = req;

    const job = await Job.findByIdAndRemove({
        _id: jobId,
        createdBy: userId
    });

    if (!job) {
        throw new NotFoundError(`Job doesnot exist with Job ID ${jobId}`);
    }

    res.status(StatusCodes.OK).send(`Job with Job ID ${jobId} is deleted`);
}

const showStats = async (req, res) => {
    // Aggregating the jobs using mongoose aggregate pipeline
    // Data related to Stats
    let stats = await Job.aggregate([
        { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },    // becoz userId is in string
        { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Refactoring the code acc. to frontend using reduce()
    stats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});

    const defaultStats = {
        pending: stats.pending || 0,
        declined: stats.declined || 0,
        interview: stats.interview || 0
    }

    // Data related to monthlyApplications
    let monthlyApplications = await Job.aggregate([
        { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
        {
            $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },  // -1 means descending
        { $limit: 6 }
    ]);

    // Refactoring acc. to frontend
    monthlyApplications = monthlyApplications.map((item) => {
        const {
            _id: { year, month },
            count
        } = item;

        const date = moment().month(month - 1).year(year).format('MMM Y');

        return {date, count};
    }).reverse();

    res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications })
}

module.exports = {
    getAllJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    showStats
}