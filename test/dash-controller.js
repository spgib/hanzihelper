const expect = require('chai').expect;
const sinon = require('sinon');

const DashController = require('../controllers/dashboard');
const Card = require('../models/card');
const Deck = require('../models/deck');
const User = require('../models/user');
const UserDeck = require('../models/user-deck');

describe('Dash Controller - Create Custom Deck', function () {
  this.beforeEach(function () {
    sinon.stub(Deck, 'findByTitle');
  });

  this.afterEach(function () {
    Deck.findByTitle.restore();
  });

  it('should forward a 500 error if db fails', async function () {
    sinon.stub(Deck, 'insert');
    let nextValue;

    const req = {
      body: {
        title: 'test',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    const next = (x) => {
      nextValue = x;
    };

    Deck.findByTitle.throws();
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 500);
    expect(nextValue).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    nextValue = null;

    Deck.findByTitle.returns(undefined);
    Deck.insert.throws();
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 500);
    expect(nextValue).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    nextValue = null;

    Deck.insert.restore();
  });

  it('should forward a 422 error if there is an existing deck with that title', async function () {
    let nextValue;

    const req = {
      body: {
        title: 'test',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    const next = (x) => {
      nextValue = x;
    };

    Deck.findByTitle.returns('duplicate');
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 422);
    expect(nextValue).to.have.property(
      'message',
      'A deck already exists with this title!'
    );
  });

  it('should forward a 201 code and a success message on deck creation', async function () {
    sinon.stub(Deck, 'insert');

    const req = {
      body: {
        title: 'test',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    let code, message;
    const res = {
      status: (x) => {
        code = x;
        return res;
      },
      json: (x) => {
        message = x;
      },
    };

    Deck.findByTitle.returns(undefined);
    Deck.insert.returns('success');
    await DashController.postCreateCustomDeck(req, res, () => {});
    expect(code).to.equal(201);
    expect(message).to.have.property('message', 'Deck successfully created!');

    Deck.insert.restore();
  });
});

describe('Dash Controller - postAddCard', function () {
  this.beforeEach(function () {
    sinon.stub(Deck, 'findById');
  });

  this.afterEach(function () {
    Deck.findById.restore();
  });

  it('should forward a 500-code error if db fails', async function () {
    sinon.stub(Card, 'findAllFromDeckId');
    sinon.stub(Card, 'insert');

    const req = {
      body: {
        deckId: 1,
        hanzi: '一',
        pinyin: 'yī',
        meaning: 'one',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    let nextValue;
    const next = (x) => {
      nextValue = x;
    };

    Deck.findById.throws();
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 500);
    expect(nextValue).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    nextValue = null;

    const deck = { creatorId: 1 };
    Deck.findById.returns(deck);
    Card.findAllFromDeckId.throws();
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 500);
    expect(nextValue).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    nextValue = null;

    const cards = [{ hanzi: 'test' }];
    Card.findAllFromDeckId.returns(cards);
    Card.insert.throws();
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 500);
    expect(nextValue).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );

    Card.findAllFromDeckId.restore();
    Card.insert.restore();
  });

  it('should forward error codes if deck cannot be found or if user does not have permission to modify deck', async function () {
    const req = {
      body: {
        deckId: 1,
        hanzi: '一',
        pinyin: 'yī',
        meaning: 'one',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    let nextValue;
    const next = (x) => {
      nextValue = x;
    };

    Deck.findById.returns(undefined);
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 422);
    expect(nextValue).to.have.property('message', 'Deck could not be found.');
    nextValue = null;

    const deck = { creatorId: 2 };
    Deck.findById.returns(deck);
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 401);
    expect(nextValue).to.have.property(
      'message',
      'User does not have permission to modify this deck.'
    );
  });

  it('should forward 403 error code if a card with the same hanzi is found in the deck', async function () {
    sinon.stub(Card, 'findAllFromDeckId');

    const req = {
      body: {
        deckId: 1,
        hanzi: '一',
        pinyin: 'yī',
        meaning: 'one',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    let nextValue;
    const next = (x) => {
      nextValue = x;
    };

    const deck = { creatorId: 1 };
    Deck.findById.returns(deck);
    const cards = [{ hanzi: '一' }];
    Card.findAllFromDeckId.returns(cards);
    await DashController.postAddCard(req, {}, next);
    expect(nextValue).to.be.an('error');
    expect(nextValue).to.have.property('code', 403);
    expect(nextValue).to.have.property(
      'message',
      'A card for this hanzi already exists in this deck.'
    );

    Card.findAllFromDeckId.restore();
  });

  it('should forward a 201 code and a success message on card creation', async function () {
    sinon.stub(Card, 'findAllFromDeckId');
    sinon.stub(Card, 'insert');

    const req = {
      body: {
        deckId: 1,
        hanzi: '一',
        pinyin: 'yī',
        meaning: 'one',
      },
      session: {
        user: {
          id: 1,
        },
      },
    };

    let code, message;
    const res = {
      status: (x) => {
        code = x;
        return res;
      },
      json: (x) => {
        message = x;
      },
    };

    const deck = { creatorId: 1 };
    Deck.findById.returns(deck);
    Card.findAllFromDeckId.returns([]);
    Card.insert.returns({ id: 1 });
    await DashController.postAddCard(req, res, () => {});
    expect(code).to.equal(201);
    expect(message).to.have.property('message', 'Card created!');

    Card.findAllFromDeckId.restore();
    Card.insert.restore();
  });
});
