const hanziLabel = document.querySelector('.learn__front-side h4');
const meaningLabel = document.querySelector('.meaning h4');
const pinyinLabel = document.querySelector('.pinyin h4');

const queue = [];
let currentCard;

let initCards, deckId;
const init = (cardsObject, dId) => {
  initCards = cardsObject;
  deckId = dId;

  initCards.probation.forEach(card => queue.push(card));
  initCards.rev.forEach(card => queue.push(card));
  initCards.remaining.forEach(card => queue.push(card));

  currentCard = queue.shift();
  updateCardDom(currentCard);
}

const updateCardDom = cardObj => {
  hanziLabel.innerHTML = cardObj.hanzi;
  meaningLabel.innerHTML = cardObj.meaning;
  pinyinLabel.innerHTML = cardObj.pinyin;
}


export default init;