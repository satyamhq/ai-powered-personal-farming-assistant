document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('nav ul');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navList.classList.toggle('show');
        });
    }

    // Welcome Message based on time
    const welcomeMessageElement = document.getElementById('welcome-message');
    if (welcomeMessageElement) {
        const hour = new Date().getHours();
        let greeting;

        if (hour < 12) {
            greeting = "Good Morning";
        } else if (hour < 18) {
            greeting = "Good Afternoon";
        } else {
            greeting = "Good Evening";
        }

        welcomeMessageElement.textContent = `${greeting}, Welcome to Agri1`;
    }
    // Search Bar Redirection
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    function handleSearch() {
        const query = searchInput.value.trim();
        if (query) {
            window.location.href = `assistant.html?q=${encodeURIComponent(query)}`;
        }
    }

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
});
