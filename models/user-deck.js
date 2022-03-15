const pool = require('../db/pool');

class UserDeck {
  static init() {
    pool.query(`
    CREATE TABLE IF NOT EXISTS user-decks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
    `);
  }
};

module.exports = UserDeck;