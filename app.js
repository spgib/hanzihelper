const path = require('path');
const express = require('express');
const { engine } = require('express-handlebars');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const errorController = require('./controllers/error');

const app = express();

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: false}));

app.use(authRoutes);
app.use(dashboardRoutes);

app.use(errorController.get404);

app.listen(3000, () => {
  console.log('listening');
});