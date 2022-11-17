const express = require('express');
const router = express.Router();
// Importing Test User Middleware
const testUser = require('../middleware/testUser');
// Importing controller
// const { register } = require('../controllers/auth');
const { getAllJobs, getJob, createJob, updateJob, deleteJob, showStats } = require('../controllers/jobs');

router.route('/')
    .post(testUser, createJob)
    .get(getAllJobs);

router.route('/stats').get(showStats);

router.route('/:id')
    .get(getJob)
    .delete(testUser, deleteJob)
    .patch(testUser, updateJob);

module.exports = router;