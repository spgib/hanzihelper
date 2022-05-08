const express = require('express');

const dashboardController = require('../controllers/dashboard');
const authCheck = require('../middleware/auth-check');

const router = express.Router();

router.get('/', dashboardController.renderIndex);

router.get('/dash', authCheck, dashboardController.renderDashboard);

router.get('/learn/deck/:deckId', authCheck, dashboardController.renderLearnDeck);

router.get('/learn/next/:deckId', authCheck, dashboardController.getNextCards);

router.post('/dash/deck/custom', authCheck, dashboardController.postCreateCustomDeck);

router.post('/dash/deck/addCard', authCheck, dashboardController.postAddCard);

router.patch('/dash/deck/edit', authCheck, dashboardController.patchDeck);

router.patch('/learn/fail', authCheck, dashboardController.patchProbation);

router.patch('/learn/success', authCheck, dashboardController.patchSuccess);

router.delete('/deck/:deckTitle', authCheck, dashboardController.deleteDeck);

module.exports = router;