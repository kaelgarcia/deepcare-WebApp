document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.product-card:not(.empty)');
    
    // Animation for product cards loading
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(15px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease-out forwards';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 150);
    });
});

function openCart() {
    console.log("Opening shopping cart...");
    // Future implementation for cart view
}