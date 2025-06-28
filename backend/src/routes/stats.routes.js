const express = require('express');
const statsController = require('../controllers/stats.controller');

const router = express.Router();

// Public routes
router.get('/summary', statsController.getSummaryStats);
router.get('/by-category', statsController.getStatsByCategory);
router.get('/time-series', statsController.getTimeSeriesData);
router.get('/map-data', statsController.getMapData);

module.exports = router; 