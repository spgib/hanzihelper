const express = require('express');

const dashboardController = require('../controllers/dashboard');
const authCheck = require('../middleware/auth-check');

const router = express.Router();

router.get('/', dashboardController.getIndex);

router.get('/dash', authCheck, dashboardController.getDashboard);

router.post('/dash/custom', authCheck, dashboardController.postCreateCustomDeck);

module.exports = router;