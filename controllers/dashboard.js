const Deck = require('../models/deck');
const UserDeck = require('../models/user-deck');
const HttpError = require('../models/http-error');
const Card = require('../models/card');
const UserCard = require('../models/user-card');

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
    templates: ['custom-deck', 'add-card'],
    helpers: {
      temp(x) {
        return 'templates/' + x;
      },
    },
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

exports.postAddCard = async (req, res, next) => {
  const { deckId, hanzi, pinyin, meaning } = req.body;
  const userId = req.session.user.id;

  let deck;
  try {
    deck = await Deck.findById(deckId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (deck === undefined) {
    const error = new HttpError('Deck could not be found.', 422);
    return next(error);
  }

  // Check whether user has admin rights on deck
  if (deck.creatorId !== userId) {
    const error = new HttpError(
      'User does not have permission to modify this deck.',
      401
    );
    return next(error);
  }

  // Check whether there is a duplicate card already in deck
  let duplicate;
  try {
    const deckCards = await Card.findCardsFromDeckId(deckId);
    duplicate = deckCards.filter((card) => card.hanzi === hanzi);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }
  if (duplicate.length !== 0) {
    const error = new HttpError(
      'A card for this hanzi already exists in this deck.',
      403
    );
    return next(error);
  }

  // Create card/user_card entries
  let card;
  try {
    card = await Card.insert(hanzi, pinyin, meaning, deck.id, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (!card.id) {
    const error = new HttpError('Failed to save card, please try again.', 500);
    return next(error);
  }

  return res.status(201).json({ message: 'Card created!' });
};
