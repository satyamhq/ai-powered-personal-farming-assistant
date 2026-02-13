// Default location: Hyderabad, India
const DEFAULT_LAT = 17.3850;
const DEFAULT_LON = 78.4867;

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const weatherCodes = {
    0: { label: 'Clear sky', icon: 'fa-sun' },
    1: { label: 'Mainly clear', icon: 'fa-sun' },
    2: { label: 'Partly cloudy', icon: 'fa-cloud-sun' },
    3: { label: 'Overcast', icon: 'fa-cloud' },
    45: { label: 'Fog', icon: 'fa-smog' },
    48: { label: 'Depositing rime fog', icon: 'fa-smog' },
    51: { label: 'Light drizzle', icon: 'fa-cloud-rain' },
    53: { label: 'Moderate drizzle', icon: 'fa-cloud-rain' },
    55: { label: 'Dense drizzle', icon: 'fa-cloud-showers-heavy' },
    61: { label: 'Slight rain', icon: 'fa-cloud-rain' },
    63: { label: 'Moderate rain', icon: 'fa-cloud-showers-heavy' },
    65: { label: 'Heavy rain', icon: 'fa-cloud-showers-heavy' },
    71: { label: 'Slight snow fall', icon: 'fa-snowflake' },
    73: { label: 'Moderate snow fall', icon: 'fa-snowflake' },
    75: { label: 'Heavy snow fall', icon: 'fa-snowflake' },
    80: { label: 'Slight rain showers', icon: 'fa-cloud-rain' },
    81: { label: 'Moderate rain showers', icon: 'fa-cloud-showers-heavy' },
    82: { label: 'Violent rain showers', icon: 'fa-cloud-showers-heavy' },
    95: { label: 'Thunderstorm', icon: 'fa-bolt' },
    96: { label: 'Thunderstorm with slight hail', icon: 'fa-bolt' },
    99: { label: 'Thunderstorm with heavy hail', icon: 'fa-bolt' }
};

function getWeatherIcon(code) {
    return weatherCodes[code] || { label: 'Unknown', icon: 'fa-question-circle' };
}


async function getCityName(lat, lon) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
            headers: {
                'User-Agent': 'Agri1-Farming-Assistant/1.0'
            }
        });
        const data = await response.json();
        const address = data.address;
        // detailed address fallback
        const city = address.city || address.town || address.village || address.municipality || address.county || "Unknown Location";
        const country = address.country || "";
        return `${city}, ${country}`;
    } catch (error) {
        console.error("Error getting city name:", error);
        return "Unknown Location";
    }
}

async function fetchWeather(lat, lon, locationName) {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);

        if (!response.ok) {
            throw new Error('Weather data unavailable');
        }

        const data = await response.json();
        updateUI(data, locationName);
    } catch (error) {
        console.error('Error fetching weather:', error);
        document.getElementById('location-status').innerText = 'Failed to load weather data.';
    }
}


function updateUI(data, locationName) {

    const current = data.current;
    const daily = data.daily;

    // Update Current Weather
    const weatherInfo = getWeatherIcon(current.weather_code);
    document.getElementById('current-temp').innerText = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('current-condition').innerText = weatherInfo.label;
    document.getElementById('current-humidity').innerText = `${current.relative_humidity_2m}%`;
    document.getElementById('current-wind').innerText = `${current.wind_speed_10m} km/h`;

    // Update Icon
    const iconContainer = document.getElementById('current-icon-container');
    iconContainer.innerHTML = `<i class="fas ${weatherInfo.icon} weather-icon-large"></i>`;

    // Update Status
    const now = new Date();
    document.getElementById('location-status').innerText = `${locationName} (Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

    // Generate Advisory based on weather
    generateAdvisory(current.weather_code, current.temperature_2m, current.wind_speed_10m);

    // Update Forecast
    const forecastContainer = document.getElementById('forecast-container');
    forecastContainer.innerHTML = ''; // Clear loading text

    // Open-Meteo returns array of 7 days usually. We take 5.
    for (let i = 0; i < 5; i++) {
        const date = new Date(daily.time[i]);
        const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(daily.temperature_2m_max[i]);
        const minTemp = Math.round(daily.temperature_2m_min[i]); // Optional: could show range
        const code = daily.weather_code[i];
        const info = getWeatherIcon(code);

        const item = document.createElement('div');
        item.className = 'forecast-item';
        item.innerHTML = `
            <span>${dayName}</span>
            <span><i class="fas ${info.icon}"></i> ${info.label}</span>
            <span>${maxTemp}°C</span>
        `;
        forecastContainer.appendChild(item);
    }
}

function generateAdvisory(code, temp, wind) {
    const advisoryList = document.getElementById('advisory-list');
    advisoryList.innerHTML = '';

    const advisories = [];

    if (code >= 51 && code <= 65) {
        advisories.push("Rain expected. Delay spraying pesticides/fertilizers.");
        advisories.push("Ensure proper drainage in fields.");
    } else if (code === 0 || code === 1) {
        advisories.push("Clear skies suitable for harvesting.");
        advisories.push("Good time for solar drying of crops.");
    }

    if (temp > 35) {
        advisories.push("High heat! Ensure adequate irrigation for crops.");
        advisories.push("Mulch soil to retain moisture.");
    } else if (temp < 10) {
        advisories.push("Risk of frost. Protect sensitive seedlings.");
    }

    if (wind > 20) {
        advisories.push("High winds. Avoid spraying; stake tall crops.");
    }

    if (advisories.length === 0) {
        advisories.push("Weather conditions are normal for farming activities.");
        advisories.push("Monitor field moisture levels regularly.");
    }

    advisories.forEach(text => {
        const li = document.createElement('li');
        li.style.marginBottom = '1rem';
        li.innerText = text;
        advisoryList.appendChild(li);
    });
}


function getUserLocation() {
    const status = document.getElementById('location-status');
    status.innerText = "Detecting your location...";

    // Helper to start default if needed
    const loadDefault = () => {
        // Fallback to Hyderabad if denied/error
        const defaultName = "Hyderabad, India (Default)";
        fetchWeather(DEFAULT_LAT, DEFAULT_LON, defaultName);
    };

    if (!navigator.geolocation) {
        status.innerText = "Geolocation not supported. Using default...";
        loadDefault();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            status.innerText = "Location found! Getting details...";

            const cityName = await getCityName(lat, lon);
            fetchWeather(lat, lon, cityName);
        },
        (error) => {
            console.error("Geolocation error:", error);
            let msg = "Location access denied.";
            if (error.code === error.TIMEOUT) msg = "Location timed out.";
            if (error.code === error.POSITION_UNAVAILABLE) msg = "Location unavailable.";

            status.innerText = `${msg} Using default...`;
            loadDefault();
        }
    );
}

// Initial Call
document.addEventListener('DOMContentLoaded', getUserLocation);