const expect = require('chai').expect;
const sinon = require('sinon');

const DashController = require('../controllers/dashboard');
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
    sinon.stub(UserDeck, 'insert');

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

    let res;
    const next = (x) => {
      res = x;
    };

    Deck.findByTitle.throws();
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    res = null;

    Deck.findByTitle.returns(undefined);
    Deck.insert.throws();
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );
    res = null;

    Deck.insert.returns('success');
    UserDeck.insert.throws();
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property(
      'message',
      'Something went wrong, please try again.'
    );

    Deck.insert.restore();
    UserDeck.insert.restore();
  });

  it('should forward a 422 error if there is an existing deck with that title', async function () {
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

    let res;
    const next = (x) => {
      res = x;
    };

    Deck.findByTitle.returns('duplicate');
    await DashController.postCreateCustomDeck(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 422);
    expect(res).to.have.property(
      'message',
      'A deck already exists with this title!'
    );
  });

  it('should forward a 201 code and a success message on deck creation', async function () {
    sinon.stub(Deck, 'insert');
    sinon.stub(UserDeck, 'insert');

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
    UserDeck.insert.returns('success');
    await DashController.postCreateCustomDeck(req, res, () => {});
    expect(code).to.equal(201);
    expect(message).to.have.property('message', 'Deck successfully created!');

    Deck.insert.restore();
    UserDeck.insert.restore();
  });
});
