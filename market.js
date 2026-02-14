
document.addEventListener('DOMContentLoaded', () => {

    // Mock Data Source for Indian Mandi Prices
    const marketData = [
        { state: "Delhi", mandi: "Azadpur", commodity: "Wheat", price: 2100, unit: "Qtl", trend: "up", change: 2.5 },
        { state: "Delhi", mandi: "Okhla", commodity: "Tomato", price: 1500, unit: "Qtl", trend: "down", change: 1.2 },
        { state: "Telangana", mandi: "Bowenpally", commodity: "Onion", price: 2500, unit: "Qtl", trend: "up", change: 5.0 },
        { state: "Telangana", mandi: "Kurnool", commodity: "Rice (Paddy)", price: 2200, unit: "Qtl", trend: "stable", change: 0 },
        { state: "Telangana", mandi: "Warangal", commodity: "Chilli (Red)", price: 15000, unit: "Qtl", trend: "up", change: 1.5 },
        { state: "Punjab", mandi: "Khanna", commodity: "Wheat", price: 2150, unit: "Qtl", trend: "stable", change: 0.5 },
        { state: "Punjab", mandi: "Ludhiana", commodity: "Potato", price: 900, unit: "Qtl", trend: "down", change: 3.0 },
        { state: "Maharashtra", mandi: "Nashik", commodity: "Onion", price: 2300, unit: "Qtl", trend: "up", change: 4.2 },
        { state: "Maharashtra", mandi: "Pune", commodity: "Tomato", price: 1400, unit: "Qtl", trend: "down", change: 2.1 },
        { state: "Maharashtra", mandi: "Nagpur", commodity: "Orange", price: 4000, unit: "Qtl", trend: "stable", change: 0 },
        { state: "Karnataka", mandi: "Kolar", commodity: "Tomato", price: 1350, unit: "Qtl", trend: "up", change: 1.8 },
        { state: "Karnataka", mandi: "Shimoga", commodity: "Arecanut", price: 45000, unit: "Qtl", trend: "up", change: 0.5 },
        { state: "Madhya Pradesh", mandi: "Indore", commodity: "Soybean", price: 4800, unit: "Qtl", trend: "down", change: 1.0 },
        { state: "Uttar Pradesh", mandi: "Agra", commodity: "Potato", price: 850, unit: "Qtl", trend: "stable", change: 0.2 },
    ];

    const stateFilter = document.getElementById('state-filter');
    const commodityFilter = document.getElementById('commodity-filter');
    const pricesGrid = document.getElementById('prices-grid');

    // 1. Populate Filters
    function populateFilters() {
        const states = [...new Set(marketData.map(item => item.state))].sort();
        const commodities = [...new Set(marketData.map(item => item.commodity))].sort();

        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });

        commodities.forEach(comm => {
            const option = document.createElement('option');
            option.value = comm;
            option.textContent = comm;
            commodityFilter.appendChild(option);
        });
    }

    // 2. Render Prices
    function renderPrices(data) {
        pricesGrid.innerHTML = '';

        if (data.length === 0) {
            pricesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-light); padding: 2rem;">No market data found for selected filters.</p>';
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'price-card';
            card.style.background = 'var(--white)';
            card.style.padding = '1.5rem';
            card.style.borderRadius = 'var(--radius)';
            card.style.border = '1px solid var(--border-color)';
            card.style.transition = 'transform 0.2s';

            // Mouse hover effect (inline for simplicity or use CSS class)
            card.onmouseover = () => card.style.transform = 'translateY(-3px)';
            card.onmouseout = () => card.style.transform = 'translateY(0)';

            let trendIcon = '';
            let trendColor = '';

            if (item.trend === 'up') {
                trendIcon = '<i class="fas fa-arrow-up"></i>';
                trendColor = 'green';
            } else if (item.trend === 'down') {
                trendIcon = '<i class="fas fa-arrow-down"></i>';
                trendColor = 'red';
            } else {
                trendIcon = '<i class="fas fa-minus"></i>';
                trendColor = 'gray';
            }

            card.innerHTML = `
                <h3 style="color: var(--primary-color); margin-bottom: 0.25rem;">${item.commodity}</h3>
                <p style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem;">
                    <i class="fas fa-map-marker-alt"></i> ${item.mandi}, ${item.state}
                </p>
                <div style="font-size: 1.5rem; font-weight: 700;">₹ ${item.price.toLocaleString()} / ${item.unit}</div>
                <div style="color: ${trendColor}; font-size: 0.85rem; margin-top: 0.5rem; font-weight: 500;">
                    ${trendIcon} ${item.change}%
                </div>
            `;
            pricesGrid.appendChild(card);
        });
    }

    // 3. Filter Logic
    function filterData() {
        const selectedState = stateFilter.value;
        const selectedCommodity = commodityFilter.value;

        const filtered = marketData.filter(item => {
            const stateMatch = selectedState ? item.state === selectedState : true;
            const commMatch = selectedCommodity ? item.commodity === selectedCommodity : true;
            return stateMatch && commMatch;
        });

        renderPrices(filtered);
    }

    // Attach Listeners
    stateFilter.addEventListener('change', filterData);
    commodityFilter.addEventListener('change', filterData);

    // Initial Load
    populateFilters();
    renderPrices(marketData);
});
