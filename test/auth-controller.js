const expect = require('chai').expect;
const sinon = require('sinon');

const AuthController = require('../controllers/auth');
const AuthRepo = require('../db/repos/auth-repo');

describe('Auth Controller - Signup', function () {
  it('should forward a 500-code error if accessing database fails', async function () {
    sinon.stub(AuthRepo, 'findUserByUsername');
    AuthRepo.findUserByUsername.throws();

    const req = {
      body: {
        username: 'test',
      },
    };

    let res;
    const next = (x) => {
      res = x;
    };

    await AuthController.postSignup(req, {}, next);
    expect(res).to.be.an('error');
    expect(res).to.have.property('httpStatusCode', 500);
    AuthRepo.findUserByUsername.restore();
  });
});
