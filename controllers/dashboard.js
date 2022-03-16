const Deck = require('../models/deck');
const UserDeck = require('../models/user-deck');

exports.getIndex = (req, res, next) => {
  res.render('index', { title: '你好' });
};

exports.getDashboard = (req, res, next) => {
  res.render('./dash/dash', { title: 'DASH', dash: true });
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
    return res.status(422).render('/dash/dash', {
      title: 'DASH',
      dash: true,
      inputError: true,
      customDeckError: true,
      errorMessage: 'This title is currently unavailable!',
      oldInput: { title }
    });
  }

  let deck, userDeck;
  try {
    deck = await Deck.insert(title, userId);
    
  } catch(err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (deck !== undefined) {
    try {
      userDeck = await UserDeck.insert(userId, deck.id);
    } catch(err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  }
  
  res.redirect('/dash');
};
