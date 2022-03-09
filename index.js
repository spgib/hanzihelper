const pool = require('./db/pool');
const app = require('./app');

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_DATABASE } = process.env;

pool
  .connect({
    user: DB_USER,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_DATABASE,
  })
  .then(() => {
    app().listen(3000, () => {
      console.log('Listening on port 3000.');
    });
  });
