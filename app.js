const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const errorController = require('./controllers/error');

const app = express();

app.engine('.hbs', engine({
  extname: '.hbs',
}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: false}));

app.use(authRoutes);
app.use(dashboardRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);

app.use((req, res, next, error) => {
  res.redirect('/500');
});

app.listen(3000, () => {
  console.log('listening');
});