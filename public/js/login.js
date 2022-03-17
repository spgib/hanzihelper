const loginForm = document.querySelector('.login-form');

const formSubmissionHandler = async (e) => {
  e.preventDefault();

  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');
  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'CSRF-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    window.location.replace('/dash');
  } catch (err) {
    const error = loginForm.querySelector('h3');
    if (error) {
      error.innerHTML = err;
    } else {
      const errorEl = document.createElement('h3');
      errorEl.innerHTML = err;
      loginForm.insertBefore(errorEl, loginForm.firstChild);
    }
  }
};

loginForm.addEventListener('submit', formSubmissionHandler);
