const expect = require('chai').expect;
const sinon = require('sinon');

const AuthController = require('../controllers/auth');
const AuthRepo = require('../db/repos/auth-repo');
const bcrypt = require('bcrypt');

describe('Auth Controller - Signup', function () {
  beforeEach(function () {
    sinon.stub(AuthRepo, 'findUserByUsername');
    sinon.stub(AuthRepo, 'findUserByEmail');
    sinon.stub(AuthRepo, 'insertUser');
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

    AuthRepo.findUserByUsername.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('httpStatusCode', 500);
    AuthRepo.findUserByUsername.returns(undefined);
    res = null;

    AuthRepo.findUserByEmail.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('httpStatusCode', 500);
    AuthRepo.findUserByEmail.returns(undefined);
    res = null;

    bcrypt.hash.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('httpStatusCode', 500);
    bcrypt.hash.returns('abc');
    res = null;

    AuthRepo.insertUser.throws();
    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('httpStatusCode', 500);
  });

  it('should re-render page with 422 error and message if duplicate username or email is entered', async function () {
    const req = {
      body: {
        username: 'test',
        email: 'test@test.com',
        password: 'test',
        confirmPassword: 'test',
      },
    };

    let resStatusCode;
    const res = {
      status: (code) => {
        resStatusCode = code;
        return res;
      },
      render: () => {},
    };

    AuthRepo.findUserByUsername.returns('duplicate');
    await AuthController.postSignup(req, res, () => {});
    expect(resStatusCode).to.equal(422);
    AuthRepo.findUserByUsername.returns(undefined);
    resStatusCode = null;

    AuthRepo.findUserByEmail.returns('duplicate');
    await AuthController.postSignup(req, res, () => {});
    expect(resStatusCode).to.equal(422);
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

    AuthRepo.findUserByUsername.returns(undefined);
    AuthRepo.findUserByEmail.returns(undefined);
    bcrypt.hash.returns('abc');
    AuthRepo.insertUser.returns('user');
    await AuthController.postSignup(req, {}, () => {});
    expect(req.session).to.have.property('user');
    expect(req.session.user).to.equal('user');
    expect(req.session.isLoggedIn).to.equal(true);
  });

  afterEach(function () {
    AuthRepo.findUserByUsername.restore();
    AuthRepo.findUserByEmail.restore();
    bcrypt.hash.restore();
    AuthRepo.insertUser.restore();
  });
});
