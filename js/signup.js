document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect data from the form
            const firstName = document.querySelector('input[placeholder="First Name"]').value;
            const lastName = document.querySelector('input[placeholder="Last Name"]').value;
            
            // Store the updated information in localStorage to use in the Assessment/Profile
            localStorage.setItem('user_fullname', `${firstName} ${lastName}`);
            localStorage.setItem('deepcare_logged_in', 'true');

            // Redirect directly to the Assessment page
            window.location.href = 'assessment.html';
        });
    }

    // Google Sign Up Simulation
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => {
            window.location.href = 'assessment.html';
        });
    }
});