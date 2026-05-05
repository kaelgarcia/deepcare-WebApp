// Google callback MUST be global (outside DOMContentLoaded) 
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
            window.location.href = 'main.html';
        } else {
            const errorEl = document.getElementById('login-error');
            if (errorEl) { errorEl.textContent = result.message; errorEl.style.display = 'block'; }
        }
    } catch (err) {
        console.error('Google login error:', err);
        alert('Could not reach the server. Make sure WAMP is running.');
    }
};

//  Normal Login 
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorEl   = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorEl.style.display = 'none';

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const btn      = loginForm.querySelector('.btn-login');

            btn.disabled    = true;
            btn.textContent = 'Signing in…';

            try {
                const response = await fetch('../backend/login.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (result.success) {
                    saveUser(result);
                    window.location.href = 'main.html';
                } else {
                    showError(result.message || 'Login failed. Please try again.');
                }
            } catch (err) {
                showError('Could not reach the server. Make sure WAMP is running.');
            } finally {
                btn.disabled    = false;
                btn.textContent = 'Sign In';
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
