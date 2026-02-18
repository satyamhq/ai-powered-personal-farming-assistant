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
    // USER LOCATION (for nearest mandi)
    // ============================================================
    var userLat = null;
    var userLon = null;

    function detectUserLocation() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                userLat = pos.coords.latitude;
                userLon = pos.coords.longitude;
                console.log('Market: User location detected', userLat, userLon);
            },
            function () { console.log('Market: Location denied, no distance sorting'); },
            { timeout: 5000 }
        );
    }
    detectUserLocation();

    // Haversine distance in km
    function getDistanceKm(lat1, lon1, lat2, lon2) {
        var R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // Major Indian mandi/city coordinates lookup
    var mandiCoords = {
        'azadpur': [28.7041, 77.1025], 'okhla': [28.5355, 77.2720], 'new delhi': [28.6139, 77.2090],
        'delhi': [28.6139, 77.2090], 'mumbai': [19.0760, 72.8777], 'pune': [18.5204, 73.8567],
        'nashik': [19.9975, 73.7898], 'nagpur': [21.1458, 79.0882], 'solapur': [17.6599, 75.9064],
        'kolhapur': [16.7050, 74.2433], 'aurangabad': [19.8762, 75.3433],
        'hyderabad': [17.3850, 78.4867], 'bowenpally': [17.4625, 78.4712],
        'warangal': [17.9784, 79.5941], 'karimnagar': [18.4386, 79.1288],
        'chennai': [13.0827, 80.2707], 'madurai': [9.9252, 78.1198], 'coimbatore': [11.0168, 76.9558],
        'salem': [11.6643, 78.1460], 'trichy': [10.7905, 78.7047],
        'bangalore': [12.9716, 77.5946], 'bengaluru': [12.9716, 77.5946], 'mysore': [12.2958, 76.6394],
        'hubli': [15.3647, 75.1240], 'kolar': [13.1362, 78.1292], 'davangere': [14.4644, 75.9218],
        'kolkata': [22.5726, 88.3639], 'siliguri': [26.7271, 88.3953],
        'lucknow': [26.8467, 80.9462], 'agra': [27.1767, 78.0081], 'kanpur': [26.4499, 80.3319],
        'varanasi': [25.3176, 82.9739], 'meerut': [28.9845, 77.7064], 'allahabad': [25.4358, 81.8463],
        'jaipur': [26.9124, 75.7873], 'jodhpur': [26.2389, 73.0243], 'udaipur': [24.5854, 73.7125],
        'kota': [25.2138, 75.8648], 'bikaner': [28.0229, 73.3119],
        'ahmedabad': [23.0225, 72.5714], 'rajkot': [22.3039, 70.8022], 'surat': [21.1702, 72.8311],
        'vadodara': [22.3072, 73.1812], 'unjha': [23.8041, 72.3929],
        'bhopal': [23.2599, 77.4126], 'indore': [22.7196, 75.8577], 'jabalpur': [23.1815, 79.9864],
        'gwalior': [26.2183, 78.1828],
        'patna': [25.6093, 85.1376], 'gaya': [24.7955, 85.0002],
        'chandigarh': [30.7333, 76.7794], 'ludhiana': [30.9010, 75.8573], 'amritsar': [31.6340, 74.8723],
        'jalandhar': [31.3260, 75.5762], 'khanna': [30.6971, 76.2173],
        'raipur': [21.2514, 81.6296], 'durg': [21.1904, 81.2849],
        'ranchi': [23.3441, 85.3096], 'jamshedpur': [22.8046, 86.2029],
        'bhubaneswar': [20.2961, 85.8245], 'cuttack': [20.4625, 85.8828],
        'guwahati': [26.1445, 91.7362], 'dibrugarh': [27.4728, 94.9120],
        'guntur': [16.3067, 80.4365], 'vijayawada': [16.5062, 80.6480], 'kurnool': [15.8281, 78.0373],
        'shimla': [31.1048, 77.1734], 'dehradun': [30.3165, 78.0322],
        'thiruvananthapuram': [8.5241, 76.9366], 'ernakulam': [9.9816, 76.2999],
        'panaji': [15.4909, 73.8278], 'jammu': [32.7266, 74.8570], 'srinagar': [34.0837, 74.7973],
        'imphal': [24.8170, 93.9368], 'shillong': [25.5788, 91.8933], 'aizawl': [23.7271, 92.7176],
        'kohima': [25.6751, 94.1086], 'agartala': [23.8315, 91.2868], 'gangtok': [27.3389, 88.6065]
    };

    function getMandiLatLon(marketName, districtName) {
        var key1 = (marketName || '').toLowerCase().trim();
        var key2 = (districtName || '').toLowerCase().trim();
        return mandiCoords[key1] || mandiCoords[key2] || null;
    }

    // Sort records: nearest first, then by price (highest modal)
    function sortByDistance(records) {
        if (userLat === null || userLon === null) return records;
        return records.map(function (r) {
            var coords = getMandiLatLon(r.market, r.district);
            if (coords) {
                r._dist = getDistanceKm(userLat, userLon, coords[0], coords[1]);
            } else {
                r._dist = 99999;
            }
            return r;
        }).sort(function (a, b) { return a._dist - b._dist; });
    }

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

        // Calculate average modal price for comparison
        var allPrices = records.map(function (r) { return parseFloat(r.modal_price) || 0; }).filter(function (p) { return p > 0; });
        var avgPrice = allPrices.length > 0 ? allPrices.reduce(function (a, b) { return a + b; }, 0) / allPrices.length : 0;

        records.forEach(function (item, idx) {
            var card = document.createElement('div');
            card.className = 'price-card';
            if (idx === 0 && item._dist && item._dist < 99999) card.className += ' nearest-card';

            var minPrice = formatPrice(item.min_price);
            var maxPrice = formatPrice(item.max_price);
            var modalPrice = formatPrice(item.modal_price);
            var modalNum = parseFloat(item.modal_price) || 0;
            var variety = item.variety || 'Standard';
            var date = item.arrival_date || 'Recent';

            // Distance badge
            var distBadge = '';
            if (item._dist && item._dist < 99999) {
                var distKm = Math.round(item._dist);
                var distLabel = distKm < 1 ? '<1 km' : distKm + ' km';
                distBadge = '<span class="distance-badge"><i class="fas fa-location-arrow"></i> ' + distLabel + '</span>';
            }

            // Price vs average indicator
            var priceIndicator = '';
            if (avgPrice > 0 && modalNum > 0) {
                var diff = modalNum - avgPrice;
                var diffPct = ((diff / avgPrice) * 100).toFixed(1);
                if (diff > 0) {
                    priceIndicator = '<span class="price-vs-avg above"><i class="fas fa-arrow-up"></i> ₹' + Math.round(diff).toLocaleString('en-IN') + ' above avg (' + diffPct + '%)</span>';
                } else if (diff < 0) {
                    priceIndicator = '<span class="price-vs-avg below"><i class="fas fa-arrow-down"></i> ₹' + Math.round(Math.abs(diff)).toLocaleString('en-IN') + ' below avg (' + Math.abs(diffPct) + '%)</span>';
                } else {
                    priceIndicator = '<span class="price-vs-avg avg">At average price</span>';
                }
            }

            // Nearest label for first card
            var nearestLabel = '';
            if (idx === 0 && item._dist && item._dist < 99999) {
                nearestLabel = '<span class="nearest-label">📍 Nearest Mandi</span>';
            }

            card.innerHTML =
                '<div class="price-card-header">' +
                '  <h3>' + escapeHtml(item.commodity || 'Unknown') + '</h3>' +
                '  <div style="display:flex;gap:0.4rem;flex-wrap:wrap;align-items:center;">' +
                '    <span class="variety-tag">' + escapeHtml(variety) + '</span>' +
                distBadge + nearestLabel +
                '  </div>' +
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
                priceIndicator +
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
                    records = sortByDistance(records);
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

            records = sortByDistance(records);
            showResultsBar(records.length, cropName, false);
            renderPrices(records);
            generateInsights(records, cropName);

        } catch (err) {
            console.error('API fetch error:', err);
            hideLoading();

            // Try fallback
            var fb = getFallbackResults(cropName, state);
            if (fb.length > 0) {
                fb = sortByDistance(fb);
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
