// js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Redirect to login if not logged in
    if (!localStorage.getItem('deepcare_logged_in')) {
        window.location.href = 'login.html';
        return;
    }

    // Show first name in greeting
    const firstName = localStorage.getItem('user_first_name') || 
                      localStorage.getItem('user_fullname') || 
                      'User';
    const usernameEl = document.getElementById('username');
    if (usernameEl) usernameEl.textContent = firstName;

    // Start Chat button
    const chatBtn = document.querySelector('.btn-start');
    if (chatBtn) {
        chatBtn.addEventListener('click', () => {
            window.location.href = 'chat.html';
        });
    }
});
