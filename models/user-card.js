const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class UserCard {
  static async init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_cards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
        first_learned TIMESTAMP WITH TIME ZONE,
        last_reviewed TIMESTAMP WITH TIME ZONE,
        next_review TIMESTAMP WITH TIME ZONE,
        probation BOOLEAN DEFAULT FALSE,
        probation_timer TIMESTAMP WITH TIME ZONE,
        next_rev_interval INTEGER DEFAULT 1
      );
    `);
  }

  static async findByUserAndDeck(userId, deckId) {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM user_cards
      JOIN cards ON cards.id = user_cards.card_id
      WHERE cards.deck_id = $1 AND user_cards.user_id = $2;
    `,
      [deckId, userId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows;
  }

  static async findByUserAndCard(userId, cardId) {
    const { rows } = await pool.query(
      `
    SELECT cards.id, cards.hanzi, cards.pinyin, cards.meaning, user_cards.probation, user_cards.probation_timer
    FROM user_cards
    JOIN cards ON cards.id = user_cards.card_id
    WHERE user_cards.card_id = $1 AND user_cards.user_id = $2;
    `,
      [cardId, userId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async isUserCard(userId, cardId) {
    const { rows } = await pool.query(
      `
    SELECT *
    FROM user_cards
    WHERE card_id = $1 AND user_id = $2;
    `,
    [cardId, userId]
    );
    
    const parsedRows = toCamelCase(rows);
    
    return parsedRows[0];
  }
  
  
  static async insert(userId, cardId) {
    const { rows } = await pool.query(
      `INSERT INTO user_cards (user_id, card_id) VALUES ($1, $2) RETURNING id;`,
      [userId, cardId]
      );
      
      const parsedRows = toCamelCase(rows);
      
      return parsedRows[0];
    }

    static async addFirstLearned(id) {
      const {rows} = await pool.query(`UPDATE user_cards SET first_learned = now()::timestamptz WHERE id = $1 RETURNING id;`, [id]);
  
      return rows[0];
    }

  static async addProbationAndResetInterval(id) {
    const { rows } = await pool.query(
      `UPDATE user_cards SET probation = true, next_rev_interval = 1 WHERE id = $1 RETURNING id;`,
      [id]
    );

    return rows[0];
  }

  static async removeProbation(id) {
    const { rows } = await pool.query(
      `UPDATE user_cards SET probation = false WHERE id = $1 RETURNING id;`,
      [id]
    );

    return rows[0];
  }

  static async setProbationTimer(id, interval) {
    const { rows } = await pool.query(
      `
    UPDATE user_cards
    SET probation_timer = (SELECT now() + $1::interval)
    WHERE id = $2
    RETURNING probation_timer;
    `,
      [interval, id]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async setProbationAndTimer(id, interval) {
    const { rows } = await pool.query(
      `UPDATE user_cards SET probation = true, probation_timer = (SELECT now() + $1::interval) WHERE id = $2 RETURNING *;`,
      [interval, id]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async setSuccess(id, nextRev, nextRevInt) {
    const {rows} = await pool.query(`
    UPDATE user_cards
    SET
      probation = false,
      probation_timer = null,
      last_reviewed = now()::timestamptz,
      next_review = (SELECT now() + $1::interval)::timestamptz,
      next_rev_interval = $2
    WHERE id = $3
    RETURNING *;
    `, [nextRev, nextRevInt, id]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = UserCard;
