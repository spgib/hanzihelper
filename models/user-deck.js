const pool = require('../db/pool');
const toCamelCase = require('../db/utils/to-camel-case');

class UserDeck {
  static async init() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS user_decks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `);
  }

  static async insert(userId, deckId) {
    const { rows } = await pool.query(
      `INSERT INTO user_decks (user_id, deck_id) VALUES ($1, $2) RETURNING *`,
      [userId, deckId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async getUserDecksInfo(userId) {
    const { rows } = await pool.query(
      `
      SELECT decks.id, title, description, user_decks.id, user_decks.created_at
      FROM user_decks
      JOIN decks ON user_decks.deck_id = decks.id
      WHERE user_decks.user_id = $1;
    `,
      [userId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows;
  }

  static async findByUserAndDeck(userId, deckId) {
    const { rows } = await pool.query(
      `SELECT * 
      FROM user_decks
      JOIN decks ON decks.id = user_decks.deck_id 
      WHERE user_id = $1 AND deck_id = $2;`,
      [userId, deckId]
    );

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }

  static async getDeckCardsInfo(userId, deckId) {
    const { rows } = await pool.query(`
    SELECT 
	    (SELECT (
        (SELECT COUNT(*)
	 	      FROM user_cards
		      JOIN cards ON user_cards.card_id = cards.id
		      WHERE cards.deck_id = $1
            AND user_cards.user_id = $2
			      AND user_cards.probation = true) +
		    (SELECT (SELECT COUNT(*)
			    FROM user_cards
			    JOIN cards ON user_cards.card_id = cards.id
			    WHERE cards.deck_id = $1
            AND user_cards.user_id = $2
				    AND user_cards.probation = false
				    AND user_cards.first_learned IS NULL) * 2)
      ) AS revision_cards),
	    (SELECT COUNT(*) AS refresh_cards
		    FROM user_cards
		    JOIN cards ON user_cards.card_id = cards.id
		    WHERE cards.deck_id = $1
          AND user_cards.user_id = $2
			    AND user_cards.next_review < NOW()
			    AND user_cards.probation = false), 
	    (SELECT (
		    (SELECT COUNT(*) FROM cards WHERE cards.deck_id = $1) -
		    (SELECT COUNT(*) FROM user_cards
			    JOIN cards ON cards.id = user_cards.card_id
			    WHERE cards.deck_id = $1
            AND user_cards.user_id = $2)
	    ) AS unlearned_cards),
      (SELECT COUNT(*) AS total_cards FROM cards WHERE cards.deck_id = $1);
    `, [deckId, userId]);

    const parsedRows = toCamelCase(rows);

    return parsedRows[0];
  }
}

module.exports = UserDeck;
