document.addEventListener('DOMContentLoaded', () => {
    // Example: Dynamically setting the username
    const usernameElement = document.getElementById('username');
    const mockUser = "Kael"; // This could come from a login session later
    
    if (usernameElement) {
        usernameElement.textContent = mockUser;
    }

    // Button interaction
    const chatBtn = document.querySelector('.btn-start');
    chatBtn.addEventListener('click', () => {
        alert("Starting AI Chat Session...");
    });
});