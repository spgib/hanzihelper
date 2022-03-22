const User = require('../../models/user');
const Deck = require('../../models/deck');
const UserDeck = require('../../models/user-deck');
const Card = require('../../models/card');
const UserCard = require('../../models/user-card');

module.exports = () => {
  User.init();
  Deck.init();
  UserDeck.init();
  Card.init();
  UserCard.init();
};
