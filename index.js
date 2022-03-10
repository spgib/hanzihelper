const pool = require('./db/pool');
const app = require('./app');

require('dotenv').config();

pool
  .connect()
  .then(() => pool.init())
  .then(() => {
    app().listen(3000, () => {
      console.log('Listening on port 3000.');
    });
  });
