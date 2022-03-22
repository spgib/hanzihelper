const Deck = require('../models/deck');
const UserDeck = require('../models/user-deck');
const HttpError = require('../models/http-error');

exports.getIndex = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/dash');
  }

  res.render('index', { title: '你好' });
};

exports.getDashboard = async (req, res, next) => {
  const userId = req.session.user.id;

  let decks;
  try {
    decks = await UserDeck.findByUser(userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again', 500);
    return next(error);
  }
  
  res.render('./dash/dash', {
    title: 'DASH',
    dash: true,
    noDecks: decks.length === 0,
    decks: decks,
    withTemplates: true,
    templates: ['custom-deck'],
    helpers: {
      temp(x) { return 'templates/' + x }
    }
  });
};

exports.postCreateCustomDeck = async (req, res, next) => {
  const { title } = req.body;
  const userId = req.session.user.id;

  let duplicate;
  try {
    duplicate = await Deck.findByTitle(title);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (duplicate !== undefined) {
    const error = new HttpError('A deck already exists with this title!', 422);
    return next(error);
  }

  let deck, userDeck;
  try {
    deck = await Deck.insert(title, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (deck !== undefined) {
    try {
      userDeck = await UserDeck.insert(userId, deck.id);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }
  res.status(201).json({ message: 'Deck successfully created!' });
};
