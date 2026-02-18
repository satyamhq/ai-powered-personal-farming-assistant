
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-toggle');
    const mainNav = document.querySelector('.nav-menu');

    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
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

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
// PWA Install Logic
let deferredPrompt;
const pwaPopup = document.getElementById('pwa-install-popup');
const installBtn = document.getElementById('pwa-install-btn');
const dismissBtn = document.getElementById('pwa-dismiss-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    if (pwaPopup) {
        setTimeout(() => {
             // Check if user has already dismissed it in this session (optional, but good UX)
             if (!sessionStorage.getItem('pwa-dismissed')) {
                 pwaPopup.style.display = 'block';
             }
        }, 2000); // Show after 2 seconds
    }
});

if (installBtn) {
    installBtn.addEventListener('click', (e) => {
        // Hide our user interface that shows our A2HS button
        pwaPopup.style.display = 'none';
        // Show the prompt
        if (deferredPrompt) {
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        }
    });
}

if (dismissBtn) {
    dismissBtn.addEventListener('click', (e) => {
        pwaPopup.style.display = 'none';
        sessionStorage.setItem('pwa-dismissed', 'true');
    });
}
