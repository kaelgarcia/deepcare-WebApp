// Google callback 
window.handleGoogleLogin = async function(response) {
    const idToken = response.credential;

    try {
        const res    = await fetch('../backend/google_auth.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ id_token: idToken })
        });
        const result = await res.json();

        if (result.success) {
            saveUser(result);
            window.location.href = 'assessment.html';
        } else {
            const errorEl = document.getElementById('signup-error');
            if (errorEl) { errorEl.textContent = result.message; errorEl.style.display = 'block'; }
        }
    } catch (err) {
        console.error('Google signup error:', err);
        alert('Could not reach the server. Make sure WAMP is running.');
    }
};

// Normal Signup
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const errorEl    = document.getElementById('signup-error');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const firstName = document.getElementById('firstName').value.trim();
            const lastName  = document.getElementById('lastName').value.trim();
            const username  = document.getElementById('username').value.trim();
            const email     = document.getElementById('email').value.trim();
            const password  = document.getElementById('password').value;
            const phone     = document.getElementById('phone').value.trim();
            const btn       = signupForm.querySelector('.btn-signup');

            btn.disabled    = true;
            btn.textContent = 'Creating account…';

            try {
                const response = await fetch('../backend/signup.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ first_name: firstName, last_name: lastName, username, email, password, phone })
                });

                const result = await response.json();

                if (result.success) {
                    saveUser(result);
                    window.location.href = 'assessment.html';
                } else {
                    showError(result.message || 'Sign up failed. Please try again.');
                }
            } catch (err) {
                showError('Could not reach the server. Make sure WAMP is running.');
            } finally {
                btn.disabled    = false;
                btn.textContent = 'Sign up';
            }
        });
    }

    function showError(message) {
        errorEl.textContent   = message;
        errorEl.style.display = 'block';
    }
});

// Shared helper (global so Google callback can use it) 
function saveUser(data) {
    localStorage.setItem('deepcare_logged_in', 'true');
    localStorage.setItem('user_id',         data.user_id);
    localStorage.setItem('user_fullname',   data.fullname);
    localStorage.setItem('user_first_name', data.first_name);
    localStorage.setItem('user_last_name',  data.last_name);
    localStorage.setItem('user_username',   data.username);
    localStorage.setItem('user_email',      data.email);
    localStorage.setItem('user_phone',      data.phone || '');
}
