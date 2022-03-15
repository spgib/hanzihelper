const User = require('../../models/user');
const Deck = require('../../models/deck');
const UserDeck = require('../../models/user-deck');

module.exports = () => {
  User.init();
  Deck.init();
  UserDeck.init();
}