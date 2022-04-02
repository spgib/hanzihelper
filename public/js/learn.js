const hanziLabel = document.querySelector('.learn__front-side h4');
const meaningLabel = document.querySelector('.meaning h4');
const pinyinLabel = document.querySelector('.pinyin h4');
const showAnswerBtn = document.querySelector('.learn__card-controls--front button');
const failBtn = document.querySelectorAll('.learn__card-controls--back button')[0];
const okBtn = document.querySelectorAll('.learn__card-controls--back button')[1];
const cardBackside = document.querySelector('.learn__back-side');

const queue = [];
const pastCards = [];
let probation = [];
const probationTimers = [];
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

  if (queue.length === 0) {
    if (probation.length > 0) {
      probation.forEach(card => queue.push(card));
      probation = [];
      probationTimers.forEach(timer => clearTimeout(timer));
    }
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

const failButtonHandler = e => {
  flipCard(e.target.closest('div'));

  // report probation to server; if no userCard, create one
  // push to probation list
  probation.push(currentCard);
  // create probation timer and push to timer list
  const clone = JSON.parse(JSON.stringify(currentCard));
  clone.probationTimer = setTimeout(() => {
    queue.unshift(clone);
    probation = probation.filter(card => card.id !== clone.id);
  }, 1000 * 15);
  probationTimers.push(clone.probationTimer);

  nextCard();
}

showAnswerBtn.addEventListener('click', showAnswerHandler);
okBtn.addEventListener('click', okButtonHandler);
failBtn.addEventListener('click', failButtonHandler);

export default init;