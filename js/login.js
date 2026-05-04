document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simulating authentication
            const username = document.getElementById('username').value;
            
            // Save basic session info if needed
            localStorage.setItem('deepcare_logged_in', 'true');
            
            // Redirect to profile
            window.location.href = 'profile.html';
        });
    }

    // Google Login Simulation
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }
});