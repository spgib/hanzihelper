const path = require('path');
const express = require('express');
const pool = require('./db/pool');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const csurf = require('csurf');
const flash = require('connect-flash');
const { engine } = require('express-handlebars');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const errorController = require('./controllers/error');

module.exports = () => {
  const app = express();

  app.engine(
    '.hbs',
    engine({
      extname: '.hbs',
    })
  );
  app.set('view engine', '.hbs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(
    session({
      store: new pgSession({
        pool,
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 },
    })
  );
  app.use(csurf());
  app.use(flash());

  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
  });

  app.use(authRoutes);
  app.use(dashboardRoutes);

  app.get('/500', errorController.render500);
  app.use(errorController.render404);

  app.use((error, req, res, next) => {
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred.' });
  });

  return app;
};
