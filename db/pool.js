const pg = require('pg');

class Pool {
  _pool = null;

  async connect(options) {
    this._pool = new pg.Pool(options);

    let retries = 5;
    while (retries) {
      try {
        await this._pool.query('SELECT 1 + 1;');
        break;
      } catch (err) {
        console.log(err);
        retries -= 1;
        await new Promise((res) => setTimeout(res, 5000));
      }
    }

    if (retries === 0) {
      throw new Error('Could not connect to database.');
    }
  }

  init() {}

  close() {
    return this._pool.end();
  }

  query(sql, params) {
    return this._pool.query(sql, params);
  }
}

module.exports = new Pool();
