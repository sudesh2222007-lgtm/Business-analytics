const express = require('express');
const router = express.Router();

const { getExecutiveSummary } = require('../controllers/executiveController');
const { getSalesAnalysis } = require('../controllers/salesController');
const { getCustomerAnalytics } = require('../controllers/customerController');
const { getProfitabilityAnalysis } = require('../controllers/profitabilityController');
const { getFilterOptions } = require('../controllers/filtersController');

router.get('/executive', getExecutiveSummary);
router.get('/sales', getSalesAnalysis);
router.get('/customers', getCustomerAnalytics);
router.get('/profitability', getProfitabilityAnalysis);
router.get('/filters', getFilterOptions);

module.exports = router;
