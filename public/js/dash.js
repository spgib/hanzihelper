const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const customDeckForm = document.querySelector('.custom-deck-form');
const customDeckCancelBtn = document.querySelector('.custom-deck-form button');
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];
const backdrop = document.querySelector('.backdrop');
const modal = document.querySelector('.modal');

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
  backdrop.classList.add('hidden');
  const content = modal.firstElementChild;
  const errorEl = content.querySelector('h3');
  if (errorEl) {
    errorEl.remove();
  }
  const inputs = content.querySelectorAll('input');
  inputs.forEach((i) => {
    i.value = '';
  });
  const contentDiv = document.querySelector('.dash__modal-content');
  contentDiv.append(content);
};

const backdropClickHandler = function (e) {
  if (this === e.target) {
    closeModal();
  }
};

const openCustomDeckHandler = () => {
  const customDeckModal = document.querySelector('.custom-deck-modal');
  modal.append(customDeckModal);
  backdrop.classList.remove('hidden');
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
    addDeckToList(title);
    httpMessageAlert(message);
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

const addDeckToList = (title) => {
  const decksContainer = document.querySelector('.dash__decks');
  const decksList = decksContainer.querySelector('ul');
  const markup = `
  <li class='decks__item'>
  <button class='decks__item-main'>
    <h3>${title}</h3>
  </button>
  <div class='decks__item-info'>
    <p></p>
  </div>
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

backdrop.addEventListener('click', backdropClickHandler);
dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', openCustomDeckHandler);
customDeckCancelBtn.addEventListener('click', customDeckCancelHandler);
customDeckForm.addEventListener('submit', customDeckFormSubmissionHandler);
