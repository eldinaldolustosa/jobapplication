const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/job-applications', require('./jobApplicationRoutes'));
router.use('/linkedin', require('./linkedinRoutes'));

module.exports = router;
