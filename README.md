<div align="center">

# 🌾 Agri1 — AI-Powered Personal Farming Assistant

**Empowering Indian farmers with real-time market prices, AI-driven crop guidance, and hyper-local weather intelligence.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-228B22?style=for-the-badge&logo=google-chrome&logoColor=white)](#)
[![GitHub Stars](https://img.shields.io/github/stars/satyamhq/ai-powered-personal-farming-assistant?style=for-the-badge&color=gold)](https://github.com/satyamhq/ai-powered-personal-farming-assistant)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## 📖 About

**Agri1** is a full-stack web platform that brings smart farming technology directly to the hands of Indian farmers. It combines **live mandi price data**, a **fine-tuned AI chatbot** (English + Hindi), a **7-day weather forecast with farming advisory**, and **pest/crop management guides** — all in one responsive, mobile-first interface.

> Built as a comprehensive solution to bridge the information gap between farmers and technology — from real-time commodity prices to AI-powered crop recommendations.

---

## 👨‍💻 Founder

<table>
  <tr>
    <td>
      <strong>Satyam Kumar</strong><br>
      Founder & Sole Developer<br><br>
      Designed, developed, and deployed the entire Agri1 platform — from the AI chatbot engine to the live market price system. Currently based at <strong>Lovely Professional University (LPU), India</strong>.<br><br>
      <a href="https://github.com/satyamhq">GitHub → @satyamhq</a>
    </td>
  </tr>
</table>

---

## ✨ Key Features

### 🤖 AI Assistant (Fine-Tuned for Farmers)
- **Farming-only responses** — the AI strictly answers agriculture-related questions and politely declines off-topic queries
- **Bilingual NLP** — understands both English and Hindi (Romanized + Devanagari): `"Gehu ka bhav"`, `"कपास price"`, `"tamatar kitna hai"`
- **Hindi crop name mapping** — 30+ crops with Hindi-to-English translation (gehu → Wheat, dhan → Paddy, kapas → Cotton, etc.)
- **Smart mandi recommendations** — shows the best mandi to sell at, with price comparison against average
- **Sell/Hold advice** — analyzes price spread across markets and recommends whether to sell now or wait
- **Live data integration** — fetches real-time mandi prices from the government API during conversations
- **50+ crop knowledge base** — cultivation methods, pest control, government schemes, fertilizers, irrigation
- **Weather-aware context** — automatically appends live weather data and farming tips to crop-related answers

### 💰 Live Market Prices (Nearest Mandi First)
- **Real-time data** from India's official **data.gov.in** Agmarknet API (300+ mandis)
- **Nearest mandi sorting** — uses browser GPS + 80+ Indian city coordinate lookup (Haversine distance)
- **Distance badge** on every price card (e.g., "📍 42 km away")
- **"Nearest Mandi" highlight** — green-bordered first card with label
- **Price vs Average indicator** — shows ▲/▼ with exact ₹ difference and percentage
- **AI market insights panel** — best market, lowest market, average, and price spread analysis
- **5-minute cache** — reduces API calls while keeping data fresh
- **Fallback data** — 12+ crops with reference prices when the API is rate-limited
- **State filtering** — filter results by any Indian state
- **Quick search chips** — one-tap search for popular crops

### 🌤️ Weather Forecast (7-Day + AI Summary)
- **7-day forecast** with per-day rain probability bars, min/max temperatures, and precipitation in mm
- **AI Farming Summary** — auto-generates plain-language advice (e.g., "3 dry days ahead — ideal for spraying")
- **Current conditions** — temperature, humidity, wind speed, weather description
- **Farming Advisory** with color-coded severity icons (🟢 safe, 🟠 caution, 🔴 danger, 🔵 info)
- **Homepage weather strip** — compact 7-day forecast embedded below the nav bar on the home page
- **Location auto-detection** — uses GPS with reverse geocoding for city name display

### 🌱 Crop Guidance
- Scientific cultivation advice for major Indian crops
- Growth stage tracking and season-wise recommendations (Kharif, Rabi, Zaid)
- Soil type and climate requirements
- Fertilizer schedules and irrigation guidance

### 🐛 Pest & Disease Management
- Identification guides for common Indian crop pests
- Disease symptoms and treatment methods
- Organic and chemical control options
- Prevention strategies and IPM (Integrated Pest Management)

### 🏛️ Government Schemes
- **PM-KISAN** — eligibility, benefits, registration
- **PMFBY** — crop insurance details
- **KCC** — Kisan Credit Card information
- **MSP** — Minimum Support Prices for major crops
- Subsidies, loans, and other farmer welfare schemes

### 📱 Mobile-First Responsive Design
- Fully responsive across desktop, tablet, and mobile devices
- Mobile-optimized navigation with hamburger menu
- Touch-friendly UI with horizontal scroll for forecast strips
- ChatGPT-style clean mobile layout for the AI assistant

---

## 🔌 APIs & Integrations

| Service | API | Purpose | Auth |
|---------|-----|---------|------|
| **Mandi Prices** | [data.gov.in](https://data.gov.in/) (Agmarknet) | Real-time commodity prices from 300+ Indian mandis | API Key (free) |
| **Weather** | [Open-Meteo](https://open-meteo.com/) | Current conditions + 7-day forecast with precipitation data | None (free) |
| **Reverse Geocoding** | [Nominatim (OSM)](https://nominatim.openstreetmap.org/) | Convert GPS coordinates → city/state name | None (free) |
| **Knowledge Fallback** | [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page) | Farming-related encyclopedia lookups | None (free) |
| **Browser Geolocation** | Web Geolocation API | Auto-detect user location for weather & nearest mandi | Browser permission |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 (Semantic) |
| **Styling** | CSS3, CSS Variables, Flexbox, Grid |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Build Tool** | Vite |
| **Fonts** | Google Fonts (Inter) |
| **Icons** | Font Awesome 6 |
| **Mobile** | Responsive CSS media queries |
| **Hosting** | Static (GitHub Pages / Netlify / Vercel compatible) |

> **No heavy frameworks.** The entire app runs on vanilla HTML/CSS/JS for maximum performance and zero bundle overhead — critical for farmers on low-bandwidth connections.

---

## 📁 Project Structure

```
ai-powered-personal-farming-assistant/
│
├── index.html              # Home page (hero + weather strip + categories)
├── index.css               # Global styles & design system (CSS variables)
├── index.js                # Home page logic (mobile menu, search)
├── mobile.css              # Mobile responsive overrides
├── common.js               # Shared utilities (auth, navigation)
│
├── assistant.html          # AI Assistant chatbot page
├── assistant.js            # AI engine: NLP, intent detection, Hindi support,
│                           #   live price API, weather API, farming KB,
│                           #   farming-only guard, mandi recommendations
│
├── market.html             # Market Prices page
├── market.js               # Live API fetch, caching, nearest mandi sorting,
│                           #   geolocation, distance calc, price comparison
├── market.css              # Market page styles (cards, badges, indicators)
│
├── weather.html            # Weather page (7-day forecast + AI summary)
├── weather.js              # Open-Meteo API, forecast rendering, AI advisory
│
├── crop.html               # Crop Guidance page
├── crop.js                 # Crop module logic
├── crop.css                # Crop page styles
│
├── pest.html               # Pest & Disease Management page
├── login.html              # User authentication page
│
├── images/                 # Image assets
├── favicon/                # Favicon set (multi-size)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite configuration
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v14 or higher
- **npm** or **yarn**
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/satyamhq/ai-powered-personal-farming-assistant.git
cd ai-powered-personal-farming-assistant

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
```

Static files will be generated in the `dist/` folder — deploy to GitHub Pages, Netlify, Vercel, or any static host.

---

## 🎯 How It Works

### AI Intent Detection Flow

```
User Query
    │
    ▼
┌─────────────────┐
│ Greeting Check   │──→ "Namaste! Main AgriBot hoon..."
│ (hi/namaste/bye) │
└────────┬────────┘
         │ no match
         ▼
┌─────────────────┐
│ Founder Check    │──→ "Satyam Kumar — Founder of Agri1"
│ (satyam/founder) │
└────────┬────────┘
         │ no match
         ▼
┌─────────────────┐
│ Price Intent     │──→ Fetch live mandi prices → Best mandi recommendation
│ (bhav/price/daam)│    + sell/hold advice + avg comparison
└────────┬────────┘
         │ no match
         ▼
┌─────────────────┐
│ Farming KB       │──→ Local knowledge base (50+ crops, pests, schemes)
│ (crop/pest/soil) │
└────────┬────────┘
         │ no match
         ▼
┌─────────────────┐
│ Weather Intent   │──→ Fetch live weather + farming advisory
│ (mausam/weather) │
└────────┬────────┘
         │ no match
         ▼
┌─────────────────┐
│ Farming Guard    │──→ Is it farming-related?
│ (topic check)    │    YES → Wikipedia lookup (farming only)
└────────┬────────┘    NO  → Politely decline
         │
         ▼
    Final Response
```

### Nearest Mandi Algorithm

1. **Detect GPS** → Browser Geolocation API
2. **Lookup coordinates** → 80+ Indian city lat/lon table
3. **Calculate distance** → Haversine formula (km)
4. **Sort** → Nearest first
5. **Compare** → Each price vs average (₹ diff + %)
6. **Highlight** → First card = "📍 Nearest Mandi" with green border

---

## 📸 Pages Overview

| Page | Description |
|------|-------------|
| **Home** | Hero banner, weather strip (7-day), category cards, feature highlights |
| **AI Assistant** | Full-screen chatbot with suggested questions sidebar, bilingual support |
| **Market Prices** | Search + filter + live API results with distance & price comparison |
| **Weather** | 7-day forecast cards, rain probability, AI farming summary, advisory |
| **Crop Guidance** | Crop selection cards with detailed growing guides |
| **Pest Management** | Pest identification and treatment reference |
| **Login** | User authentication form |

---

## 🔮 Future Improvements

- [ ] **Crop image diagnosis** — upload a photo of a diseased plant for AI identification
- [ ] **Voice input** — speak queries in Hindi/English for hands-free use
- [ ] **Push notifications** — price alerts when a crop's mandi rate crosses a threshold
- [ ] **Historical price charts** — 30/90-day price trends with visual graphs
- [ ] **Multi-language support** — Tamil, Telugu, Bengali, Marathi UI translations
- [ ] **Offline mode** — cache essential data for areas with poor connectivity
- [ ] **Crop calendar** — personalized sowing/harvesting schedule based on location
- [ ] **Community forum** — farmer-to-farmer knowledge sharing
- [ ] **eNAM integration** — direct mandi bidding and selling
- [ ] **SMS fallback** — deliver crop prices via SMS for non-smartphone users

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/MyFeature`)
3. **Commit** your changes (`git commit -m 'Add MyFeature'`)
4. **Push** to the branch (`git push origin feature/MyFeature`)
5. Open a **Pull Request**

### Guidelines
- Follow existing code style (vanilla JS, no frameworks)
- Test on mobile devices
- Update README if adding new features
- Keep it lightweight — farmers on 2G/3G networks depend on fast load times

---

## 🐛 Bug Reports

Found an issue? [Open a GitHub Issue](https://github.com/satyamhq/ai-powered-personal-farming-assistant/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Device / browser info

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[data.gov.in](https://data.gov.in/)** — for the open mandi price API
- **[Open-Meteo](https://open-meteo.com/)** — for the free weather forecast API
- **[OpenStreetMap / Nominatim](https://nominatim.openstreetmap.org/)** — for reverse geocoding
- **[Font Awesome](https://fontawesome.com/)** — for the icon library
- **[Google Fonts](https://fonts.google.com/)** — for Inter typeface
- All the **Indian farmers** whose daily challenges inspired this platform

---

<div align="center">

**Made with ❤️ for Indian Farmers by [Satyam Kumar](https://github.com/satyamhq)**

🌾 *Kisan ki seva, technology ke saath* 🌾

⭐ Star this repo if you find it useful!

</div>
