const signupForm = document.querySelector('.signup-form');

const formSubmissionHandler = async (e) => {
  e.preventDefault();

  const token = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');
  const username = e.target[0].value;
  const email = e.target[1].value;
  const password = e.target[2].value;
  const confirmPassword = e.target[3].value;
  
  try {
    const response = await fetch('/signup', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'CSRF-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirmPassword,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message);
    }

    window.location.replace('/dash');
  } catch (err) {
    const error = signupForm.querySelector('h3');
    if (!error) {
      const errorEl = document.createElement('h3');
      errorEl.innerHTML = err;
      signupForm.insertBefore(errorEl, signupForm.firstChild);
    } else {
      error.innerHTML = err;
    }
  }
};

signupForm.addEventListener('submit', formSubmissionHandler);
