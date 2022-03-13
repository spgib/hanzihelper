const AuthRepo = require('../db/repos/auth-repo');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res, next) => {
  res
    .status(200)
    .render('./auth/login', {
      title: 'Log In',
      errors: false,
      errorMessage: null,
      oldInput: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    });
};

exports.getSignup = (req, res, next) => {
  res
    .status(200)
    .render('./auth/signup', {
      title: 'Sign Up',
      errors: false,
      errorMessage: null,
      oldInput: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    });
};

exports.postSignup = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  let existingUsername;
  try {
    existingUsername = await AuthRepo.findUserByUsername(username);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (existingUsername !== undefined) {
    res.status(422).render('./auth/signup', {
      title: 'Sign Up',
      errors: true,
      errorMessage: 'A user has already registered this username.',
      oldInput: {
        username,
        email,
        password,
        confirmPassword
      }
    });
  }

  let existingEmail;
  try {
    existingEmail = await AuthRepo.findUserByEmail(email);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (existingEmail !== undefined) {
    res.status(422).render('./auth/signup', {
      title: 'Sign Up',
      errors: true,
      errorMessage: 'A user has already registered an account with this email address.',
      oldInput: {
        username,
        email,
        password,
        confirmPassword
      }
    });
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  let user;
  try {
    user = await AuthRepo.insertUser(username, email, hashedPassword);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (user) {
    req.session.user = user;
    return req.session.save(err => {
      console.log(err);
      res.redirect('/dash');
    });
  }
};
