document.addEventListener('DOMContentLoaded', () => {
    const priceList = document.getElementById('price-list');
    const searchInput = document.getElementById('crop-search');
    const mobileCardsContainer = document.getElementById('market-cards-mobile');

    const marketData = [
        { crop: 'Wheat', mandi: 'Azadpur, Delhi', price: 2150, trend: 'up' },
        { crop: 'Rice (Basmati)', mandi: 'Karnal, Haryana', price: 3800, trend: 'stable' },
        { crop: 'Maize', mandi: 'Gulou, Bihar', price: 1900, trend: 'down' },
        { crop: 'Cotton', mandi: 'Rajkot, Gujarat', price: 6200, trend: 'up' },
        { crop: 'Mustard', mandi: 'Jaipur, Rajasthan', price: 5400, trend: 'up' },
        { crop: 'Soybean', mandi: 'Indore, MP', price: 4300, trend: 'down' },
        { crop: 'Onion', mandi: 'Nashik, Maharashtra', price: 1200, trend: 'up' },
        { crop: 'Potato', mandi: 'Agra, UP', price: 850, trend: 'stable' },
        { crop: 'Tomato', mandi: 'Kolar, Karnataka', price: 1500, trend: 'down' },
        { crop: 'Turmeric', mandi: 'Erode, TN', price: 7200, trend: 'up' }
    ];

    function renderTable(data) {
        priceList.innerHTML = '';
        mobileCardsContainer.innerHTML = '';

        if (data.length === 0) {
            priceList.innerHTML = '<tr><td colspan="4" style="text-align:center;">No crops found</td></tr>';
            mobileCardsContainer.innerHTML = '<p style="text-align:center;">No crops found</p>';
            return;
        }

        data.forEach(item => {
            // Table Row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.crop}</td>
                <td>${item.mandi}</td>
                <td>₹${item.price}</td>
                <td>${getTrendIcon(item.trend)}</td>
            `;
            priceList.appendChild(row);

            // Mobile Card
            const card = document.createElement('div');
            card.className = 'market-card';
            card.innerHTML = `
                <h3>${item.crop} <span>₹${item.price}</span></h3>
                <p>Mandi: <span>${item.mandi}</span></p>
                <p>Trend: <span>${getTrendIcon(item.trend)}</span></p>
            `;
            mobileCardsContainer.appendChild(card);
        });
    }

    function getTrendIcon(trend) {
        if (trend === 'up') return '<span class="trend-up"><i class="fas fa-arrow-up"></i> Up</span>';
        if (trend === 'down') return '<span class="trend-down"><i class="fas fa-arrow-down"></i> Down</span>';
        return '<span class="trend-stable"><i class="fas fa-minus"></i> Stable</span>';
    }

    // Initial Render
    renderTable(marketData);

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredData = marketData.filter(item =>
            item.crop.toLowerCase().includes(searchTerm) ||
            item.mandi.toLowerCase().includes(searchTerm)
        );
        renderTable(filteredData);
    });
});