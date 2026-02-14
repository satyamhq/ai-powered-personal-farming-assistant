
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('show');
        });
    }

    // Load Google Translate Script dynamically
    if (document.getElementById('google_translate_element')) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
    }
});

// Google Translate Init Function (global)
window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,hi',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE
    }, 'google_translate_element');
};
