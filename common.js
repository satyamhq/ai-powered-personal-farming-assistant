
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
// PWA Install Logic
let deferredPrompt;

// Function to inject PWA Popup HTML
function injectPWAPopup() {
    if (document.getElementById('pwa-install-popup')) return; // Already exists

    const popupHTML = `
    <div id="pwa-install-popup" class="pwa-popup" style="display: none;">
        <div class="pwa-popup-content">
            <div class="pwa-icon">
                <img src="favicon_io/android-chrome-192x192.png" alt="Agri1 Logo" onerror="this.src='favicon_io/favicon-32x32.png'">
            </div>
            <div class="pwa-details">
                <h3>Install Agri1 App</h3>
                <p>Get the best experience with our app.</p>
            </div>
            <div class="pwa-actions">
                <button id="pwa-install-btn" class="btn btn-primary">Install</button>
                <button id="pwa-dismiss-btn" class="btn btn-ghost">Maybe Later</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', popupHTML);
    attachPWAEvents();
}

function attachPWAEvents() {
    const pwaPopup = document.getElementById('pwa-install-popup');
    const installBtn = document.getElementById('pwa-install-btn');
    const dismissBtn = document.getElementById('pwa-dismiss-btn');

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            }
            if (pwaPopup) pwaPopup.style.display = 'none';
        });
    }

    if (dismissBtn) {
        dismissBtn.addEventListener('click', () => {
            if (pwaPopup) pwaPopup.style.display = 'none';
            sessionStorage.setItem('pwa-dismissed', 'true');
        });
    }
}

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('beforeinstallprompt fired');

    if (!sessionStorage.getItem('pwa-dismissed')) {
        // Inject popup if not already present
        injectPWAPopup();

        const pwaPopup = document.getElementById('pwa-install-popup');
        if (pwaPopup) {
            setTimeout(() => {
                pwaPopup.style.display = 'block';
            }, 2000);
        }
    }
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    const pwaPopup = document.getElementById('pwa-install-popup');
    if (pwaPopup) pwaPopup.style.display = 'none';
});

// Forcing popup for debugging/demo if needed (Optional: Remove in prod)
// Check if not standalone and not dismissed
if (!window.matchMedia('(display-mode: standalone)').matches) {
    window.addEventListener('load', () => {
        // If no prompt fired after 3 seconds, logging it (logic remains driven by beforeinstallprompt for compliance)
        setTimeout(() => {
            if (!deferredPrompt) console.log('PWA prompt did not fire yet. Check HTTPS/Manifest.');
        }, 3000);
    });
}
