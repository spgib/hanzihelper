const hanziLabel = document.querySelector('.learn__front-side h4');
const meaningLabel = document.querySelector('.meaning h4');
const pinyinLabel = document.querySelector('.pinyin h4');
const showAnswerBtn = document.querySelector('.learn__card-controls--front button');
const nopeBtn = document.querySelectorAll('.learn__card-controls--back button')[0];
const okBtn = document.querySelectorAll('.learn__card-controls--back button')[1];
const cardBackside = document.querySelector('.learn__back-side');

const queue = [];
const pastCards = [];
let currentCard;

let initCards, deckId;
const init = (cardsObject, dId) => {
  initCards = cardsObject;
  deckId = dId;

  initCards.probation.forEach(card => queue.push(card));
  initCards.rev.forEach(card => queue.push(card));
  initCards.remaining.forEach(card => queue.push(card));

  nextCard();
}

const nextCard = () => {
  if (currentCard) {
    pastCards.push(currentCard);
  }

  currentCard = queue.shift();
  updateCardDom(currentCard);
}

const updateCardDom = cardObj => {
  hanziLabel.innerHTML = cardObj.hanzi;
  meaningLabel.innerHTML = cardObj.meaning;
  pinyinLabel.innerHTML = cardObj.pinyin;
}

const flipCard = div => {
  cardBackside.classList.toggle('covered');
  div.classList.add('hidden');
  if (div.nextElementSibling) {
    div.nextElementSibling.classList.remove('hidden');
  } else {
    div.previousElementSibling.classList.remove('hidden');
  }
}

const showAnswerHandler = (e) => {
  flipCard(e.target.closest('div'));
}

const okButtonHandler = e => {
  flipCard(e.target.closest('div'));
  nextCard();
}

showAnswerBtn.addEventListener('click', showAnswerHandler);
okBtn.addEventListener('click', okButtonHandler);

export default init;