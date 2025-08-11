const express = require('express');
const router = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const { version } = require('../../package.json');

// Get Git commit SHA from environment variable (set during deployment)
const getCommitSHA = () => process.env.COMMIT_SHA || 'development';

/**
 * @route GET /api/health
 * @desc Get API health status
 * @access Public
 */
router.get('/', asyncHandler(async (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version,
        commitSHA: getCommitSHA(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: {
            status: req.app.get('mongoStatus') || 'unknown'
        }
    };

    res.json(health);
}));

module.exports = router;
