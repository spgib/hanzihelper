exports.getLogin = (req, res, next) => {
  res.status(200).render('./auth/login', { title: 'Log In' });
}

exports.getSignup = (req, res, next) => {
  res.status(200).render('./auth/signup', { title: 'Sign Up' });
}