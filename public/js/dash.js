const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];
const tabLinks = document.querySelectorAll('.tab-link');
const collapsibles = document.querySelectorAll('.collapsible');
const collapsibleEditBtns = document.querySelectorAll('.collapsible__edit-btn');
const collapsibleDeleteBtns = document.querySelectorAll(
  '.collapsible__delete-btn'
);

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
};

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

  const responseData = await fetchHttp(
    '/dash/deck/custom',
    'POST',
    body,
    e.target
  );
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
    meaning,
  };

  const responseData = await fetchHttp(
    '/dash/deck/addcard',
    'POST',
    body,
    e.target
  );
  if (responseData.message) {
    const inputs = e.target.querySelectorAll('input');
    inputs[0].focus();
    for (let input of inputs) {
      input.value = '';
    }
    httpMessageAlert(responseData.message);

    // Update the DOM to increment the number of cards to be learned
    const deckLinks = document.querySelectorAll('.decks__item-main');
    for (let dl of deckLinks) {
      const href = dl.getAttribute('href').split('/');
      const id = href[href.length - 1];
      if (id === deckId) {
        const p = dl.querySelector('p:last-of-type');
        const numOfCards = p.textContent.split(' ')[2];
        p.textContent = 'To learn: ' + (parseInt(numOfCards) + 1);
      }
    }
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
  const deckItemClone =
    deckItemTemplate.content.firstElementChild.cloneNode(true);
  deckItemClone
    .querySelector('a')
    .setAttribute('href', `/learn/deck/${deckId}`);
  deckItemClone.querySelector('h3').textContent = title;

  const deckInfoTemplate = document.getElementById('deck-info-template');
  const deckInfoClone =
    deckInfoTemplate.content.firstElementChild.cloneNode(true);
  const deckInfoBtn = deckInfoClone.querySelector('button');
  deckInfoBtn.textContent = title;
  deckInfoBtn.addEventListener('click', collapsibleHandler);
  deckInfoClone.querySelector('p:last-of-type').textContent =
    'Learning since: ' + createdAt;
  const editBtn = deckInfoClone.querySelector('.collapsible__edit-btn');
  editBtn.addEventListener('click', editDeckHandler);
  const deleteBtn = deckInfoClone.querySelector('.collapsible__delete-btn');
  deleteBtn.addEventListener('click', deleteDeckHandler);

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

  // Add an option for this deck to the select field on the add card form
  const addCardTemplate = document.getElementById('add-card-template');
  const templateSelect = addCardTemplate.content.querySelector('select');
  const newOption = document.createElement('option');
  newOption.value = deckId;
  newOption.textContent = title;
  templateSelect.append(newOption);
};

const deleteDeckHandler = (e) => {
  const title = e.target
    .closest('.decks__item')
    .firstElementChild.textContent.trim();

  // create delete confirmation modal
  const template = document.getElementById('delete-deck-template');
  const modal = template.content.firstElementChild.cloneNode(true);

  // add listeners to the buttons
  const buttons = modal.querySelectorAll('button');
  buttons[0].addEventListener('click', modalCancelHandler);
  buttons[1].addEventListener('click', deleteDeck.bind(this, title));

  // open backdrop
  createBackdrop(modal);
};

const deleteDeck = async (deckTitle) => {
  await fetchHttp('/deck/' + deckTitle, 'DELETE');

  // update DOM to remove deck list item and info collapsible
  const h3List = document.querySelectorAll('.decks__item h3');
  for (h3 of h3List) {
    if (h3.textContent.trim() === deckTitle) {
      h3.closest('.decks__item').remove();
    }
  }

  const collapsibleBtnList = document.querySelectorAll('.collapsible');
  for (btn of collapsibleBtnList) {
    if (btn.textContent.trim() === deckTitle) {
      btn.closest('.decks__item').remove();
    }
  }

  closeModal();
};

const editDeckHandler = (e) => {
  // initialize template
  const template = document.getElementById('edit-deck-template');
  const modal = template.content.firstElementChild.cloneNode(true);

  // extract preexisting data
  const li = e.target.closest('li');
  const title = li.querySelector('button').textContent.trim();
  const description = li.querySelector('p').textContent.split(' ')[1];
  const isPublicString = li.querySelector('p:last-of-type').textContent.split(' ')[2];
  const isPublic = isPublicString === 'true' ? true : false;

  // apply extracted data to modal
  modal.querySelector('h3').textContent = title;
  modal.querySelector('textarea').textContent = description;
  if (isPublic) {
    modal.querySelector('#visibilityChoice1').setAttribute('checked', true);
  } else {
    modal.querySelector('#visibilityChoice2').setAttribute('checked', true);
  }

  // add listeners
  modal.querySelectorAll('button')[0].addEventListener('click', modalCancelHandler);
  modal.querySelector('form').addEventListener('submit', editDeckSubmissionHandler);
  

  createBackdrop(modal);
}

const editDeckSubmissionHandler = e => {
  e.preventDefault();
  console.log(e.target[1].checked);
}

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
collapsibleEditBtns.forEach((btn) => {
  btn.addEventListener('click', editDeckHandler);
});
collapsibleDeleteBtns.forEach((btn) => {
  btn.addEventListener('click', deleteDeckHandler);
});
dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', openCustomDeckHandler);
addCardBtn.addEventListener('click', openAddCardHandler);
tabLinks[0].addEventListener('click', tabHandler.bind(this, 'learn-tab'));
tabLinks[1].addEventListener('click', tabHandler.bind(this, 'info-tab'));

tabLinks[0].click();
