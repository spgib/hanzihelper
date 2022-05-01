const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];
const tabLinks = document.querySelectorAll('.tab-link');
const collapsibles = document.querySelectorAll('.collapsible');

const fetchHttp = async (url, method, body, form) => {
  try {
    const token = document
      .querySelector('meta[name="csrf-token"]')
      .getAttribute('content');

    const response = await fetch(url, {
      method,
      headers: {
        'CSRF-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    return responseData;
  } catch (err) {
    const error = form.querySelector('h3');
    if (error) {
      error.innerHtml = err;
    } else {
      const errorEl = document.createElement('h3');
      errorEl.innerHTML = err;
      form.insertBefore(errorEl, form.firstChild);
    }
  }
};

const tabHandler = (tab, e) => {
  const tabs = document.querySelectorAll('.tab-content');
  const activeTab = document.getElementById(tab);

  tabs.forEach((tab) => {
    if (tab.classList.contains('hidden')) return;
    tab.classList.add('hidden');
  });

  tabLinks.forEach((tabLink) => {
    tabLink.classList.remove('active');
  });

  activeTab.classList.remove('hidden');
  e.target.classList.add('active');
};

const collapsibleHandler = (e) => {
  e.target.nextElementSibling.classList.toggle('hidden');
};

const actionItemsHandler = () => {
  const items = document.querySelectorAll('.dash__action-item');
  toggleDashActionItems(items);
};

const toggleDashActionItems = (items) => {
  items.forEach((item, index) => {
    if (index === 0) return;

    item.classList.toggle('hidden');
  });
}

const closeModal = () => {
  const backdrop = document.querySelector('.backdrop');
  backdrop.remove();
};

const createBackdrop = (content) => {
  const backdrop = document.createElement('div');
  backdrop.classList.add('backdrop');
  backdrop.append(content);
  document.body.insertBefore(backdrop, document.body.firstChild);
  backdrop.addEventListener('click', backdropClickHandler);
};

const backdropClickHandler = function (e) {
  if (this === e.target) {
    closeModal();
  }
};

const openCustomDeckHandler = () => {
  const template = document.querySelector('#custom-deck-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  clone.querySelector('button').addEventListener('click', modalCancelHandler);
  clone
    .querySelector('form')
    .addEventListener('submit', customDeckFormSubmissionHandler);

  createBackdrop(clone);
};

const customDeckFormSubmissionHandler = async (e) => {
  e.preventDefault();
  const title = e.target[0].value;
  const body = {
    title,
  };

  const responseData = await fetchHttp('/dash/deck/custom', 'POST', body, e.target);
  if (responseData) {
    closeModal();
    dashActionBtn.click();
    addDeckToList(title, responseData.deck.id, responseData.deck.createdAt);
    httpMessageAlert(responseData.message);
  }
};

const openAddCardHandler = () => {
  const template = document.getElementById('add-card-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  clone.querySelector('button').addEventListener('click', modalCancelHandler);
  clone
    .querySelector('form')
    .addEventListener('submit', addCardFormSubmissionHandler);

  createBackdrop(clone);
};

const addCardFormSubmissionHandler = async (e) => {
  e.preventDefault();
  const deckId = e.target[0].value;
  const hanzi = e.target[1].value;
  const pinyin = e.target[2].value;
  const meaning = e.target[3].value;
  body = {
    deckId,
    hanzi,
    pinyin,
    meaning
  };
  
  const message = await fetchHttp('/dash/deck/addcard', 'POST', body, e.target);
  if (message) {
    const inputs = e.target.querySelectorAll('input');
    inputs[0].focus();
    for (let input of inputs) {
      input.value = '';
    }
    httpMessageAlert(message);
  }
};

const modalCancelHandler = () => {
  closeModal();
};

const addDeckToList = (title, deckId, createdAt) => {
  const decksContainer = document.querySelector('.dash__decks');
  const decksList = decksContainer.querySelector('ul');
  const decksInfoContainer = document.querySelector('.dash__decks-info');
  const decksInfoList = decksInfoContainer.querySelector('ul');

  const deckItemTemplate = document.getElementById('deck-item-template');
  const deckItemClone = deckItemTemplate.content.firstElementChild.cloneNode(true);
  deckItemClone.querySelector('a').setAttribute('href', `/learn/deck/${deckId}`);
  deckItemClone.querySelector('h3').textContent = title;

  const deckInfoTemplate = document.getElementById('deck-info-template');
  const deckInfoClone = deckInfoTemplate.content.firstElementChild.cloneNode(true);
  const deckInfoBtn = deckInfoClone.querySelector('button');
  deckInfoBtn.textContent = title;
  deckInfoBtn.addEventListener('click', collapsibleHandler);
  deckInfoClone.querySelector('p:last-of-type').textContent = 'Learning since: ' + createdAt;

  if (!decksList) {
    decksContainer.firstElementChild.remove();
    const deckUl = document.createElement('ul');
    deckUl.classList.add('decks__list');
    deckUl.append(deckItemClone);
    decksContainer.append(deckUl);

    decksInfoContainer.firstElementChild.remove();
    const infoUl = document.createElement('ul');
    infoUl.classList.add('decks__list');
    infoUl.append(deckInfoTemplate);
    decksInfoContainer.append(infoUl);
  } else {
    decksList.append(deckItemClone);
    decksInfoList.append(deckInfoClone);
  }
};

const httpMessageAlert = (message) => {
  const alert = document.createElement('div');
  alert.classList.add('alert');
  alert.innerHTML = `<h3>${message}</h3>`;
  document.body.append(alert);
  setTimeout(() => {
    alert.remove();
  }, 2500);
};

collapsibles.forEach((collapsible) =>
  collapsible.addEventListener('click', collapsibleHandler)
);
dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', openCustomDeckHandler);
addCardBtn.addEventListener('click', openAddCardHandler);
tabLinks[0].addEventListener('click', tabHandler.bind(this, 'learn-tab'));
tabLinks[1].addEventListener('click', tabHandler.bind(this, 'info-tab'));

tabLinks[0].click();
