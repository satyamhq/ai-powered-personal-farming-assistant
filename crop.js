document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crop-form');
    const resultsArea = document.getElementById('recommendations-area');
    const resultsGrid = document.getElementById('results-grid');

    const recommendedCrops = {
        'clay-kharif': [
            { name: 'Rice (Paddy)', reason: 'High water retention of clay soil is perfect for paddy.', yield: '40-50 Qtl/acre', icon: 'fa-seedling' },
            { name: 'Cotton', reason: 'Suitable for deep clay soils.', yield: '20-25 Qtl/acre', icon: 'fa-tshirt' }
        ],
        'clay-rabi': [
            { name: 'Wheat', reason: 'Clay loam is ideal for wheat cultivation.', yield: '35-40 Qtl/acre', icon: 'fa-bread-slice' },
            { name: 'Chickpea', reason: 'Thrives in residual moisture.', yield: '10-15 Qtl/acre', icon: 'fa-cookie' }
        ],
        'sandy-kharif': [
            { name: 'Bajra (Pearl Millet)', reason: 'Drought tolerant and prefers light soils.', yield: '15-20 Qtl/acre', icon: 'fa-leaf' },
            { name: 'Groundnut', reason: 'Pods develop well in loose sandy soil.', yield: '18-22 Qtl/acre', icon: 'fa-utensils' }
        ],
        'sandy-rabi': [
            { name: 'Mustard', reason: 'Requires less water and light soil.', yield: '12-15 Qtl/acre', icon: 'fa-bottle-droplet' },
            { name: 'Potato', reason: 'Tubers expand easily in loose soil.', yield: '200-250 Qtl/acre', icon: 'fa-carrot' }
        ],
        'loamy-kharif': [
            { name: 'Maize', reason: 'Loam offers perfect drainage and nutrient balance.', yield: '30-40 Qtl/acre', icon: 'fa-corn' }, // fa-corn might not exist in free set, fallback used
            { name: 'Soybean', reason: 'Balances moisture well.', yield: '20-25 Qtl/acre', icon: 'fa-leaf' }
        ],
        'loamy-rabi': [
            { name: 'Tomato', reason: 'Rich loamy soil ensures good fruit set.', yield: '25-30 Tons/acre', icon: 'fa-apple-alt' },
            { name: 'Wheat', reason: 'Versatile soil for grain crops.', yield: '35-40 Qtl/acre', icon: 'fa-bread-slice' }
        ],
        'black-kharif': [
            { name: 'Cotton', reason: 'Black cotton soil holds moisture for long periods.', yield: '25-30 Qtl/acre', icon: 'fa-tshirt' },
            { name: 'Soybean', reason: 'Excellent growth in black soil.', yield: '20-25 Qtl/acre', icon: 'fa-leaf' }
        ],
        'black-rabi': [
            { name: 'Sorghum (Jowar)', reason: 'Uses residual moisture in black soil effectively.', yield: '20-25 Qtl/acre', icon: 'fa-leaf' },
            { name: 'Safflower', reason: 'Deep rooted, good for black soil.', yield: '10-12 Qtl/acre', icon: 'fa-sun' }
        ],
        'red-kharif': [
            { name: 'Groundnut', reason: 'Red soil is aerated and good for root penetration.', yield: '15-20 Qtl/acre', icon: 'fa-utensils' },
            { name: 'Ragi', reason: 'Hardy crop for red soil regions.', yield: '12-15 Qtl/acre', icon: 'fa-circle' }
        ],
        'red-rabi': [
            { name: 'Horse Gram', reason: 'Can grow in low moisture red soils.', yield: '8-10 Qtl/acre', icon: 'fa-leaf' }
        ]
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const soil = document.getElementById('soil-type').value;
        const season = document.getElementById('season').value;

        if (!soil || !season) {
            alert("Please select both Soil Type and Season.");
            return;
        }

        const key = `${soil}-${season}`;
        // Fallback logic
        let crops = recommendedCrops[key];
        if (!crops) {
            // Try partial match or generic fallback
            crops = recommendedCrops[`sandy-${season}`] || [];
        }

        displayResults(crops);
    });

    function displayResults(crops) {
        resultsGrid.innerHTML = '';
        resultsArea.style.display = 'block';

        if (!crops || crops.length === 0) {
            resultsGrid.innerHTML = `
                <div class="crop-card" style="grid-column: 1/-1; text-align: center; border-left: 4px solid var(--text-muted);">
                    <h3>No specific recommendations</h3>
                    <p>Try different soil or season combinations, or ask our AI Assistant.</p>
                </div>`;
            return;
        }

        crops.forEach(crop => {
            const card = document.createElement('div');
            card.className = 'crop-card';

            // Icon handling (fa-corn is not standard free, using fallbacks)
            let iconClass = crop.icon || 'fa-leaf';
            if (crop.name.includes('Maize')) iconClass = 'fa-candy-cane'; // Visually distinct fallback

            card.innerHTML = `
                <h3><i class="fas ${iconClass}"></i> ${crop.name}</h3>
                <p>${crop.reason}</p>
                <div style="margin-top: var(--space-sm);">
                    <span class="crop-stat"><i class="fas fa-chart-bar"></i> Yield: ${crop.yield}</span>
                </div>
                <button class="btn btn-outline" style="width: 100%; margin-top: var(--space-md); font-size: 0.85rem;" 
                    onclick="location.href='assistant.html?q=How to grow ${encodeURIComponent(crop.name)}'">
                    <i class="fas fa-book-open"></i> View Guide
                </button>
            `;
            resultsGrid.appendChild(card);
        });

        // Scroll to results
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    }
});
