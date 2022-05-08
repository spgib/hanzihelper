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
    let data;
    try {
      data = await UserDeck.getDeckCardsInfo(userId, deck.id);
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    const { revisionCards, refreshCards, unlearnedCards, totalCards } = data;
    deck.revisionCards = revisionCards;
    deck.refreshCards = refreshCards;
    deck.unlearnedCards = unlearnedCards;
    deck.totalCards = totalCards;
  }

  res.status(200).render('./dash/dash', {
    title: 'DASH',
    dash: true,
    noDecks: decks.length === 0,
    decks: decks,
    withTemplates: true,
    templates: ['custom-deck', 'add-card', 'deck-item', 'deck-info', 'delete-deck', 'edit-deck'],
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

  let deck;
  try {
    deck = await Deck.insert(title, userId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  res.status(201).json({ message: 'Deck successfully created!', deck });
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

exports.renderLearnDeck = async (req, res, next) => {
  const userId = req.session.user.id;
  const deckId = req.params.deckId;

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

  let deckCardsInfo;
  try {
    deckCardsInfo = await UserDeck.getDeckCardsInfo(userId, deckId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let userCards;
  try {
    userCards = await UserCard.findByUserAndDeck(userId, deckId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let cards = {
    review: [],
    probation: [],
    remaining: [],
  };

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

    newCards.forEach((card) => {
      const newCard = { ...card };
      newCard.probation = false;
      newCard.probationTimer = null;
      cards.remaining.push(newCard);
    });
  } else {
    userCards.forEach((userCard) => {
      const card = {
        id: userCard.cardId,
        hanzi: userCard.hanzi,
        pinyin: userCard.pinyin,
        meaning: userCard.meaning,
        probation: userCard.probation,
        probationTimer: userCard.probationTimer,
      };

      if (userCard.probation) {
        cards.probation.push(card);
      } else if (new Date(userCard.nextReview) - Date.now() <= 0) {
        cards.review.push(card);
      }
    });

    if (cards.review.length === 0 && cards.probation.length === 0) {
      let newCards;
      try {
        newCards = await Card.getNextCards(deckId, 10, userCards.length);
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, please try again.',
          500
        );
        return next(error);
      }

      newCards.forEach((card) => {
        const newCard = { ...card };
        newCard.probation = false;
        newCard.probationTimer = null;
        cards.remaining.push(newCard);
      });
    }
  }

  return res.status(200).render('dash/learn/learn', {
    title: 'Learn Cards!',
    learn: true,
    deckId: deckId,
    info: deckCardsInfo,
    cards: JSON.stringify(cards),
  });
};

exports.patchProbation = async (req, res, next) => {
  const userId = req.session.user.id;
  const { cardId } = req.body;
  let probationTime = 10;
  let lastStack;

  let userCard;
  try {
    userCard = await UserCard.isUserCard(userId, cardId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (userCard === undefined) {
    try {
      userCard = await UserCard.insert(userId, cardId);
      lastStack = 'fresh';
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    probationTime = 1;
  }

  if (userCard && userCard.firstLearned === null) {
    lastStack = 'new';
    if (userCard.probation) {
      try {
        await UserCard.removeProbation(userCard.id);
        lastStack = 'new+';
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

  if (userCard && userCard.firstLearned) {
    lastStack = 'revise';
    if (!userCard.probation) {
      try {
        await UserCard.addProbationAndResetInterval(userCard.id);
        lastStack = 'refresh';
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
    card = await UserCard.findByUserAndCard(userId, cardId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (card) {
    return res
      .status(200)
      .json({ message: 'Updated card probation!', card, lastStack });
  }
};

exports.patchSuccess = async (req, res, next) => {
  const userId = req.session.user.id;
  const { cardId } = req.body;
  let card, lastStack;

  let userCard;
  try {
    userCard = await UserCard.isUserCard(userId, cardId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (userCard === undefined) {
    try {
      const { id } = await UserCard.insert(userId, cardId);
      card = await UserCard.setProbationAndTimer(id, '10 M');
      lastStack = 'new';
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  if (userCard && !userCard.firstLearned && !userCard.probation) {
    try {
      card = await UserCard.setProbationAndTimer(userCard.id, '10 M');
      lastStack = 'revise';
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  if (userCard && userCard.probation) {
    try {
      if (!userCard.firstLearned) {
        await UserCard.addFirstLearned(userCard.id);
      }
      const newLearnInterval = userCard.nextRevInterval * 2;
      card = await UserCard.setSuccess(
        userCard.id,
        userCard.nextRevInterval + ' D',
        newLearnInterval
      );
      lastStack = 'revise';
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  if (userCard && userCard.firstLearned && !userCard.probation) {
    try {
      const newLearnInterval = userCard.nextRevInterval * 2;
      card = await UserCard.setSuccess(
        userCard.id,
        userCard.nextRevInterval + ' D',
        newLearnInterval
      );
      lastStack = 'refresh';
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }
  }

  try {
    card = await UserCard.findByUserAndCard(card.userId, card.cardId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (card) {
    return res
      .status(200)
      .json({ message: 'Successfully reviewed card!', card, lastStack });
  }
};

exports.getNextCards = async (req, res, next) => {
  const userId = req.session.user.id;
  const deckId = req.params.deckId;

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

  let userCards;
  try {
    userCards = await UserCard.findByUserAndDeck(userId, deckId);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let nextCards;
  try {
    nextCards = await Card.getNextCards(deckId, 20, userCards.length);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  nextCards.forEach((card) => {
    card.probation = false;
    card.probationTimer = null;
  });

  return res
    .status(200)
    .json({ message: 'Successfully fetched more cards!', cards: nextCards });
};

exports.deleteDeck = async (req, res, next) => {
  const userId = req.session.user.id;
  const deckTitle = req.params.deckTitle;

  let deck;
  try {
    deck = await Deck.findByTitle(deckTitle);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let message;
  if (deck.creatorId === userId) {
    try {
      await Deck.delete(deck.id);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    message = 'Deck deleted!';
  } else {
    let userDeck;
    try {
      userDeck = await UserDeck.findByUserAndDeck(userId, deck.id);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    if (userDeck === undefined) {
      const error = new HttpError(
        'This deck is not associated with your account and cannot be deleted.',
        401
      );
      return next(error);
    }

    try {
      await UserDeck.delete(userDeck.id);
    } catch (err) {
      const error = new HttpError(
        'Something went wrong, please try again.',
        500
      );
      return next(error);
    }

    message = 'User deck deleted!';
  }

  return res.status(200).json({ message });
};

exports.patchDeck = async (req, res, next) => {};
