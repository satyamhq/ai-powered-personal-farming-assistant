document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle logic moved to nav.js

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
});
