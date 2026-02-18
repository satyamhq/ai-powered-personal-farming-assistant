# Agri1 — AI-Powered Personal Farming Assistant

**Empowering Indian farmers with real-time market prices, AI-driven crop guidance, and hyper-local weather intelligence.**

## Overview

Agri1 is a comprehensive **Progressive Web App (PWA)** designed to bring smart farming technology to Indian farmers. It operates as a complete offline-capable mobile solution that bridges the gap between farmers and critical agricultural data.

## Key Features

- **AI Farming Assistant:** A specialized chatbot (English + Hindi) for crop advice, pest management, and weather insights.
- **Live Mandi Prices:** Real-time reliable data from government APIs (Agmarknet), sorted by proximity using GPS.
- **Hyper-Local Weather:** 7-day forecasts with specific farming advisories based on rain probability and temperature.
- **Offline Capabilities:** Fully functional PWA that caches core assets for use in low-connectivity areas.
- **Crop & Pest Guides:** Extensive library of cultivation methods and disease management strategies.

## Technical Architecture

### Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Build Tool:** Vite.
- **PWA:** Service Workers, Web Manifest.
- **Deployment:** Static hosting (GitHub Pages/Netlify compatible).

### APIs & Integrations
- **Market Data:** [data.gov.in](https://data.gov.in/) (Agmarknet)
- **Weather:** [Open-Meteo](https://open-meteo.com/)
- **Geocoding:** [Nominatim (OSM)](https://nominatim.openstreetmap.org/)
- **Knowledge Base:** Wikipedia API (Fallback)

### Core Algorithms
- **Nearest Mandi Sorting:** Utilizes the Haversine formula to calculate distances between the user's GPS location and 80+ indexed market coordinates, ensuring the most relevant prices are displayed first.
- **AI Intent Detection:** Custom logic to identify farming-specific queries, perform Hindi-to-English translation for crop names, and filter out non-agricultural topics.

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm

### Setup Steps
1. **Clone that repository:**
   ```bash
   git clone https://github.com/satyamhq/ai-powered-personal-farming-assistant.git
   cd ai-powered-personal-farming-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Project Structure

```text
ai-powered-personal-farming-assistant/
├── index.html              # Home page
├── assistant.html          # AI Chatbot interface
├── market.html             # Live market prices with sorting logic
├── weather.html            # Weather forecast & advisory
├── crop.html               # Crop guidance modules
├── pest.html               # Pest management guides
├── common.js               # Shared utilities (Navigation, Auth)
├── service-worker.js       # PWA offline caching strategy
└── README.md               # Project documentation
```

## License

This project is licensed under the **MIT License**.

## Author

**Satyam Kumar**
*Founder & Lead Developer*
[GitHub Profile](https://github.com/satyamhq)
