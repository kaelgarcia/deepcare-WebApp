document.addEventListener('DOMContentLoaded', () => {
    const historyItems = document.querySelectorAll('.history-item');

    // 1. Staggered Entrance Animation
    historyItems.forEach((item, index) => {
        // Set initial state
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'all 0.5s ease forwards';
        
        // Trigger animation with delay
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // 2. Click interaction (Example: Alerting the score when clicked)
    historyItems.forEach(item => {
        item.addEventListener('click', () => {
            const date = item.querySelector('.date').textContent;
            const score = item.querySelector('.value').textContent;
            console.log(`Viewing details for ${date}: Score ${score}`);
            
            // You could redirect to a detailed report page here
            // window.location.href = `report.html?date=${date}`;
        });
    });
});