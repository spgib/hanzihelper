const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];
const tabLinks = document.querySelectorAll('.tab-link');

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

    closeModal();
    return responseData.message;
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
  const learnContent = tabs[0];
  const infoContent = tabs[1];
  const hide = tab === 'learn' ? infoContent : learnContent;
  const show = tab === 'learn' ? learnContent : infoContent;

  hide.classList.add('tab-content-hide');
  hide.classList.remove('tab-content-show');
  show.classList.add('tab-content-show');
  show.classList.remove('tab-content-hide');

  tabLinks.forEach(tabLink => {
    tabLink.classList.remove('active');
  });

  e.target.classList.add('active');
};

const actionItemsHandler = () => {
  const hidden = document.querySelector('.dash__action-list > .hidden');
  const items = document.querySelectorAll('.dash__action-item');
  if (hidden) {
    openDashActionItems(items);
  } else {
    closeDashActionItems(items);
  }
};

const openDashActionItems = (items) => {
  items.forEach((item, index) => {
    if (index === 0) return;

    item.classList.remove('hidden');
  });
};

const closeDashActionItems = (items) => {
  items.forEach((item, index) => {
    if (index === 0) return;

    item.classList.add('hidden');
  });
};

const closeModal = () => {
  const backdrop = document.querySelector('.backdrop');
  backdrop.remove();
};

const backdropClickHandler = function (e) {
  if (this === e.target) {
    closeModal();
  }
};

const openCustomDeckHandler = () => {
  const template = document.querySelector('#custom-deck-template');
  const clone = template.content.firstElementChild.cloneNode(true);

  clone.querySelector('button').addEventListener('click', customDeckCancelHandler);
  clone.querySelector('form').addEventListener('submit', customDeckFormSubmissionHandler);

  const backdrop = document.createElement('div');
  backdrop.classList.add('backdrop');
  backdrop.append(clone);
  document.body.insertBefore(backdrop, document.body.firstChild);
  backdrop.addEventListener('click', backdropClickHandler);
};

const customDeckCancelHandler = () => {
  closeModal();
};

const customDeckFormSubmissionHandler = async (e) => {
  e.preventDefault();
  const title = e.target[0].value;
  const body = {
    title,
  };

  const message = await fetchHttp('/dash/custom', 'POST', body, e.target);
  if (message) {
    dashActionBtn.click();
    addDeckToList(title);
    httpMessageAlert(message);
  }
};

const addDeckToList = (title) => {
  const decksContainer = document.querySelector('.dash__decks');
  const decksList = decksContainer.querySelector('ul');
  const markup = `
  <li class='decks__item'>
  <button class='decks__item-main'>
  <h3>${title}</h3>
  </button>
  </li>
  `;
  if (!decksList) {
    decksContainer.firstElementChild.remove();
    const ul = document.createElement('ul');
    ul.classList.add('decks__list');
    ul.innerHTML = markup;
    decksContainer.append(ul);
  } else {
    decksList.innerHTML = decksList.innerHTML + markup;
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

dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', openCustomDeckHandler);
tabLinks[0].addEventListener('click', tabHandler.bind(this, 'learn'));
tabLinks[1].addEventListener('click', tabHandler.bind(this, 'info'));
tabLinks[0].click();
