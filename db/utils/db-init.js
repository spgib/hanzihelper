const User = require('../../models/user');
const Deck = require('../../models/deck');

module.exports = () => {
  User.init();
  Deck.init();
}