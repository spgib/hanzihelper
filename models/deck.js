const pool = require('../db/pool');

class Deck {
  static init() {
    pool.query(`
    CREATE TABLE IF NOT EXISTS decks (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      title VARCHAR(50) NOT NULL UNIQUE,
      description VARCHAR(200),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE 
    )
`);
  }
}

module.exports = Deck;