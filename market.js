document.addEventListener('DOMContentLoaded', () => {
    // Simple mock filter logic
    const filterBtn = document.querySelector('.filters-section .btn-primary');
    const pricesGrid = document.getElementById('prices-grid');

    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            // Sort or shuffle just to show interaction
            const cards = Array.from(pricesGrid.children);
            for (let i = cards.length; i >= 0; i--) {
                pricesGrid.appendChild(cards[Math.random() * i | 0]);
            }
        });
    }
});
