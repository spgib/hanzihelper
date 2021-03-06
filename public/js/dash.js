class Dashboard {
  constructor() {
    this.decks = [];

    const learnList = document.querySelectorAll('.dash__decks li');
    const infoList = document.querySelectorAll('.dash__decks-info li');

    for (let x = 0; x < learnList.length; x++) {
      this.decks.push(new Deck(learnList[x], infoList[x]));
    }

    this.init();
  }

  init() {
    new TabControls();
    new AddControls();
  }

  static async fetchHttp(url, method, body, form) {
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

      DOMHelper.showAlert(response.message);
      return responseData;
    } catch (err) {
      if (form) {
        DOMHelper.showFormError(form, response.message);
      } else {
        DOMHelper.showAlert(response.message);
      }
    }
  }
}

class Deck {
  constructor(learnEl, infoEl) {
    this.elements = {
      learn: learnEl,
      info: infoEl,
    };
    this.id = learnEl.id;
    this.title = learnEl.querySelector('h3').textContent.trim();
    this.cards = {
      learn: +learnEl.querySelector('.learn').textContent.trim(),
      revise: +learnEl.querySelector('.revise').textContent.trim(),
      refresh: +learnEl.querySelector('.refresh').textContent.trim(),
      total: +infoEl
        .querySelector('.collapsible__total-cards')
        .textContent.trim(),
    };
    this.info = {
      description: infoEl
        .querySelector('.collapsible__description')
        .textContent.trim(),
      learningSince: infoEl
        .querySelector('.collapsible__learning-since')
        .textContent.trim(),
      visibility:
        infoEl.querySelector('.collapsible__visibility').textContent.trim() ===
        'true'
          ? true
          : false,
    };
    this.buttons = {
      collapsible: infoEl.querySelector('.collapsible'),
      edit: infoEl.querySelector('.collapsible__edit-btn'),
      delete: infoEl.querySelector('.collapsible__delete-btn'),
    };

    this.buttons.collapsible.addEventListener('click', (e) => {
      e.target.nextElementSibling.classList.toggle('hidden');
    });
  }
}

class AddControls {
  constructor() {
    this.toggleBtn = document.querySelector('.dash__action-toggle button');
    this.actionItems = document.querySelectorAll('.dash__action-item');
    this.addDeckBtn = document.querySelector('.action__add-deck button');
    this.createCustomBtn = document.querySelector('.action__create-custom button');
    this.addCardBtn = document.querySelector('.action__add-card button');

    this.toggleBtn.addEventListener('click', () => {
      this.actionItems.forEach((item) => item.classList.toggle('hidden'));
    });
    this.addDeckBtn.addEventListener('click', () => {
      
    });
    this.createCustomBtn.addEventListener('click', () => {
      DOMHelper.createStandardModal('custom-deck-template', (e) => {
        e.preventDefault();
      });
    });
    this.addCardBtn.addEventListener('click', () => {
      DOMHelper.createStandardModal('add-card-template', e => {
        e.preventDefault();
      })
    });
  }
}

class TabControls {
  constructor() {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContentList = document.querySelectorAll('.tab-content');
    this.tabs = [
      new Tab('learn', tabLinks[0], tabContentList[0], this.switch.bind(this)),
      new Tab('info', tabLinks[1], tabContentList[1], this.switch.bind(this)),
    ];

    this.switch('learn');
  }

  switch(name) {
    for (let tab of this.tabs) {
      if (tab.name === name) {
        tab.activate();
      } else {
        tab.deactivate();
      }
    }
  }
}

class Tab {
  constructor(name, button, content, callback) {
    this.name = name;
    this.button = button;
    this.content = content;
    this.switchCallback = callback;

    this.button.addEventListener('click', this.switchCallback.bind(this, name));
  }

  activate() {
    this.button.classList.add('active');
    this.content.classList.remove('hidden');
  }

  deactivate() {
    this.button.classList.remove('active');
    this.content.classList.add('hidden');
  }
}

class DOMHelper {
  static showAlert(message) {
    const alert = document.createElement('div');
    alert.classList.add('alert');
    alert.innerHTML = `<h3>${message}</h3>`;
    document.body.append(alert);
    setTimeout(() => {
      alert.remove();
    }, 2500);
  }

  static showFormError(form, error) {
    const errorEl = form.querySelector('.form-error');
    if (errorEl) {
      errorEl.textContent = error;
    } else {
      const errorEl = document.createElement('h3');
      errorEl.classList.add('form-error');
      errorEl.textContent = error;
      form.insertBefore(errorEl, form.firstChild);
    }
  }

  static createStandardModal(templateId, confirmFn, insertDataFn) {
    const template = document.getElementById(templateId);
    const clone = template.content.firstElementChild.cloneNode(true);

    if (insertDataFn) {
      insertDataFn(clone);
    }

    const form = clone.querySelector('form');

    let cancelBtn;
    if (!form) {
      cancelBtn = clone.querySelector('.modal__action--cancel');
      const confirmBtn = clone.querySelector('.modal__action--confirm');

      confirmBtn.addEventListener('click', confirmFn);
    } else {
      cancelBtn = clone.querySelector('button[type="button"]');

      form.addEventListener('submit', confirmFn);
    }

    cancelBtn.addEventListener('click', () => {
      this.closeModal();
    });

    DOMHelper.createBackdrop(clone);
  }

  static createBackdrop(content) {
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    backdrop.append(content);
    document.body.insertBefore(backdrop, document.body.firstChild);
    backdrop.addEventListener('click', function (e) {
      if (this === e.target) {
        DOMHelper.closeModal();
      }
    });
  }

  static closeModal() {
    const backdrop = document.querySelector('.backdrop');
    backdrop.remove();
  }
}

new Dashboard();

// const openCustomDeckHandler = () => {
//   const template = document.querySelector('#custom-deck-template');
//   const clone = template.content.firstElementChild.cloneNode(true);

//   clone.querySelector('button').addEventListener('click', modalCancelHandler);
//   clone
//     .querySelector('form')
//     .addEventListener('submit', customDeckFormSubmissionHandler);

//   createBackdrop(clone);
// };

// const customDeckFormSubmissionHandler = async (e) => {
//   e.preventDefault();
//   const title = e.target[0].value;
//   const body = {
//     title,
//   };

//   const responseData = await fetchHttp(
//     '/dash/deck/custom',
//     'POST',
//     body,
//     e.target
//   );
//   if (responseData) {
//     closeModal();
//     dashActionBtn.click();
//     addDeckToList(title, responseData.deck.id, responseData.deck.createdAt);
//     httpMessageAlert(responseData.message);
//   }
// };

// const addCardFormSubmissionHandler = async (e) => {
//   e.preventDefault();
//   const deckId = e.target[0].value;
//   const hanzi = e.target[1].value;
//   const pinyin = e.target[2].value;
//   const meaning = e.target[3].value;
//   body = {
//     deckId,
//     hanzi,
//     pinyin,
//     meaning,
//   };

//   const responseData = await fetchHttp(
//     '/dash/deck/addcard',
//     'POST',
//     body,
//     e.target
//   );
//   if (responseData.message) {
//     const inputs = e.target.querySelectorAll('input');
//     inputs[0].focus();
//     for (let input of inputs) {
//       input.value = '';
//     }
//     httpMessageAlert(responseData.message);

//     // Update the DOM to increment the number of cards to be learned
//     const deckLinks = document.querySelectorAll('.decks__item-main');
//     for (let dl of deckLinks) {
//       const href = dl.getAttribute('href').split('/');
//       const id = href[href.length - 1];
//       if (id === deckId) {
//         const p = dl.querySelector('p:last-of-type');
//         const numOfCards = p.textContent.split(' ')[2];
//         p.textContent = 'To learn: ' + (parseInt(numOfCards) + 1);
//       }
//     }
//   }
// };

// const addDeckToList = (title, deckId, createdAt) => {
//   const decksContainer = document.querySelector('.dash__decks');
//   const decksList = decksContainer.querySelector('ul');
//   const decksInfoContainer = document.querySelector('.dash__decks-info');
//   const decksInfoList = decksInfoContainer.querySelector('ul');

//   const deckItemTemplate = document.getElementById('deck-item-template');
//   const deckItemClone =
//     deckItemTemplate.content.firstElementChild.cloneNode(true);
//   deckItemClone
//     .querySelector('a')
//     .setAttribute('href', `/learn/deck/${deckId}`);
//   deckItemClone.querySelector('h3').textContent = title;

//   const deckInfoTemplate = document.getElementById('deck-info-template');
//   const deckInfoClone =
//     deckInfoTemplate.content.firstElementChild.cloneNode(true);
//   const deckInfoBtn = deckInfoClone.querySelector('button');
//   deckInfoBtn.textContent = title;
//   deckInfoBtn.addEventListener('click', collapsibleHandler);
//   deckInfoClone.querySelector('p:last-of-type').textContent =
//     'Learning since: ' + createdAt;
//   const editBtn = deckInfoClone.querySelector('.collapsible__edit-btn');
//   editBtn.addEventListener('click', editDeckHandler);
//   const deleteBtn = deckInfoClone.querySelector('.collapsible__delete-btn');
//   deleteBtn.addEventListener('click', deleteDeckHandler);

//   if (!decksList) {
//     decksContainer.firstElementChild.remove();
//     const deckUl = document.createElement('ul');
//     deckUl.classList.add('decks__list');
//     deckUl.append(deckItemClone);
//     decksContainer.append(deckUl);

//     decksInfoContainer.firstElementChild.remove();
//     const infoUl = document.createElement('ul');
//     infoUl.classList.add('decks__list');
//     infoUl.append(deckInfoTemplate);
//     decksInfoContainer.append(infoUl);
//   } else {
//     decksList.append(deckItemClone);
//     decksInfoList.append(deckInfoClone);
//   }

//   // Add an option for this deck to the select field on the add card form
//   const addCardTemplate = document.getElementById('add-card-template');
//   const templateSelect = addCardTemplate.content.querySelector('select');
//   const newOption = document.createElement('option');
//   newOption.value = deckId;
//   newOption.textContent = title;
//   templateSelect.append(newOption);
// };

// const deleteDeckHandler = (e) => {
//   const title = e.target
//     .closest('.decks__item')
//     .firstElementChild.textContent.trim();

//   // create delete confirmation modal
//   const template = document.getElementById('delete-deck-template');
//   const modal = template.content.firstElementChild.cloneNode(true);

//   // add listeners to the buttons
//   const buttons = modal.querySelectorAll('button');
//   buttons[0].addEventListener('click', modalCancelHandler);
//   buttons[1].addEventListener('click', deleteDeck.bind(this, title));

//   // open backdrop
//   createBackdrop(modal);
// };

// const deleteDeck = async (deckTitle) => {
//   await fetchHttp('/deck/' + deckTitle, 'DELETE');

//   // update DOM to remove deck list item and info collapsible
//   const h3List = document.querySelectorAll('.decks__item h3');
//   for (h3 of h3List) {
//     if (h3.textContent.trim() === deckTitle) {
//       h3.closest('.decks__item').remove();
//     }
//   }

//   const collapsibleBtnList = document.querySelectorAll('.collapsible');
//   for (btn of collapsibleBtnList) {
//     if (btn.textContent.trim() === deckTitle) {
//       btn.closest('.decks__item').remove();
//     }
//   }

//   closeModal();
// };

// const editDeckHandler = (e) => {
//   // initialize template
//   const template = document.getElementById('edit-deck-template');
//   const modal = template.content.firstElementChild.cloneNode(true);

//   // extract preexisting data
//   const li = e.target.closest('li');
//   const title = li.querySelector('button').textContent.trim();

//   const description = li
//     .querySelector('p')
//     .textContent.split(' ')
//     .splice(1)
//     .join(' ');
//   const isPublicString = li
//     .querySelector('p:last-of-type')
//     .textContent.split(' ')[2];
//   const isPublic = isPublicString === 'true' ? true : false;

//   // apply extracted data to modal
//   modal.querySelector('h3').textContent = title;
//   modal.querySelector('textarea').textContent = description;
//   if (isPublic) {
//     modal.querySelector('#visibilityChoice1').setAttribute('checked', true);
//   } else {
//     modal.querySelector('#visibilityChoice2').setAttribute('checked', true);
//   }

//   // add listeners
//   modal
//     .querySelectorAll('button')[0]
//     .addEventListener('click', modalCancelHandler);
//   modal
//     .querySelector('form')
//     .addEventListener('submit', editDeckSubmissionHandler.bind(this, title));

//   createBackdrop(modal);
// };

// const editDeckSubmissionHandler = async (title, e) => {
//   e.preventDefault();
//   const description = e.target[0].value;
//   const isPublic = e.target[1].checked;

//   const body = {
//     title,
//     description,
//     isPublic,
//   };

//   const responseData = await fetchHttp(
//     '/dash/deck/edit',
//     'PATCH',
//     body,
//     e.target
//   );

//   if (responseData.message) {
//     closeModal();

//     // Update DOM
//     const deckList = document.querySelectorAll('.collapsible');
//     for (let deck of deckList) {
//       if (deck.textContent.trim() === title) {
//         const li = deck.closest('li');
//         const pList = li.querySelectorAll('p');
//         console.log(pList);
//         pList[0].textContent = 'Description: ' + description;
//         pList[3].textContent = 'Publicly visible: ' + isPublic;
//       }
//     }
//   }
// };
