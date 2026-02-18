
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

    // Header Download Button Logic (Global)
    // Download Button Logic (Global via Class)
    // Use event delegation or querySelectorAll
    document.addEventListener('click', async (e) => {
        if (e.target.closest('.install-app-btn') || e.target.closest('#header-download-btn')) {
            // Ensure popup is injected
            if (!document.getElementById('pwa-install-popup')) {
                injectPWAPopup();
            }

            const pwaPopup = document.getElementById('pwa-install-popup');

            if (deferredPrompt) {
                deferredPrompt.prompt();
                const choiceResult = await deferredPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    // User accepted A2HS
                }
                deferredPrompt = null;
                if (pwaPopup) pwaPopup.style.display = 'none';
            } else {
                // Show popup with manual instructions context if helpful, or just show it
                if (pwaPopup) {
                    pwaPopup.style.display = 'block';
                } else {
                    alert('To install the app, look for "Add to Home Screen" in your browser menu.');
                }
            }
        }
    });

    // Force show popup after a delay if not installed and not dismissed
    // This runs on every page load to ensure visibility
    if (!sessionStorage.getItem('pwa-dismissed') && !window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => {
            if (!document.getElementById('pwa-install-popup')) {
                injectPWAPopup();
            }
            const pwaPopup = document.getElementById('pwa-install-popup');
            if (pwaPopup) pwaPopup.style.display = 'block';
        }, 3000); // Show after 3 seconds
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
                // ServiceWorker registration successful
            })
            .catch(err => {
                // ServiceWorker registration failed
            });
    });
}
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
                    // User accepted
                } else {
                    // User dismissed
                }
                deferredPrompt = null;
            } else {
                // Fallback for when purely manual install is needed or prompt not ready
                alert('To install:\n\n1. Tap the Share/Menu button in your browser.\n2. Select "Add to Home Screen".');
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
    // beforeinstallprompt fired
    // We already force show the popup in DOMContentLoaded, so we might not need to do anything here
    // other than capture the event.
});

// Check if app is already installed
window.addEventListener('appinstalled', () => {
    // PWA installed
    const pwaPopup = document.getElementById('pwa-install-popup');
    if (pwaPopup) pwaPopup.style.display = 'none';
});

// --- Page Specific Logic Merged ---

// Contact Page Logic
document.addEventListener('DOMContentLoaded', function () {
    var contactForm = document.getElementById('contact-form');
    var successMsg = document.getElementById('success-msg');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            contactForm.style.display = 'none';
            if (successMsg) successMsg.style.display = 'block';
        });
    }
});

// FAQ Page Logic
function toggleFaq(el) {
    var ans = el.nextElementSibling;
    var wasOpen = el.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-q').forEach(function (q) { q.classList.remove('open'); });
    document.querySelectorAll('.faq-a').forEach(function (a) { a.classList.remove('open'); });

    // Toggle clicked
    if (!wasOpen) {
        el.classList.add('open');
        ans.classList.add('open');
    }
}
// Expose to window for onclick handlers in HTML
window.toggleFaq = toggleFaq;


// Account Page Logic
document.addEventListener('DOMContentLoaded', function () {
    // Only run if on account page elements exist
    var uname = document.getElementById('uname');
    if (uname) {
        var name = localStorage.getItem('agri1_user_name') || 'Farmer';
        var email = localStorage.getItem('agri1_user_email') || 'farmer@agri1.com';

        var uemail = document.getElementById('uemail');
        var pname = document.getElementById('pname');
        var pemail = document.getElementById('pemail');

        uname.textContent = name;
        if (uemail) uemail.textContent = email;
        if (pname) pname.textContent = name;
        if (pemail) pemail.textContent = email;
    }
});

// Home Page Logic (Merged from index.js)
document.addEventListener('DOMContentLoaded', () => {
    // Welcome Message based on time
    const welcomeMessageElement = document.getElementById('welcome-message');
    if (welcomeMessageElement) {
        const hour = new Date().getHours();
        let greeting;
        if (hour < 12) greeting = "Good Morning";
        else if (hour < 18) greeting = "Good Afternoon";
        else greeting = "Good Evening";
        welcomeMessageElement.innerHTML = `${greeting}, Welcome to <span style="color:var(--secondary)">Agri1</span>`;
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
