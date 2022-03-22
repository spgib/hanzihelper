const pool = require('../db/pool');

class Card {
  static init() {
    pool.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        hanzi VARCHAR(50) NOT NULL UNIQUE,
        pinyin VARCHAR(100) NOT NULL,
        meaning VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }
}

module.exports = Card;