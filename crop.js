document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crop-form');
    const resultSection = document.getElementById('result-section');
    const cropNameEl = document.getElementById('crop-name');
    const cropDescEl = document.getElementById('crop-description');
    const cropIconContainer = document.querySelector('.crop-icon');

    // Dummy Data for Recommendations
    const recommendations = {
        'clay-kharif': { name: 'Rice', icon: 'fa-bowl-rice', desc: 'Rice thrives in clay soil with high water retention during monsoons.' },
        'cay-rabi': { name: 'Wheat', icon: 'fa-wheat', desc: 'Wheat is ideal for clay soil in winter seasons.' },
        'black-kharif': { name: 'Cotton', icon: 'fa-tshirt', desc: 'Black soil is perfect for cotton cultivation.' },
        'black-rabi': { name: 'Chickpeas', icon: 'fa-cookie', desc: 'Chickpeas grow well in black soil during winter.' },
        'sandy-zaid': { name: 'Watermelon', icon: 'fa-apple-alt', desc: 'Sandy soil is excellent for melons in summer.' }, // Apple icon as placeholder if needed
        'loamy-rabi': { name: 'Mustard', icon: 'fa-bottle-droplet', desc: 'Loamy soil supports mustard growth perfectly.' },
        'loamy-kharif': { name: 'Sugarcane', icon: 'fa-candy-cane', desc: 'Sugarcane yields are high in loamy soil.' },
        'red-kharif': { name: 'Groundnut', icon: 'fa-cubes', desc: 'Red soil is suitable for groundnuts.' },
        'default': { name: 'Maize', icon: 'fa-corn', desc: 'Maize is a versatile crop suitable for these conditions.' }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const soil = document.getElementById('soilType').value;
        const season = document.getElementById('season').value;

        // Simulate processing delay
        const btn = form.querySelector('.recommend-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Analyzing...';
        btn.disabled = true;

        setTimeout(() => {
            const key = `${soil}-${season}`;
            const rec = recommendations[key] || recommendations['default'];

            cropNameEl.textContent = rec.name;
            cropDescEl.textContent = rec.desc;

            // Update icon dynamically
            cropIconContainer.innerHTML = `<i class="fas ${rec.icon}"></i>`;

            resultSection.classList.remove('hidden');

            btn.textContent = originalText;
            btn.disabled = false;

            // Scroll to result
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    });
});
