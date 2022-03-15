const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res, next) => {
  res.status(200).render('./auth/login', {
    title: 'Log In',
    errors: false,
    errorMessage: null,
    oldInput: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
};

exports.getSignup = (req, res, next) => {
  res.status(200).render('./auth/signup', {
    title: 'Sign Up',
    errors: false,
    errorMessage: null,
    oldInput: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
};

exports.postSignup = async (req, res, next) => {
  const { username, email, password, confirmPassword } = req.body;

  let existingUsername;
  try {
    existingUsername = await User.findByUsername(username);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (existingUsername !== undefined) {
    return res.status(422).render('./auth/signup', {
      title: 'Sign Up',
      errors: true,
      errorMessage: 'A user has already registered this username.',
      oldInput: {
        username,
        email,
        password,
        confirmPassword,
      },
    });
  }

  let existingEmail;
  try {
    existingEmail = await User.findByEmail(email);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (existingEmail !== undefined) {
    return res.status(422).render('./auth/signup', {
      title: 'Sign Up',
      errors: true,
      errorMessage:
        'A user has already registered an account with this email address.',
      oldInput: {
        username,
        email,
        password,
        confirmPassword,
      },
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
    user = await User.insert(username, email, hashedPassword);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (user) {
    req.session.user = user;
    req.session.isLoggedIn = true;
    return req.session.save((err) => {
      console.log(err);
      res.redirect('/dash');
    });
  }
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findByEmail(email);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (user === undefined) {
    return res.status(401).render('./auth/login', {
      title: 'Sign Up',
      errors: true,
      errorMessage: 'Cannot find an account registered to this email address.',
      oldInput: {
        email,
        password,
      },
    });
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }

  if (!isValidPassword) {
    return res.status(401).render('./auth/login', {
      title: 'Sign Up',
      errors: true,
      errorMessage: 'Invalid password, please try again!',
      oldInput: {
        email,
        password,
      },
    });
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
    res.redirect('/dash');
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
