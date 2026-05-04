document.addEventListener('DOMContentLoaded', () => {
    const doctorCards = document.querySelectorAll('.doctor-card');

    // 1. Staggered Entrance Animation
    doctorCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease-out forwards';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // 2. Navigation Logic to Profile
    doctorCards.forEach(card => {
        card.addEventListener('click', () => {
            // Adding a small delay for a smoother visual transition
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                window.location.href = 'doctors-profile.html';
            }, 100);
        });
    });
});