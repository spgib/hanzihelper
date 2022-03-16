const dashActionBtn = document.querySelector('.dash__action-list button');
const addDeckBtn = document.querySelectorAll('.dash__action-list button')[1];
const customDeckBtn = document.querySelectorAll('.dash__action-list button')[2];
const customDeckCancelBtn = document.querySelector('.custom-deck-form button');
const customDeckCreateBtn = document.querySelector('.custom-deck-form button[type="submit"]')
const addCardBtn = document.querySelectorAll('.dash__action-list button')[3];
const backdrop = document.querySelector('.backdrop');
const modal = document.querySelector('.modal');

const onStart = () => {
  const startContent = document.getElementById('start-content');
  if (startContent === null) return;
  modal.append(startContent);
}
onStart();


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

const openCustomDeckHandler = () => {
  const customDeckModal = document.querySelector('.custom-deck-modal');
  modal.append(customDeckModal);
  backdrop.classList.remove('hidden');
};

const closeModal = function (e) {
    backdrop.classList.add('hidden');
    const content = modal.firstElementChild;
    const contentDiv = document.querySelector('.dash__modal-content');
    contentDiv.append(content);
};

backdrop.addEventListener('click', closeModalHandler);
dashActionBtn.addEventListener('click', actionItemsHandler);
customDeckBtn.addEventListener('click', openCustomDeckHandler);
customDeckCancelBtn.addEventListener('click', closeModalHandler);
