const pool = require('./db/pool');
const dbInit = require('./db/utils/db-init');
const app = require('./app');

require('dotenv').config();

pool
  .connect()
  .then(() => dbInit())
  .then(() => {
    app().listen(3000, () => {
      console.log('Listening on port 3000.');
    });
  });
