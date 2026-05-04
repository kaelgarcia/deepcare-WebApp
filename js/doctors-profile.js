document.addEventListener('DOMContentLoaded', () => {
    const profileFrame = document.querySelector('.glass-frame');
    const contentSections = document.querySelectorAll('.left-col, .right-col');

    // 1. Profile Frame Entrance
    if (profileFrame) {
        profileFrame.style.opacity = '0';
        profileFrame.style.transform = 'scale(0.95)';
        profileFrame.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        
        setTimeout(() => {
            profileFrame.style.opacity = '1';
            profileFrame.style.transform = 'scale(1)';
        }, 100);
    }

    // 2. Content Section Fade-in
    contentSections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transition = 'opacity 0.8s ease forwards';
        section.style.transitionDelay = `${0.3 + (index * 0.2)}s`;
        
        setTimeout(() => {
            section.style.opacity = '1';
        }, 100);
    });
});