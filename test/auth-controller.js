const expect = require('chai').expect;
const sinon = require('sinon');

const AuthController = require('../controllers/auth');
const User = require('../models/user');
const bcrypt = require('bcrypt');

describe('Auth Controller - Signup', function () {
  this.beforeEach(function () {
    sinon.stub(User, 'findByUsername');
    sinon.stub(User, 'findByEmail');
    sinon.stub(User, 'insert');
    sinon.stub(bcrypt, 'hash');
  });

  it('should forward a 500-code error if accessing db/module fails', async function () {
    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        confirmPassword: 'test',
      },
    };

    let res;
    const next = (x) => {
      res = x;
    };

    User.findByUsername.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
    User.findByUsername.returns(undefined);
    res = null;

    User.findByEmail.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
    User.findByEmail.returns(undefined);
    res = null;

    bcrypt.hash.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
    bcrypt.hash.returns('abc');
    res = null;

    User.insert.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
  });

  it('should forward 422 error if duplicate username or email is entered', async function () {
    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        confirmPassword: 'test',
      },
    };

    let res;
    const next = (x) => {
      res = x;
    };

    User.findByUsername.returns('duplicate');
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 422);
    expect(res).to.have.property('message', 'A user has already registered this username.');
    User.findByUsername.returns(undefined);
    res = null;

    User.findByEmail.returns('duplicate');
    await AuthController.postSignup(req, res, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 422);
    expect(res).to.have.property('message', 'A user has already registered an account with this email address.');
  });

  it('should configure session on successful signup', async function () {
    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        confirmPassword: 'test',
      },
      session: {
        save: () => {},
      },
    };

    User.findByUsername.returns(undefined);
    User.findByEmail.returns(undefined);
    bcrypt.hash.returns('abc');
    User.insert.returns({ id: 1, username: 'tester' });
    await AuthController.postSignup(req, {}, () => {});
    expect(req.session).to.have.property('user');
    expect(req.session.user).to.deep.equal({ id: 1, username: 'tester' });
    expect(req.session.isLoggedIn).to.equal(true);
  });

  this.afterEach(function () {
    User.findByUsername.restore();
    User.findByEmail.restore();
    bcrypt.hash.restore();
    User.insert.restore();
  });
});

describe('Auth Controller - Log in', function () {
  this.beforeEach(function () {
    sinon.stub(User, 'findByEmail');
    sinon.stub(bcrypt, 'compare');
  });

  it('should forward a 500-code error if accessing db/module fails', async function () {
    const req = {
      body: {
        username: 'tester',
        password: 'password',
      },
    };

    let res;
    const next = (err) => {
      res = err;
    };

    User.findByEmail.throws();
    await AuthController.postLogin(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
    User.findByEmail.returns('abc');
    res = null;

    bcrypt.compare.throws();
    await AuthController.postLogin(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 500);
    expect(res).to.have.property('message', 'Something went wrong, please try again.');
  });

  it('should forward a 401 error if login credentials fail authorization', async function () {
    const req = {
      body: {
        username: 'tester',
        password: 'password',
      },
    };

    let res;
    const next = (x) => {
      res = x;
    };

    User.findByEmail.returns(undefined);
    await AuthController.postLogin(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 401);
    expect(res).to.have.property('message', 'Cannot find an account registered to this email address.');
    User.findByEmail.returns('user');
    res = null;

    bcrypt.compare.returns(false);
    await AuthController.postLogin(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('code', 401);
    expect(res).to.have.property('message', 'Invalid password, please try again!');
  });

  it('should configure session on successful signup', async function () {
    const req = {
      body: {
        username: 'tester',
        password: 'password',
      },
      session: {
        save: () => {}
      },
    };

    User.findByEmail.returns({ id: 1, username: 'tester' });
    bcrypt.compare.returns(true);
    await AuthController.postLogin(req);
    expect(req.session).to.have.property('user');
    expect(req.session.user).to.deep.equal({ id: 1, username: 'tester' });
    expect(req.session.isLoggedIn).to.equal(true);
  });

  this.afterEach(function () {
    User.findByEmail.restore();
    bcrypt.compare.restore();
  });
});
