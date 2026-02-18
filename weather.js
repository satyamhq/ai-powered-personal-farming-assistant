// Agri1 Weather — 7-Day Forecast + Rain Probability + AI Summary
// Uses Open-Meteo free API (no key needed)

const DEFAULT_LAT = 17.385;
const DEFAULT_LON = 78.4867;

// WMO Weather interpretation codes
const weatherCodes = {
    0: { label: 'Clear sky', icon: 'fa-sun', type: 'sunny' },
    1: { label: 'Mainly clear', icon: 'fa-sun', type: 'sunny' },
    2: { label: 'Partly cloudy', icon: 'fa-cloud-sun', type: 'cloudy' },
    3: { label: 'Overcast', icon: 'fa-cloud', type: 'cloudy' },
    45: { label: 'Foggy', icon: 'fa-smog', type: 'cloudy' },
    48: { label: 'Rime fog', icon: 'fa-smog', type: 'cloudy' },
    51: { label: 'Light drizzle', icon: 'fa-cloud-rain', type: 'rainy' },
    53: { label: 'Moderate drizzle', icon: 'fa-cloud-rain', type: 'rainy' },
    55: { label: 'Dense drizzle', icon: 'fa-cloud-showers-heavy', type: 'rainy' },
    61: { label: 'Slight rain', icon: 'fa-cloud-rain', type: 'rainy' },
    63: { label: 'Moderate rain', icon: 'fa-cloud-showers-heavy', type: 'rainy' },
    65: { label: 'Heavy rain', icon: 'fa-cloud-showers-heavy', type: 'rainy' },
    71: { label: 'Light snow', icon: 'fa-snowflake', type: 'cloudy' },
    73: { label: 'Moderate snow', icon: 'fa-snowflake', type: 'cloudy' },
    75: { label: 'Heavy snow', icon: 'fa-snowflake', type: 'cloudy' },
    80: { label: 'Rain showers', icon: 'fa-cloud-rain', type: 'rainy' },
    81: { label: 'Heavy showers', icon: 'fa-cloud-showers-heavy', type: 'rainy' },
    82: { label: 'Violent showers', icon: 'fa-cloud-showers-heavy', type: 'rainy' },
    95: { label: 'Thunderstorm', icon: 'fa-bolt', type: 'stormy' },
    96: { label: 'T-storm + hail', icon: 'fa-bolt', type: 'stormy' },
    99: { label: 'T-storm + hail', icon: 'fa-bolt', type: 'stormy' }
};

function getWeatherInfo(code) {
    return weatherCodes[code] || { label: 'Unknown', icon: 'fa-question-circle', type: 'cloudy' };
}

// ============================================================
// LOCATION DETECTION
// ============================================================
async function getCityName(lat, lon) {
    try {
        var res = await fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon + '&zoom=10', {
            headers: { 'User-Agent': 'Agri1-Farming-Assistant/1.0' }
        });
        var data = await res.json();
        var a = data.address || {};
        var city = a.city || a.town || a.village || a.municipality || a.county || 'Unknown';
        var state = a.state || '';
        return city + (state ? ', ' + state : '');
    } catch (e) {
        return 'Unknown Location';
    }
}

// ============================================================
// FETCH WEATHER (7-day, with rain probability + precipitation)
// ============================================================
async function fetchWeather(lat, lon, locationName) {
    try {
        var url = 'https://api.open-meteo.com/v1/forecast'
            + '?latitude=' + lat
            + '&longitude=' + lon
            + '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m'
            + '&hourly=precipitation_probability'
            + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum'
            + '&timezone=auto&forecast_days=7';

        var response = await fetch(url);
        if (!response.ok) throw new Error('Weather API error');
        var data = await response.json();
        updateUI(data, locationName);
    } catch (error) {
        console.error('Weather fetch error:', error);
        document.getElementById('location-name').innerText = 'Failed to load weather. Please refresh.';
    }
}

// ============================================================
// UPDATE UI
// ============================================================
function updateUI(data, locationName) {
    var current = data.current;
    var daily = data.daily;
    var hourly = data.hourly;

    // Current rain probability (next hour)
    var currentRainProb = 0;
    if (hourly && hourly.precipitation_probability) {
        currentRainProb = hourly.precipitation_probability[0] || 0;
    }

    // --- Hero Section ---
    var info = getWeatherInfo(current.weather_code);
    var temp = Math.round(current.temperature_2m);

    document.getElementById('location-name').innerText = locationName;
    document.getElementById('current-temp').innerText = temp + '°C';
    document.getElementById('current-condition').innerText = info.label;
    document.getElementById('current-humidity').innerText = current.relative_humidity_2m + '%';
    document.getElementById('current-wind').innerText = current.wind_speed_10m;
    document.getElementById('current-rain-prob').innerText = currentRainProb + '%';

    var iconEl = document.getElementById('current-icon-container');
    iconEl.innerHTML = '<i class="fas ' + info.icon + ' weather-icon-large"></i>';

    // --- 7-Day Forecast ---
    var forecastGrid = document.getElementById('forecast-grid');
    forecastGrid.innerHTML = '';

    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (var i = 0; i < 7; i++) {
        var date = new Date(daily.time[i]);
        var dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[date.getDay()];
        var maxT = Math.round(daily.temperature_2m_max[i]);
        var minT = Math.round(daily.temperature_2m_min[i]);
        var rainProb = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
        var precipMm = daily.precipitation_sum ? daily.precipitation_sum[i] : 0;
        var code = daily.weather_code[i];
        var dayInfo = getWeatherInfo(code);

        var dayEl = document.createElement('div');
        dayEl.className = 'forecast-day';
        dayEl.innerHTML =
            '<div class="day-name' + (i === 0 ? ' today' : '') + '">' + dayLabel + '</div>' +
            '<div class="day-icon ' + dayInfo.type + '"><i class="fas ' + dayInfo.icon + '"></i></div>' +
            '<div class="day-temps">' + maxT + '° <span class="min-temp">' + minT + '°</span></div>' +
            '<div class="rain-bar-container"><div class="rain-bar" style="width:' + Math.min(rainProb, 100) + '%"></div></div>' +
            '<div class="rain-pct">' + (rainProb || 0) + '% 🌧️</div>' +
            (precipMm > 0 ? '<div class="precip-amount">' + precipMm.toFixed(1) + 'mm</div>' : '');

        forecastGrid.appendChild(dayEl);
    }

    // --- AI Farming Summary ---
    generateAISummary(current, daily, currentRainProb, locationName);

    // --- Farming Advisory ---
    generateAdvisory(current, daily, currentRainProb);
}

// ============================================================
// AI FARMING SUMMARY
// ============================================================
function generateAISummary(current, daily, currentRainProb, locationName) {
    var summaryBody = document.getElementById('ai-summary-body');
    var lines = [];
    var temp = current.temperature_2m;
    var humidity = current.relative_humidity_2m;

    // Count rainy days ahead
    var rainyDays = 0;
    var dryDays = 0;
    var totalRainMm = 0;
    var maxTemp7 = -100;
    var minTemp7 = 100;

    for (var i = 0; i < 7; i++) {
        var rp = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;
        var precip = daily.precipitation_sum ? daily.precipitation_sum[i] : 0;
        if (rp > 50) rainyDays++;
        else dryDays++;
        totalRainMm += precip;
        if (daily.temperature_2m_max[i] > maxTemp7) maxTemp7 = Math.round(daily.temperature_2m_max[i]);
        if (daily.temperature_2m_min[i] < minTemp7) minTemp7 = Math.round(daily.temperature_2m_min[i]);
    }

    // First dry/rainy days
    var firstRainDay = -1;
    var firstDryDay = -1;
    for (var j = 1; j < 7; j++) {
        var rp2 = daily.precipitation_probability_max ? daily.precipitation_probability_max[j] : 0;
        if (firstRainDay < 0 && rp2 > 50) firstRainDay = j;
        if (firstDryDay < 0 && rp2 <= 30) firstDryDay = j;
    }

    // Current overview
    if (currentRainProb > 60) {
        lines.push({ emoji: '🌧️', text: 'Rain is likely right now (' + currentRainProb + '% chance). Avoid spraying and field work.' });
    } else if (temp > 38) {
        lines.push({ emoji: '🔥', text: 'It\'s very hot (' + temp + '°C). Irrigate early morning or late evening. Use mulching.' });
    } else if (temp > 30) {
        lines.push({ emoji: '☀️', text: 'Warm conditions (' + temp + '°C) — good for crop growth. Monitor soil moisture.' });
    } else if (temp > 20) {
        lines.push({ emoji: '✅', text: 'Pleasant weather (' + temp + '°C). Ideal for fieldwork, spraying, and planting.' });
    } else {
        lines.push({ emoji: '❄️', text: 'Cool weather (' + temp + '°C). Good for rabi crops. Protection needed if frost is expected.' });
    }

    // Week ahead
    if (rainyDays === 0) {
        lines.push({ emoji: '🌞', text: 'Dry week ahead — all 7 days look rain-free. Great window for spraying and harvesting.' });
    } else if (rainyDays <= 2) {
        lines.push({ emoji: '🌤️', text: dryDays + ' dry days and ' + rainyDays + ' rainy day(s) this week. Plan spraying and harvest on dry days.' });
        if (firstRainDay > 0) {
            var rainDayName = firstRainDay === 1 ? 'tomorrow' : 'in ' + firstRainDay + ' days';
            lines.push({ emoji: '⏰', text: 'Rain expected ' + rainDayName + '. Complete field operations before then.' });
        }
    } else {
        lines.push({ emoji: '🌧️', text: rainyDays + ' out of 7 days have rain expected (' + totalRainMm.toFixed(1) + 'mm total). Ensure drainage and delay spraying.' });
    }

    // Temperature range
    lines.push({
        emoji: '🌡️', text: 'Week temp range: ' + minTemp7 + '°C to ' + maxTemp7 + '°C. ' +
            (maxTemp7 > 40 ? 'Extreme heat days ahead — protect livestock and nurseries.' :
                minTemp7 < 5 ? 'Frost risk — cover young plants and nurseries overnight.' :
                    'Comfortable range for most crops.')
    });

    // Humidity advice
    if (humidity > 80) {
        lines.push({ emoji: '🍄', text: 'High humidity (' + humidity + '%) — increased risk of fungal diseases. Scout for blight and mildew.' });
    }

    // Render
    var html = '';
    for (var k = 0; k < lines.length; k++) {
        html += '<div class="summary-line"><span class="summary-emoji">' + lines[k].emoji + '</span><span>' + lines[k].text + '</span></div>';
    }
    summaryBody.innerHTML = html;
}

// ============================================================
// FARMING ADVISORY
// ============================================================
function generateAdvisory(current, daily, currentRainProb) {
    var advisoryBody = document.getElementById('advisory-list');
    var items = [];
    var temp = current.temperature_2m;
    var wind = current.wind_speed_10m;
    var code = current.weather_code;

    // Rain
    if (code >= 51 && code <= 65) {
        items.push({ icon: 'blue', text: '🌧️ Rain active — delay pesticide/fertilizer spraying. Ensure field drainage.' });
    } else if (code >= 80 && code <= 82) {
        items.push({ icon: 'blue', text: '🌧️ Showers expected — postpone harvesting. Cover dried crops.' });
    } else if (currentRainProb > 50) {
        items.push({ icon: 'blue', text: '🌦️ Rain likely (' + currentRainProb + '%). Plan indoor activities.' });
    }

    // Temperature
    if (temp > 40) {
        items.push({ icon: 'red', text: '🔥 Extreme heat! Use shade nets, irrigate at dawn/dusk, provide water to livestock.' });
    } else if (temp > 35) {
        items.push({ icon: 'orange', text: '☀️ Hot weather. Irrigate regularly. Only spray pesticides early morning.' });
    } else if (temp < 5) {
        items.push({ icon: 'red', text: '❄️ Frost risk! Light irrigation in evening can protect crops. Cover nurseries.' });
    } else if (temp < 15) {
        items.push({ icon: 'orange', text: '🥶 Cool conditions — good for rabi wheat, mustard. Protect seedlings from cold winds.' });
    }

    // Wind
    if (wind > 30) {
        items.push({ icon: 'red', text: '💨 Very high winds (' + wind + ' km/h). Stake tall crops. Do not spray.' });
    } else if (wind > 20) {
        items.push({ icon: 'orange', text: '💨 Windy conditions. Avoid spraying chemicals — drift risk is high.' });
    }

    // Clear & good conditions
    if (code <= 1 && temp >= 20 && temp <= 35 && currentRainProb < 30) {
        items.push({ icon: 'green', text: '✅ Great conditions for field work: sowing, transplanting, and pesticide application.' });
    }
    if (code <= 1) {
        items.push({ icon: 'green', text: '☀️ Clear sky — ideal for solar drying of harvested crops and seeds.' });
    }

    // General
    items.push({ icon: 'green', text: '🌱 Monitor soil moisture daily. Use Agri1 AI Assistant for crop-specific guidance.' });

    // Render
    var html = '';
    for (var i = 0; i < items.length; i++) {
        html += '<div class="advisory-item">' +
            '<div class="advisory-icon ' + items[i].icon + '"><i class="fas ' +
            (items[i].icon === 'green' ? 'fa-check' : items[i].icon === 'orange' ? 'fa-exclamation' : items[i].icon === 'red' ? 'fa-times' : 'fa-info') +
            '"></i></div>' +
            '<span>' + items[i].text + '</span></div>';
    }
    advisoryBody.innerHTML = html;
}

// ============================================================
// LOCATION SETUP & INIT
// ============================================================
function getUserLocation() {
    var nameEl = document.getElementById('location-name');
    nameEl.innerText = 'Detecting your location...';

    function loadDefault() {
        fetchWeather(DEFAULT_LAT, DEFAULT_LON, 'Hyderabad, Telangana (Default)');
    }

    if (!navigator.geolocation) {
        nameEl.innerText = 'Geolocation not supported. Using default...';
        loadDefault();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async function (pos) {
            var lat = pos.coords.latitude;
            var lon = pos.coords.longitude;
            nameEl.innerText = 'Location found! Loading weather...';
            var cityName = await getCityName(lat, lon);
            fetchWeather(lat, lon, cityName);
        },
        function (error) {
            console.error('Geolocation error:', error);
            var msg = 'Location denied.';
            if (error.code === error.TIMEOUT) msg = 'Location timed out.';
            nameEl.innerText = msg + ' Using default...';
            loadDefault();
        },
        { timeout: 8000 }
    );
}

document.addEventListener('DOMContentLoaded', getUserLocation);