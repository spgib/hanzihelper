const Deck = require('../models/deck');
const UserDeck = require('../models/user-deck');
const HttpError = require('../models/http-error');
const Card = require('../models/card');
const UserCard = require('../models/user-card');

exports.renderIndex = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.redirect('/dash');
  }

  res.status(200).render('index', { title: '你好' });
};

exports.renderDashboard = async (req, res, next) => {
  const userId = req.session.user.id;
  
  let decks;
  try {
    decks = await UserDeck.getUserDecksInfo(userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }
  
  for (let deck of decks) {
    let cards;
    try {
      cards = await Card.findAllFromDeckId(deck.id);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    deck.cards = cards;
  }

  res.status(200).render('./dash/dash', {
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

  try {
    await Deck.insert(title, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
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

  if (deck.creatorId !== userId) {
    const error = new HttpError(
      'User does not have permission to modify this deck.',
      401
    );
    return next(error);
  }

  let duplicate;
  try {
    const deckCards = await Card.findAllFromDeckId(deckId);
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

  let card;
  try {
    card = await Card.insert(hanzi, pinyin, meaning, deckId, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (card.id) {
    return res.status(201).json({ message: 'Card created!' });
  }
};

exports.getLearnDeck = async (req, res, next) => {
  const userId = req.session.user.id;
  const deckId = req.params.deckId;

  // Ensure that the user has a relationship to the deck
  let userDeck;
  try {
    userDeck = await UserDeck.findByUserAndDeck(userId, deckId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (userDeck === undefined) {
    const error = new HttpError(
      'You are not authorized to review this deck. Please add this deck to your decks in order to continue.',
      401
    );
    return next(error);
  }

  // Get all cards that the user has already learned
  let userCards;
  try {
    userCards = await UserCard.getByDeckAndUser(deckId, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }
  
  // Establish card object to be sent to the view
  let cards = {
    rev: [],
    probation: [],
    remaining: [],
  };

  // Prime the deck with unlearned cards if needed; if not, sort user cards into buckets
  if (userCards.length === 0) {
    let newCards;
    try {
      newCards = await Card.getNextCards(deckId, 10, 0);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    newCards.forEach(card => {
      const newCard = {...card};
      newCard.probation = false;
      newCard.probationTimer = null;
      cards.remaining.push(newCard);
    });
  } else {
    userCards.forEach(card => {
      const data = {
        id: card.cardId,
        hanzi: card.hanzi,
        pinyin: card.pinyin,
        meaning: card.meaning,
        probation: card.probation,
        probationTimer: card.probationTimer
      };

      if (card.probation) {
        cards.probation.push(data);
      } else if (new Date(card.nextReview) - Date.now() <= 0) {
        cards.rev.push(data);
      }
    });
  }
  
  return res.status(201).render('dash/learn/learn', {
    title: 'Learn Cards!',
    learn: true,
    deckId: deckId,
    cards: JSON.stringify(cards),
  });
};

exports.patchProbation = async (req, res, next) => {
  const userId = req.session.user.id;
  const { cardId } = req.body;
  let probationTime = 10;

  // Check to see if userCard exists;
  let userCard;
  try {
    userCard = await UserCard.checkIfUserCard(cardId, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  // If no userCard, create one, and prep probationTime
  if (userCard === undefined) {
    try {
      userCard = await UserCard.insert(userId, cardId);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    probationTime = 1;
  }

  // If userCard exists but card has never been learned, remove probation (if applicable) and prep probationTime
  if (userCard && userCard.firstLearned === null) {
    if (userCard.probation) {
      try {
        await UserCard.removeProbation(userCard.id);
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, please try again.',
          500
        );
        return next(error);
      }
    }

    probationTime = 1;
  }

  //If userCard exists and card has been learned, add probation and reset nextRevInterval
  if (userCard && userCard.firstLearned) {
    if (!userCard.probation) {
      try {
        await UserCard.addProbationAndResetInterval(userCard.id);
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, please try again.',
          500
        );
        return next(error);
      }
    }
  }

  try {
    await UserCard.setProbationTimer(userCard.id, `${probationTime} M`);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let card;
  try {
    card = await UserCard.getByCardAndUser(cardId, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  res.status(200).json({ message: 'Updated card probation!', card });
};

exports.patchSuccess = async (req, res, next) => {
  const userId = req.session.user.id;
  const { cardId } = req.body;
  let responseCard;

  // Check to see if userCard exists
  let userCard;
  try {
    userCard = await UserCard.checkIfUserCard(cardId, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  // If no userCard, create one and set probation and probation timer
  if (userCard === undefined) {
    try {
      const { id } = await UserCard.insert(userId, cardId);
      responseCard = await UserCard.setProbationAndTimer(id, '10 M');
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  // If userCard AND no firstlearned AND no probation marker, set probation and probation timer
  if (userCard && !userCard.firstLearned && !userCard.probation) {
    try {
      responseCard = await UserCard.setProbationAndTimer(userCard.id, '10 M');
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  // If userCard and probation marker, reset probation marker and set lastrev, nextrev, and revinterval
  if (userCard && userCard.probation) {
    try {
      if (!userCard.firstLearned) {
        await UserCard.addFirstLearned(userCard.id);
      }
      const newLearnInterval = userCard.nextRevInterval * 2;
      responseCard = await UserCard.setSuccessAfterProbation(
        userCard.id,
        userCard.nextRevInterval + ' D',
        newLearnInterval
      );
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  // If userCard but no probation marker, set lastrev, nextrev, and revinterval
  if (userCard && userCard.firstLearned && !userCard.probation) {
    try {
      const newLearnInterval = userCard.nextRevInterval * 2;
      responseCard = await UserCard.setSuccessAfterProbation(
        userCard.id,
        userCard.nextRevInterval + ' D',
        newLearnInterval
      );
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  // Join data from Card and respond to front-end
  try {
    responseCard = await UserCard.getByCardAndUser(
      responseCard.cardId,
      responseCard.userId
    );
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  res
    .status(200)
    .json({ message: 'Successfully reviewed card!', card: responseCard });
};
