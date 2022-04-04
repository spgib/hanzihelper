const express = require('express');

const dashboardController = require('../controllers/dashboard');
const authCheck = require('../middleware/auth-check');

const router = express.Router();

router.get('/', dashboardController.getIndex);

router.get('/dash', authCheck, dashboardController.getDashboard);

router.get('/dash/learn/deck/:deckId', authCheck, dashboardController.getLearnDeck);

// router.get('/dash/cards/:deckTitle', authCheck, dashboardController.getDeckCards);

router.post('/dash/custom', authCheck, dashboardController.postCreateCustomDeck);

router.post('/dash/addCard', authCheck, dashboardController.postAddCard);

router.patch('/dash/learn/prob', authCheck, dashboardController.patchProbation);

router.patch('/dash/learn/success', authCheck, dashboardController.patchSuccess);

module.exports = router;