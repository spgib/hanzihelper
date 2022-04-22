const hanziLabel = document.querySelector('.learn__front-side h4');
const meaningLabel = document.querySelector('.meaning h4');
const pinyinLabel = document.querySelector('.pinyin h4');
const showAnswerBtn = document.querySelector(
  '.learn__card-controls--front button'
);
const failBtn = document.querySelectorAll(
  '.learn__card-controls--back button'
)[0];
const okBtn = document.querySelectorAll(
  '.learn__card-controls--back button'
)[1];
const cardBackside = document.querySelector('.learn__back-side');

const queue = [];
const pastCards = [];
let probation = [];
const probationTimers = [];
let currentCard;

const fetchHttp = async (url, method, body) => {
  try {
    const token = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute('content');

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'CSRF-Token': token,
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (err) {
    console.log(err);
  }
};

let initCards, deckId;
const init = (cardsObject, dId) => {
  initCards = cardsObject;
  deckId = dId;

  initCards.probation.forEach((card) => {
    if (new Date(card.probationTimer) - Date.now() >= 0) {
      probationHandler(card);
    } else {
      queue.push(card);
    }
  });
  initCards.review.forEach((card) => queue.push(card));
  initCards.remaining.forEach((card) => queue.push(card));
  nextCard();
};

const probationHandler = (card) => {
  probation.push(card);

  const time = new Date(card.probationTimer) - Date.now();
  card.timeoutToken = setTimeout(() => {
    queue.unshift(card);
    probation = probation.filter((c) => c.id !== card.id);
  }, time);
  probationTimers.push(card.timeoutToken);
};

const nextCard = async () => {
  if (currentCard) {
    pastCards.push(currentCard);
  }

  if (queue.length === 0) {
    if (probation.length > 0) {
      probation.forEach((card) => queue.push(card));
      probation = [];
      probationTimers.forEach((timer) => clearTimeout(timer));
    } else {
      const { cards } = await fetchHttp('/learn/next/' + deckId, 'GET');

      cards.forEach((card) => queue.push(card));

      if (queue.length === 0) {
        window.location.replace('/dash');
      }
    }
  }

  currentCard = queue.shift();
  updateCardDom(currentCard);
};

const updateCardDom = (cardObj) => {
  hanziLabel.innerHTML = cardObj.hanzi;
  meaningLabel.innerHTML = cardObj.meaning;
  pinyinLabel.innerHTML = cardObj.pinyin;
};

const flipCard = (div) => {
  cardBackside.classList.toggle('covered');
  div.classList.add('hidden');
  if (div.nextElementSibling) {
    div.nextElementSibling.classList.remove('hidden');
  } else {
    div.previousElementSibling.classList.remove('hidden');
  }
};

const showAnswerHandler = (e) => {
  flipCard(e.target.closest('div'));
};

const okButtonHandler = async (e) => {
  flipCard(e.target.closest('div'));

  const response = await fetchHttp('/learn/success', 'PATCH', {
    cardId: currentCard.id,
  });
  if (!response) {
    return;
  }

  const { card, lastStack } = response;
  
  if (card.probation) {
    probationHandler(card);
  }

  if (lastStack === 'revise') {
    cardStatHandler({stack: 'revise', op: 'subtract'});
  } else if (lastStack === 'refresh') {
    cardStatHandler({stack: 'refresh', op: 'subtract'});
  }

  nextCard();
};

const failButtonHandler = async (e) => {
  flipCard(e.target.closest('div'));

  const response = await fetchHttp(`/learn/fail`, 'PATCH', {
    cardId: currentCard.id,
  });
  if (!response) {
    return;
  }
  const { card } = response;

  probationHandler(card);

  nextCard();
};

const cardStatHandler = (...adjustments) => {
  const cardStats = document.querySelectorAll('.learn__sub-banner p');
  
  adjustments.forEach(adj => {
    if (adj.stack === 'revise') {
      cardStats[0].innerHTML = adj.op === 'add' ? (parseInt(cardStats[0].innerHTML)+1) : (parseInt(cardStats[0].innerHTML)-1);
    }
    if (adj.stack === 'refresh') {
      cardStats[1].innerHTML = adj.op === 'add' ? (parseInt(cardStats[1].innerHTML) + 1) : (parseInt(cardStats[1].innerHTML)-1);
    }
  });
}

showAnswerBtn.addEventListener('click', showAnswerHandler);
okBtn.addEventListener('click', okButtonHandler);
failBtn.addEventListener('click', failButtonHandler);

export default init;
