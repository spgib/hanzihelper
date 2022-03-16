const Deck = require('../models/deck');
const UserDeck = require('../models/user-deck');

exports.getIndex = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/dash');
  }

  res.render('index', { title: '你好' });
};

exports.getDashboard = (req, res, next) => {
  res.render('./dash/dash', {
    title: 'DASH',
    dash: true,
    startWithBackdrop: req.flash('startWithBackdrop'),
    customDeckError: req.flash('customDeckError'),
    errorMessage: req.flash('errorMessage'),
    oldInput: req.flash('oldInput'),
  });
};

exports.postCreateCustomDeck = async (req, res, next) => {
  const { title } = req.body;
  const userId = req.session.user.id;

  let duplicate;
  try {
    duplicate = await Deck.findByTitle(title);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (duplicate !== undefined) {
    req.flash('startWithBackdrop', true);
    req.flash('customDeckError', true);
    req.flash('errorMessage', 'This title is currently unavailable!');
    req.flash('oldInput', { title: title });
    // return res.status(422).render('./dash/dash', {
    //   title: 'DASH',
    //   dash: true,
    //   startWithBackdrop: true,
    //   customDeckError: true,
    //   errorMessage: 'This title is currently unavailable!',
    //   oldInput: { title },
    // });
    return res.status(422).redirect('/dash');
  }

  let deck, userDeck;
  try {
    deck = await Deck.insert(title, userId);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (deck !== undefined) {
    try {
      userDeck = await UserDeck.insert(userId, deck.id);
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  }

  res.redirect('/dash');
};
