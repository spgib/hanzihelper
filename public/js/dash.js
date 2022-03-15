const dashActionBtn = document.querySelector('.dash__action-list button');

const actionItemsHandler = () => {
  const hidden = document.querySelector('.dash__action-list > .hidden');
  const items = document.querySelectorAll('.dash__action-item');
  if (hidden) {
    openDashActionItems(items);
  } else {
    closeDashActionItems(items);
  }
}

const openDashActionItems = (items) => {
  items.forEach((item, index) => {
    if (index === 0) return;

    item.classList.remove('hidden');
  });
}

const closeDashActionItems = (items) => {
  items.forEach((item, index) => {
    if (index === 0) return;

    item.classList.add('hidden');
  });
}

dashActionBtn.addEventListener('click', actionItemsHandler);