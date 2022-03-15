const backdrop = document.querySelector('.backdrop');
const modal = document.querySelector('.modal');
const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];

const closeModalHandler = function (e) {
  if (this === e.target) {
    backdrop.classList.add('hidden');
    const content = modal.firstElementChild;
    const contentDiv = document.querySelector('.dash__modal-content');
    contentDiv.append(content);
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

const customDeckHandler = () => {
  openCustomDeck();
};

const openCustomDeck = () => {
  const customDeckForm = document.querySelector('.custom-deck-form');
  modal.append(customDeckForm);
  backdrop.classList.remove('hidden');
};

backdrop.addEventListener('click', closeModalHandler);
dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', customDeckHandler);
