const User = require('../../models/user');
const Deck = require('../../models/deck');
const UserDeck = require('../../models/user-deck');
const Card = require('../../models/card');
const UserCard = require('../../models/user-card');

module.exports =  async () => {
  await User.init();
  await Deck.init();
  await Card.init();
  await UserDeck.init();
  await UserCard.init();
};
