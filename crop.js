document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crop-form');
    const resultsContainer = document.getElementById('recommendations');

    const recommendedCrops = {
        'clay-kharif': [
            { name: 'Rice (Paddy)', reason: 'High water retention of clay soil is perfect for paddy.', yield: '40-50 Qtl/acre' },
            { name: 'Cotton', reason: 'Suitable for deep clay soils.', yield: '20-25 Qtl/acre' }
        ],
        'clay-rabi': [
            { name: 'Wheat', reason: 'Clay loam is ideal for wheat cultivation.', yield: '35-40 Qtl/acre' },
            { name: 'Chickpea', reason: 'Thrives in residual moisture.', yield: '10-15 Qtl/acre' }
        ],
        'sandy-kharif': [
            { name: 'Bajra (Pearl Millet)', reason: 'Drought tolerant and prefers light soils.', yield: '15-20 Qtl/acre' },
            { name: 'Groundnut', reason: 'Pods develop well in loose sandy soil.', yield: '18-22 Qtl/acre' }
        ],
        'sandy-rabi': [
            { name: 'Mustard', reason: 'Requires less water and light soil.', yield: '12-15 Qtl/acre' },
            { name: 'Potato', reason: 'Tubers expand easily in loose soil.', yield: '200-250 Qtl/acre' }
        ],
        'loamy-kharif': [
            { name: 'Maize', reason: 'Loam offers perfect drainage and nutrient cooling.', yield: '30-40 Qtl/acre' },
            { name: 'Soybean', reason: 'Balances moisture well.', yield: '20-25 Qtl/acre' }
        ],
        'loamy-rabi': [
            { name: 'Tomato', reason: 'Rich loamy soil ensures good fruit set.', yield: '25-30 Tons/acre' },
            { name: 'Wheat', reason: 'Versatile soil for grain crops.', yield: '35-40 Qtl/acre' }
        ],
        // Default fallbacks
        'black-kharif': [{ name: 'Cotton', reason: 'Black cotton soil is famous for this.', yield: '25-30 Qtl/acre' }],
        'black-rabi': [{ name: 'Sorghum', reason: 'Holds moisture well for winter.', yield: '20-25 Qtl/acre' }]
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
        const crops = recommendedCrops[key] || recommendedCrops[`sandy-${season}`]; // Fallback

        displayResults(crops);
    });

    function displayResults(crops) {
        resultsContainer.innerHTML = '';

        if (!crops || crops.length === 0) {
            resultsContainer.innerHTML = '<p>No specific recommendations found. Try different parameters.</p>';
            return;
        }

        crops.forEach(crop => {
            const card = document.createElement('div');
            card.className = 'crop-card'; // Make sure this class is styled or re-use existing
            card.style.background = 'var(--white)';
            card.style.padding = '1.5rem';
            card.style.borderRadius = 'var(--radius)';
            card.style.border = '1px solid var(--border-color)';
            card.style.boxShadow = 'var(--shadow-sm)';

            card.innerHTML = `
                <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">${crop.name}</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Why:</strong> ${crop.reason}</p>
                <p><strong>Expected Yield:</strong> ${crop.yield}</p>
                <button class="btn btn-outline" style="margin-top: 1rem; font-size: 0.8rem;" onclick="location.href='assistant.html?q=How to grow ${crop.name}'">View Detailed Guide</button>
            `;
            resultsContainer.appendChild(card);
        });
    }
});
