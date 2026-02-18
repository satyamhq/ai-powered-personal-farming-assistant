/**
 * Agri1 — Live Mandi Prices (data.gov.in API)
 * Resource: Current Daily Price of Various Commodities from Various Markets
 * API: https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070
 */
document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // CONFIG
    // ============================================================
    const API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    const MAX_RESULTS = 50;

    // ============================================================
    // DOM REFS
    // ============================================================
    const cropSearchInput = document.getElementById('crop-search');
    const searchBtnMain = document.getElementById('search-btn-main');
    const stateFilter = document.getElementById('state-filter');
    const pricesGrid = document.getElementById('prices-grid');
    const resultsBar = document.getElementById('results-bar');
    const resultsCount = document.getElementById('results-count');
    const resultsDate = document.getElementById('results-date');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const errorState = document.getElementById('error-state');
    const errorMessage = document.getElementById('error-message');
    const aiInsights = document.getElementById('ai-insights');
    const aiInsightsBody = document.getElementById('ai-insights-body');
    const quickChips = document.querySelectorAll('.quick-chip');

    // ============================================================
    // CACHE
    // ============================================================
    const cache = {};

    function getCacheKey(commodity, state) {
        return (commodity || '').toLowerCase() + '|' + (state || '').toLowerCase();
    }

    function getFromCache(key) {
        var entry = cache[key];
        if (entry && (Date.now() - entry.timestamp) < CACHE_DURATION) {
            return entry.data;
        }
        return null;
    }

    function setCache(key, data) {
        cache[key] = { data: data, timestamp: Date.now() };
    }

    // ============================================================
    // INDIAN STATES LIST
    // ============================================================
    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
        'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
        'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
        'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
        'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
        'Tripura', 'Uttar Pradesh', 'Uttrakhand', 'West Bengal'
    ];

    function populateStates() {
        states.forEach(function (s) {
            var opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            stateFilter.appendChild(opt);
        });
    }

    // ============================================================
    // UI STATE MANAGEMENT
    // ============================================================
    function showLoading() {
        loadingState.style.display = 'block';
        pricesGrid.innerHTML = '';
        emptyState.style.display = 'none';
        errorState.style.display = 'none';
        resultsBar.style.display = 'none';
        aiInsights.style.display = 'none';
    }

    function hideLoading() {
        loadingState.style.display = 'none';
    }

    function showError(msg) {
        hideLoading();
        errorState.style.display = 'block';
        errorMessage.textContent = msg || 'Something went wrong. Please try again.';
        emptyState.style.display = 'none';
    }

    function showEmpty() {
        hideLoading();
        emptyState.style.display = 'block';
        resultsBar.style.display = 'none';
        aiInsights.style.display = 'none';
        pricesGrid.innerHTML = '';
    }

    // ============================================================
    // API FETCH
    // ============================================================
    async function fetchMandiPrices(commodity, state) {
        var cacheKey = getCacheKey(commodity, state);
        var cached = getFromCache(cacheKey);
        if (cached) {
            return cached;
        }

        var url = API_BASE + '?api-key=' + API_KEY + '&format=json&limit=' + MAX_RESULTS;

        if (commodity) {
            url += '&filters[commodity]=' + encodeURIComponent(commodity.trim());
        }
        if (state) {
            url += '&filters[state]=' + encodeURIComponent(state.trim());
        }

        var response = await fetch(url, { signal: AbortSignal.timeout(12000) });
        if (!response.ok) {
            throw new Error('API returned status ' + response.status);
        }
        var data = await response.json();
        var records = data.records || [];

        setCache(cacheKey, records);
        return records;
    }

    // ============================================================
    // FALLBACK DATA
    // ============================================================
    const fallbackData = [
        { state: "Delhi", district: "New Delhi", market: "Azadpur", commodity: "Wheat", variety: "Desi", arrival_date: "Today", min_price: "2000", max_price: "2300", modal_price: "2100" },
        { state: "Delhi", district: "New Delhi", market: "Okhla", commodity: "Tomato", variety: "Hybrid", arrival_date: "Today", min_price: "1200", max_price: "1800", modal_price: "1500" },
        { state: "Telangana", district: "Hyderabad", market: "Bowenpally", commodity: "Onion", variety: "Nasik", arrival_date: "Today", min_price: "2200", max_price: "2800", modal_price: "2500" },
        { state: "Telangana", district: "Warangal", market: "Enumamula", commodity: "Rice", variety: "BPT", arrival_date: "Today", min_price: "2000", max_price: "2400", modal_price: "2200" },
        { state: "Punjab", district: "Ludhiana", market: "Khanna", commodity: "Wheat", variety: "PBW-343", arrival_date: "Today", min_price: "2050", max_price: "2250", modal_price: "2150" },
        { state: "Maharashtra", district: "Nashik", market: "Nashik", commodity: "Onion", variety: "Red", arrival_date: "Today", min_price: "2100", max_price: "2500", modal_price: "2300" },
        { state: "Maharashtra", district: "Pune", market: "Pune", commodity: "Tomato", variety: "Local", arrival_date: "Today", min_price: "1200", max_price: "1600", modal_price: "1400" },
        { state: "Karnataka", district: "Kolar", market: "Kolar", commodity: "Tomato", variety: "Hybrid", arrival_date: "Today", min_price: "1100", max_price: "1600", modal_price: "1350" },
        { state: "Madhya Pradesh", district: "Indore", market: "Indore", commodity: "Soyabean", variety: "Yellow", arrival_date: "Today", min_price: "4500", max_price: "5100", modal_price: "4800" },
        { state: "Uttar Pradesh", district: "Agra", market: "Agra", commodity: "Potato", variety: "Jyoti", arrival_date: "Today", min_price: "700", max_price: "1000", modal_price: "850" },
        { state: "Gujarat", district: "Rajkot", market: "Rajkot", commodity: "Cotton", variety: "Shankar-6", arrival_date: "Today", min_price: "6200", max_price: "6900", modal_price: "6620" },
        { state: "Rajasthan", district: "Jodhpur", market: "Jodhpur", commodity: "Cumin Seed", variety: "Local", arrival_date: "Today", min_price: "25000", max_price: "30000", modal_price: "27500" },
    ];

    function getFallbackResults(commodity, state) {
        return fallbackData.filter(function (item) {
            var commodityMatch = !commodity || item.commodity.toLowerCase().includes(commodity.toLowerCase());
            var stateMatch = !state || item.state.toLowerCase() === state.toLowerCase();
            return commodityMatch && stateMatch;
        });
    }

    // ============================================================
    // RENDER PRICE CARDS
    // ============================================================
    function renderPrices(records) {
        pricesGrid.innerHTML = '';

        if (!records || records.length === 0) {
            pricesGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-light); padding:2rem;">No prices found for this search. Try a different crop or state.</p>';
            return;
        }

        records.forEach(function (item) {
            var card = document.createElement('div');
            card.className = 'price-card';

            var minPrice = formatPrice(item.min_price);
            var maxPrice = formatPrice(item.max_price);
            var modalPrice = formatPrice(item.modal_price);
            var variety = item.variety || 'Standard';
            var date = item.arrival_date || 'Recent';

            card.innerHTML =
                '<div class="price-card-header">' +
                '  <h3>' + escapeHtml(item.commodity || 'Unknown') + '</h3>' +
                '  <span class="variety-tag">' + escapeHtml(variety) + '</span>' +
                '</div>' +
                '<div class="price-card-body">' +
                '  <div class="price-card-location">' +
                '    <i class="fas fa-map-marker-alt"></i> ' +
                escapeHtml(item.market || '') + ', ' + escapeHtml(item.district || '') + ', ' + escapeHtml(item.state || '') +
                '  </div>' +
                '  <div class="price-card-prices">' +
                '    <div class="price-item">' +
                '      <div class="label">Min</div>' +
                '      <div class="value">₹' + minPrice + '</div>' +
                '    </div>' +
                '    <div class="price-item modal-price">' +
                '      <div class="label">Modal</div>' +
                '      <div class="value">₹' + modalPrice + '</div>' +
                '    </div>' +
                '    <div class="price-item">' +
                '      <div class="label">Max</div>' +
                '      <div class="value">₹' + maxPrice + '</div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="price-card-date"><i class="far fa-calendar-alt"></i> ' + escapeHtml(date) + '</div>' +
                '</div>';

            pricesGrid.appendChild(card);
        });
    }

    // ============================================================
    // AI INSIGHTS
    // ============================================================
    function generateInsights(records, cropName) {
        if (!records || records.length === 0) return;

        var prices = records.map(function (r) { return parseFloat(r.modal_price) || 0; }).filter(function (p) { return p > 0; });
        if (prices.length === 0) return;

        var avg = prices.reduce(function (a, b) { return a + b; }, 0) / prices.length;
        var min = Math.min.apply(null, prices);
        var max = Math.max.apply(null, prices);
        var spread = max - min;
        var spreadPct = avg > 0 ? ((spread / avg) * 100).toFixed(1) : 0;

        // Find best & worst markets
        var sorted = records.slice().sort(function (a, b) {
            return (parseFloat(b.modal_price) || 0) - (parseFloat(a.modal_price) || 0);
        });
        var best = sorted[0];
        var worst = sorted[sorted.length - 1];

        var html = '';

        // Price summary
        html += '<div class="insight-item"><span class="emoji">💰</span><span><span class="insight-highlight">' +
            escapeHtml(cropName || 'This crop') + '</span> prices range from ₹' +
            formatPrice(min) + ' to ₹' + formatPrice(max) + '/Qtl across ' +
            records.length + ' markets (Avg: ₹' + formatPrice(avg) + '/Qtl)</span></div>';

        // Best market
        if (best) {
            html += '<div class="insight-item"><span class="emoji">📈</span><span><span class="insight-highlight">Highest price:</span> ₹' +
                formatPrice(best.modal_price) + '/Qtl at ' +
                escapeHtml(best.market || '') + ', ' + escapeHtml(best.state || '') + '</span></div>';
        }

        // Worst market
        if (worst && records.length > 1) {
            html += '<div class="insight-item"><span class="emoji">📉</span><span><span class="insight-highlight">Lowest price:</span> ₹' +
                formatPrice(worst.modal_price) + '/Qtl at ' +
                escapeHtml(worst.market || '') + ', ' + escapeHtml(worst.state || '') + '</span></div>';
        }

        // Advice
        if (spreadPct > 30) {
            html += '<div class="insight-item"><span class="emoji">⚠️</span><span>High price variation (' + spreadPct + '%) across markets — compare mandis before selling!</span></div>';
        } else if (spreadPct > 15) {
            html += '<div class="insight-item"><span class="emoji">ℹ️</span><span>Moderate price difference (' + spreadPct + '%). Check nearby mandis for the best deal.</span></div>';
        } else {
            html += '<div class="insight-item"><span class="emoji">✅</span><span>Prices are stable across markets (only ' + spreadPct + '% variation). Good market conditions.</span></div>';
        }

        // eNAM tip
        html += '<div class="insight-item"><span class="emoji">💡</span><span>Use <a href="https://www.enam.gov.in" target="_blank">eNAM portal</a> to compare prices across all Indian mandis and sell online.</span></div>';

        // AI assistant link
        html += '<div class="insight-item"><span class="emoji">🤖</span><span>Need detailed advice? <a href="assistant.html?q=Price+of+' +
            encodeURIComponent(cropName || '') + '">Ask our AI Assistant</a> for personalized selling strategy.</span></div>';

        aiInsightsBody.innerHTML = html;
        aiInsights.style.display = 'block';
    }

    // ============================================================
    // MAIN SEARCH
    // ============================================================
    async function searchCrop(cropName, state) {
        if (!cropName && !state) {
            showEmpty();
            return;
        }

        showLoading();
        setActiveChip(cropName);

        try {
            var records = await fetchMandiPrices(cropName, state);

            hideLoading();

            if (records.length === 0) {
                // Try fallback
                records = getFallbackResults(cropName, state);
                if (records.length > 0) {
                    showResultsBar(records.length, cropName, true);
                    renderPrices(records);
                    generateInsights(records, cropName);
                } else {
                    pricesGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-light); padding:3rem;"><i class="fas fa-info-circle"></i> No prices found for <strong>' + escapeHtml(cropName || '') + '</strong>' + (state ? ' in <strong>' + escapeHtml(state) + '</strong>' : '') + '. Try a different spelling or crop name.</p>';
                    resultsBar.style.display = 'none';
                    aiInsights.style.display = 'none';
                }
                return;
            }

            showResultsBar(records.length, cropName, false);
            renderPrices(records);
            generateInsights(records, cropName);

        } catch (err) {
            console.error('API fetch error:', err);
            hideLoading();

            // Try fallback
            var fb = getFallbackResults(cropName, state);
            if (fb.length > 0) {
                showResultsBar(fb.length, cropName, true);
                renderPrices(fb);
                generateInsights(fb, cropName);
            } else {
                showError('Could not fetch live prices. The API might be temporarily unavailable. Please try again in a few minutes.');
            }
        }
    }

    function showResultsBar(count, cropName, isFallback) {
        resultsBar.style.display = 'flex';
        resultsCount.innerHTML = '<i class="fas fa-chart-bar"></i> ' + count + ' market' + (count !== 1 ? 's' : '') +
            ' found for <strong>' + escapeHtml(cropName || 'selected criteria') + '</strong>';
        if (isFallback) {
            resultsDate.innerHTML = '<span style="color:#e67e22;"><i class="fas fa-info-circle"></i> Approximate prices (API unavailable)</span>';
        } else {
            resultsDate.innerHTML = '<i class="far fa-clock"></i> Live data from Agmarknet';
        }
        emptyState.style.display = 'none';
        errorState.style.display = 'none';
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function formatPrice(val) {
        var num = parseFloat(val);
        if (isNaN(num)) return val || '—';
        return num.toLocaleString('en-IN');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function setActiveChip(cropName) {
        quickChips.forEach(function (chip) {
            if (cropName && chip.getAttribute('data-crop').toLowerCase() === cropName.toLowerCase()) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    searchBtnMain.addEventListener('click', function () {
        searchCrop(cropSearchInput.value.trim(), stateFilter.value);
    });

    cropSearchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            searchCrop(cropSearchInput.value.trim(), stateFilter.value);
        }
    });

    stateFilter.addEventListener('change', function () {
        var crop = cropSearchInput.value.trim();
        if (crop) {
            searchCrop(crop, stateFilter.value);
        }
    });

    quickChips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var crop = chip.getAttribute('data-crop');
            cropSearchInput.value = crop;
            searchCrop(crop, stateFilter.value);
        });
    });

    // ============================================================
    // INIT
    // ============================================================
    populateStates();

    // Auto-search from URL params
    var urlParams = new URLSearchParams(window.location.search);
    var autoQuery = urlParams.get('q') || urlParams.get('crop');
    if (autoQuery) {
        cropSearchInput.value = autoQuery;
        searchCrop(autoQuery, '');
    }
});
