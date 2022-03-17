const User = require('../models/user');
const HttpError = require('../models/http-error');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res, next) => {
  res.status(200).render('./auth/login', {
    title: 'Log In',
    login: true,
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('./auth/signup', {
    title: 'Sign Up',
    signup: true,
  });
};

exports.postSignup = async (req, res, next) => {
  const { username, email, password } = req.body;

  let existingUsername;
  try {
    existingUsername = await User.findByUsername(username);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (existingUsername !== undefined) {
    const error = new HttpError(
      'A user has already registered this username.',
      422
    );
    return next(error);
  }

  let existingEmail;
  try {
    existingEmail = await User.findByEmail(email);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (existingEmail !== undefined) {
    const error = new HttpError(
      'A user has already registered an account with this email address.',
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  let user;
  try {
    user = await User.insert(username, email, hashedPassword);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (user) {
    req.session.user = user;
    req.session.isLoggedIn = true;
    return req.session.save((err) => {
      if (err) {
        console.log(err);
      }
      res.status(201).json({ message: 'User created!' });
    });
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(password);
  let user;
  try {
    user = await User.findByEmail(email);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (user === undefined) {
    const error = new HttpError(
      'Cannot find an account registered to this email address.', 401
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError('Something went wrong, please try again.', 500);
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError('Invalid password, please try again!', 401);
    return next(error);
  }

  req.session.user = {
    id: user.id,
    username: user.username,
  };
  req.session.isLoggedIn = true;
  return req.session.save((err) => {
    if (err) {
      console.log(err);
    }
    res.status(201).json({ message: 'Successfully logged in!' });
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/login');
  });
};
