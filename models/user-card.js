const pool = require('../db/pool');

class UserCard {
  static init() {
    pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        first_learned TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_reviewed TIMESTAMP WITH TIME ZONE,
        learning_level INTEGER DEFAULT 1
      );
    `);
  }
}

module.exports = UserCard;