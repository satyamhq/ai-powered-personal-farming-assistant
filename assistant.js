document.addEventListener('DOMContentLoaded', () => {
  console.log("Agri1 Assistant v5.0 - Smart Krishi Expert");

  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');

  if (!sendBtn || !userInput || !chatMessages) {
    console.error("Critical: DOM elements not found.");
    return;
  }

  // ============================================================
  // LOCATION DETECTION & WEATHER CACHE
  // ============================================================
  var userLocation = { lat: 17.385, lon: 78.4867, city: 'Hyderabad', state: 'Telangana', detected: false };
  var weatherCache = { data: null, timestamp: 0 };
  var CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  // Try GPS first, then IP fallback
  function detectLocation() {
    return new Promise(function (resolve) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (pos) {
            userLocation.lat = pos.coords.latitude;
            userLocation.lon = pos.coords.longitude;
            userLocation.detected = true;
            // Reverse geocode to get city name
            reverseGeocode(pos.coords.latitude, pos.coords.longitude).then(function () {
              console.log('Location (GPS):', userLocation.city);
              resolve(userLocation);
            });
          },
          function () {
            // GPS denied, try IP
            detectLocationByIP().then(resolve);
          },
          { timeout: 5000 }
        );
      } else {
        detectLocationByIP().then(resolve);
      }
    });
  }

  function detectLocationByIP() {
    return fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.latitude && data.longitude) {
          userLocation.lat = data.latitude;
          userLocation.lon = data.longitude;
          userLocation.city = data.city || 'Your Area';
          userLocation.state = data.region || '';
          userLocation.detected = true;
          console.log('Location (IP):', userLocation.city);
        }
        return userLocation;
      })
      .catch(function () {
        console.log('Location detection failed, using default: Hyderabad');
        return userLocation;
      });
  }

  function reverseGeocode(lat, lon) {
    var url = 'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json&zoom=10';
    return fetch(url, { signal: AbortSignal.timeout(5000) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.address) {
          userLocation.city = data.address.city || data.address.town || data.address.village || data.address.county || 'Your Area';
          userLocation.state = data.address.state || '';
        }
      })
      .catch(function () { /* keep default */ });
  }

  // Fetch full weather data
  async function fetchWeatherData() {
    var now = Date.now();
    if (weatherCache.data && (now - weatherCache.timestamp) < CACHE_DURATION) {
      return weatherCache.data;
    }
    try {
      var url = 'https://api.open-meteo.com/v1/forecast'
        + '?latitude=' + userLocation.lat
        + '&longitude=' + userLocation.lon
        + '&current_weather=true'
        + '&hourly=relativehumidity_2m,precipitation_probability'
        + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode'
        + '&timezone=auto&forecast_days=3';
      var res = await fetchSafe(url, 8000);
      var raw = await res.json();
      var w = raw.current_weather || {};
      var humidity = (raw.hourly && raw.hourly.relativehumidity_2m) ? raw.hourly.relativehumidity_2m[0] : null;
      var rainProb = (raw.hourly && raw.hourly.precipitation_probability) ? raw.hourly.precipitation_probability[0] : null;
      var dailyRain = (raw.daily && raw.daily.precipitation_sum) ? raw.daily.precipitation_sum : [];
      var dailyMax = (raw.daily && raw.daily.temperature_2m_max) ? raw.daily.temperature_2m_max : [];
      var dailyMin = (raw.daily && raw.daily.temperature_2m_min) ? raw.daily.temperature_2m_min : [];
      var dailyCodes = (raw.daily && raw.daily.weathercode) ? raw.daily.weathercode : [];

      weatherCache.data = {
        temp: w.temperature, windspeed: w.windspeed, winddirection: w.winddirection,
        weathercode: w.weathercode, humidity: humidity, rainProbability: rainProb,
        dailyRain: dailyRain, dailyMax: dailyMax, dailyMin: dailyMin, dailyCodes: dailyCodes,
        city: userLocation.city, state: userLocation.state
      };
      weatherCache.timestamp = now;
      return weatherCache.data;
    } catch (e) {
      console.error('Weather fetch error:', e);
      return null;
    }
  }

  // Build weather summary for embedding in responses
  function getWeatherContext(wd) {
    if (!wd) return '';
    var parts = [];
    parts.push('\n\n**📍 Your Location: ' + wd.city + (wd.state ? ', ' + wd.state : '') + '**');
    parts.push('• 🌡️ Temperature: ' + wd.temp + '°C');
    if (wd.humidity !== null) parts.push('• 💧 Humidity: ' + wd.humidity + '%');
    if (wd.rainProbability !== null) parts.push('• 🌧️ Rain chance: ' + wd.rainProbability + '%');
    // Farming tips based on conditions
    if (wd.rainProbability > 60) parts.push('• ⚠️ High rain expected — avoid spraying. Ensure field drainage.');
    if (wd.temp > 38) parts.push('• ⚠️ Extreme heat — irrigate morning/evening, use mulching.');
    if (wd.humidity > 80) parts.push('• ⚠️ High humidity — watch for fungal diseases.');
    if (wd.temp < 10) parts.push('• ⚠️ Frost risk — protect nurseries and young crops.');
    return parts.join('\n');
  }

  // Start location detection immediately
  detectLocation();

  // ============================================================
  // 1. COMPREHENSIVE FARMING KNOWLEDGE BASE
  // ============================================================
  const farmingKB = {
    // --- Crop Cultivation ---
    'rice': "**Rice Cultivation**:\n• Season: Kharif (June-Nov)\n• Soil: Clayey, loamy, standing water needed\n• Temp: 20-37°C\n• Seeds: 60-80 kg/ha\n• Irrigation: Continuous flooding\n• Fertilizer: NPK 120:60:60 kg/ha\n• Major Varieties: IR-64, Pusa Basmati, Swarna, BPT-5204\n• Diseases: Blast, Sheath blight, Brown spot\n• Harvest: 120-150 days after transplanting",
    'wheat': "**Wheat Cultivation**:\n• Season: Rabi (Oct-March)\n• Soil: Loamy, well-drained\n• Temp: 10-25°C (cool climate)\n• Seeds: 100-125 kg/ha\n• Irrigation: 4-6 irrigations at CRI, tillering, jointing, flowering, milking\n• Fertilizer: NPK 120:60:40 kg/ha\n• Major Varieties: HD-2967, PBW-343, WH-542, DBW-17\n• Diseases: Rust (yellow, brown, black), Karnal bunt",
    'maize': "**Maize Cultivation**:\n• Season: Kharif & Rabi\n• Soil: Well-drained loamy\n• Temp: 21-30°C\n• Seeds: 20-25 kg/ha\n• Spacing: 60x20 cm\n• Fertilizer: NPK 120:60:40 kg/ha\n• Major Varieties: DHM-117, HQPM-1, Vivek-9\n• Pests: Stem borer, Fall armyworm",
    'cotton': "**Cotton Cultivation**:\n• Season: Kharif (April-Sept sowing)\n• Soil: Black cotton soil (regur)\n• Temp: 21-30°C\n• Seeds: 15-20 kg/ha (Bt cotton: 2.5 kg/ha)\n• Spacing: 90x60 cm\n• Fertilizer: NPK 120:60:60 kg/ha\n• Pests: Pink bollworm, American bollworm, whitefly\n• Major States: Gujarat, Maharashtra, Telangana",
    'sugarcane': "**Sugarcane Cultivation**:\n• Season: Feb-March (Spring), Oct (Autumn)\n• Soil: Deep loamy, well-drained\n• Temp: 20-35°C\n• Fertilizer: NPK 250:60:60 kg/ha\n• Duration: 12-18 months\n• Major Varieties: Co-0238, CoJ-64\n• Diseases: Red rot, Smut, Wilt",
    'tomato': "**Tomato Cultivation**:\n• Season: Year-round (protected), Rabi (open)\n• Soil: Sandy loam, pH 6-7\n• Temp: 20-25°C\n• Spacing: 60x45 cm\n• Fertilizer: NPK 120:80:80 kg/ha + FYM 25t/ha\n• Varieties: Pusa Ruby, Arka Vikas, NS-501\n• Diseases: Early blight, Late blight, Leaf curl virus",
    'onion': "**Onion Cultivation**:\n• Season: Kharif (June-July), Rabi (Oct-Nov)\n• Soil: Sandy loam, well-drained\n• Temp: 15-25°C\n• Spacing: 15x10 cm\n• Fertilizer: NPK 110:40:60 kg/ha\n• Varieties: Pusa Red, N-53, Agrifound Dark Red\n• Diseases: Purple blotch, Thrips",
    'potato': "**Potato Cultivation**:\n• Season: Rabi (Oct-Dec sowing)\n• Soil: Sandy loam, pH 5.5-6.5\n• Temp: 15-20°C\n• Seed tubers: 25-30 Quintals/ha\n• Spacing: 60x20 cm\n• Fertilizer: NPK 150:80:100 kg/ha\n• Varieties: Kufri Jyoti, Kufri Pukhraj",
    'bajra': "**Bajra (Pearl Millet) Cultivation**:\n• Season: Kharif (June-July)\n• Soil: Sandy, loamy (drought tolerant)\n• Temp: 25-35°C\n• Seeds: 4-5 kg/ha\n• Fertilizer: NPK 60:30:30 kg/ha\n• Varieties: HHB-67, Pusa Composite-383\n• Major States: Rajasthan, Gujarat, Haryana",
    'ragi': "**Ragi (Finger Millet) Cultivation**:\n• Season: Kharif (June-July)\n• Soil: Loamy, red soils\n• Temp: 20-30°C\n• Seeds: 8-10 kg/ha\n• Fertilizer: NPK 50:40:25 kg/ha\n• Varieties: GPU-28, MR-6\n• Rich in calcium & iron",
    'jowar': "**Jowar (Sorghum) Cultivation**:\n• Season: Kharif & Rabi\n• Soil: Black, loamy (drought tolerant)\n• Temp: 25-32°C\n• Seeds: 10-12 kg/ha\n• Fertilizer: NPK 80:40:40 kg/ha\n• Varieties: CSV-15, SPV-462\n• Used for food, fodder, ethanol",
    'groundnut': "**Groundnut Cultivation**:\n• Season: Kharif (June-July)\n• Soil: Sandy loam, well-drained\n• Temp: 25-30°C\n• Seeds: 100-120 kg/ha\n• Spacing: 30x10 cm\n• Fertilizer: NPK 25:50:50 kg/ha + Gypsum 500 kg/ha\n• Varieties: TMV-2, JL-24, ICGS-76\n• Major States: Gujarat, AP, Rajasthan",
    'soybean': "**Soybean Cultivation**:\n• Season: Kharif (June-July)\n• Soil: Well-drained loamy\n• Temp: 20-30°C\n• Seeds: 60-80 kg/ha\n• Spacing: 45x5 cm\n• Fertilizer: NPK 20:80:20 kg/ha + Rhizobium\n• Varieties: JS-335, NRC-7\n• Major States: MP, Maharashtra, Rajasthan",
    'mustard': "**Mustard Cultivation**:\n• Season: Rabi (Oct-Nov)\n• Soil: Loamy, well-drained\n• Temp: 15-25°C\n• Seeds: 4-5 kg/ha\n• Spacing: 30x10 cm\n• Fertilizer: NPK 80:40:40 kg/ha + Sulphur 40 kg/ha\n• Varieties: Pusa Bold, Varuna, Bio-902\n• Major States: Rajasthan, MP, UP",
    'banana': "**Banana Cultivation**:\n• Season: Year-round planting\n• Soil: Rich loamy, well-drained\n• Temp: 20-35°C\n• Spacing: 1.8x1.8m\n• Fertilizer: NPK 200:60:300 g/plant/year\n• Varieties: Grand Naine, Robusta, Poovan\n• Duration: 12-14 months crop cycle\n• Major States: Tamil Nadu, Maharashtra, AP",
    'mango': "**Mango Cultivation**:\n• Season: Plant in monsoon\n• Soil: Deep alluvial, well-drained\n• Spacing: 10x10m (traditional)\n• Varieties: Alphonso, Dasheri, Langra, Totapuri\n• Flowering: Jan-Feb\n• Fruiting: April-June\n• Major States: UP, AP, Karnataka, Maharashtra",

    // --- Pest & Disease Management ---
    'aphids': "**Aphid Control**:\n• Chemical: Imidacloprid 17.8 SL (0.3ml/L) or Dimethoate 30 EC (2ml/L)\n• Organic: Neem oil 5ml/L + liquid soap | Ladybugs & Lacewings are natural predators\n• Prevention: Remove weeds, yellow sticky traps, avoid excess nitrogen\n• Affected Crops: Cotton, Mustard, Vegetables, Pulses",
    'whitefly': "**Whitefly Control**:\n• Chemical: Spiromesifen 22.9 SC (0.5ml/L) or Diafenthiuron 50 WP (1g/L)\n• Organic: Neem oil 5ml/L, Yellow sticky traps\n• Prevention: Remove alternate host weeds, intercropping with marigold\n• Affected Crops: Cotton, Tomato, Brinjal, Okra",
    'bollworm': "**Bollworm Control**:\n• Chemical: Chlorantraniliprole 18.5 SC (0.3ml/L) or Emamectin benzoate 5 SG\n• Organic: Bt spray (Bacillus thuringiensis), Pheromone traps\n• Prevention: Use Bt cotton, deep ploughing after harvest\n• Pink bollworm: Pheromone traps @ 5/ha",
    'stem borer': "**Stem Borer Control**:\n• Chemical: Cartap hydrochloride 4G (25 kg/ha) or Chlorantraniliprole 0.4 GR\n• Organic: Release Trichogramma wasps (1 lakh/ha), light traps\n• Prevention: Remove stubbles, synchronous planting\n• Affected Crops: Rice, Maize, Sugarcane",
    'fall armyworm': "**Fall Armyworm (FAW) Control**:\n• Chemical: Emamectin benzoate 5 SG (0.4g/L) or Spinetoram 11.7 SC\n• Organic: Bt spray, Neem oil 5ml/L, Sand + lime in whorl\n• Prevention: Early sowing, pheromone traps, bird perches\n• Mainly affects: Maize, Sorghum, Sugarcane",
    'thrips': "**Thrips Control**:\n• Chemical: Fipronil 5 SC (2ml/L) or Spinosad 45 SC (0.3ml/L)\n• Organic: Neem oil 5ml/L, Blue sticky traps\n• Prevention: Spray at early stages, avoid water stress\n• Affected Crops: Onion, Chilli, Cotton, Groundnut",
    'fungus': "**Fungal Disease Management**:\n• Common: Blast, Blight, Rust, Smut, Wilt, Powdery/Downy Mildew\n• Chemical: Mancozeb 75 WP (2.5g/L), Carbendazim 50 WP (1g/L), Copper Oxychloride\n• Organic: Trichoderma viride (5g/L), Pseudomonas fluorescens\n• Prevention: Seed treatment, crop rotation, proper drainage, resistant varieties",
    'blight': "**Blight Management**:\n• Early Blight: Mancozeb 75 WP (2.5g/L) or Chlorothalonil\n• Late Blight: Metalaxyl + Mancozeb (Ridomil Gold 2.5g/L)\n• Bacterial Blight: Streptocycline 0.01% + Copper Oxychloride\n• Prevention: Disease-free seeds, crop rotation, remove infected debris",
    'rust': "**Rust Disease Management**:\n• Chemical: Propiconazole 25 EC (1ml/L) or Tebuconazole\n• Affected Crops: Wheat (Yellow, Brown, Black rust), Groundnut, Soybean\n• Prevention: Use rust-resistant varieties, timely sowing",
    'wilt': "**Wilt Disease Management**:\n• Fusarium Wilt: Soil drenching with Carbendazim (1g/L)\n• Bacterial Wilt: Bleaching powder 10kg/ha in soil\n• Bio-control: Trichoderma harzianum, Pseudomonas fluorescens\n• Prevention: Crop rotation (3-4 years), resistant varieties, proper drainage",
    'powdery mildew': "**Powdery Mildew Management**:\n• Chemical: Sulphur WP 80% (3g/L) or Hexaconazole 5 SC (2ml/L)\n• Organic: Milk spray (1:9 ratio), Baking soda (5g/L)\n• Prevention: Proper spacing, good air circulation, avoid overhead irrigation\n• Affected Crops: Cucurbits, Pea, Wheat, Mango",
    'downy mildew': "**Downy Mildew Management**:\n• Chemical: Metalaxyl + Mancozeb (Ridomil Gold 2.5g/L)\n• Organic: Copper-based fungicides\n• Prevention: Use resistant varieties, proper drainage\n• Affected Crops: Grapes, Cucurbits, Bajra",
    'leaf curl': "**Leaf Curl Virus Management**:\n• No direct cure for virus\n• Control Vector: Spray Imidacloprid 0.3ml/L for whitefly control\n• Prevention: Use virus-resistant varieties, remove infected plants, use reflective mulch\n• Affected Crops: Tomato, Chilli, Cotton",
    'nematode': "**Nematode Control**:\n• Chemical: Carbofuran 3G (33 kg/ha) at sowing\n• Organic: Neem cake 250 kg/ha, Paecilomyces lilacinus bio-agent\n• Prevention: Crop rotation with marigold, deep summer ploughing\n• Affected Crops: Tomato, Brinjal, Okra, Banana",

    // --- Soil & Fertilizer ---
    'fertilizer': "**Fertilizer Guide**:\n• Basal: DAP (Di-Ammonium Phosphate) at sowing\n• Top-dressing: Urea in 2-3 splits\n• Potash: MOP (Muriate of Potash) at sowing\n• Micronutrients: Zinc Sulphate (25 kg/ha), Borax\n• Organic: FYM 10-25 t/ha, Vermicompost 5 t/ha\n• NPK Ratio: 19-19-19 vegetative, 0-52-34 flowering",
    'urea': "**Urea (46-0-0)**:\n• Nitrogen: 46%\n• Use: Top-dressing in 2-3 splits\n• Rate: 100-200 kg/ha depending on crop\n• Govt Price: ~₹266/bag (subsidized)\n• Tip: Apply when soil is moist, not flooded",
    'dap': "**DAP (18-46-0)**:\n• Nitrogen: 18%, Phosphorus: 46%\n• Use: Basal application at sowing\n• Rate: 100-150 kg/ha\n• Market Price: ~₹1,350/bag\n• Best for: Root development and flowering",
    'npk': "**NPK Fertilizer Guide**:\n• 19-19-19: Balanced, good for vegetables\n• 12-32-16: High P, good for flowering\n• 0-52-34: Bloom booster\n• 10-26-26: Good for pulses\n• Apply based on soil test recommendations",
    'soil': "**Soil Types in India**:\n• Alluvial: Best for Rice, Wheat, Sugarcane (Indo-Gangetic plains)\n• Black (Regur): Best for Cotton, Soybean (Deccan Plateau)\n• Red: Suitable for Groundnut, Millets (Southern India)\n• Laterite: Tea, Coffee, Cashew (Western Ghats)\n• Desert: Bajra, Jowar with irrigation (Rajasthan)\n• pH 6-7 is ideal for most crops\n• Get soil tested at nearest KVK",
    'organic farming': "**Organic Farming Guide**:\n• Manures: FYM, Vermicompost, Neem Cake, Green Manuring\n• Bio-fertilizers: Rhizobium (pulses), Azotobacter (cereals), PSB\n• Pest Control: Neem oil, Panchagavya, Dashaparni ark, Bt spray\n• Disease Control: Trichoderma, Pseudomonas\n• Certification: NPOP (India), USDA Organic\n• Govt Support: Paramparagat Krishi Vikas Yojana (PKVY)",
    'vermicompost': "**Vermicompost**:\n• Made using earthworms (Eisenia fetida)\n• Rich in N, P, K + micronutrients\n• Application: 5-10 t/ha\n• Benefits: Improves soil structure, water retention, microbial activity\n• Can be prepared at home using organic waste",
    'irrigation': "**Irrigation Methods**:\n• Flood: Traditional, for Rice, Sugarcane (high water use)\n• Furrow: For row crops like Cotton, Maize\n• Drip: Most efficient (90% savings), for Vegetables, Fruits\n• Sprinkler: Wheat, Pulses, Oilseeds\n• Govt Subsidy: PMKSY - 55-90% subsidy for micro-irrigation",

    // --- Government Schemes ---
    'scheme': "**Major Government Schemes for Farmers**:\n• PM-KISAN: ₹6,000/year to eligible farmers\n• PMFBY: Crop Insurance at low premiums\n• KCC: Kisan Credit Card - loans at 4% interest\n• eNAM: National Agriculture Market for selling crops online\n• Soil Health Card: Free soil testing\n• PMKSY: Irrigation subsidy\n• MSP: Government buys at Minimum Support Price",
    'pm-kisan': "**PM-KISAN Scheme**:\n• Benefit: ₹6,000/year in 3 installments of ₹2,000\n• Eligibility: All land-holding farmer families\n• Apply: pmkisan.gov.in or through CSC\n• Documents: Aadhaar, Land records, Bank account",
    'pmfby': "**PMFBY (Crop Insurance)**:\n• Premium: 2% Kharif, 1.5% Rabi, 5% Commercial/Horticulture\n• Coverage: Natural calamities, pests, diseases\n• Claim: Through insurance company or bank\n• Apply: Before sowing deadline at bank/CSC",
    'kcc': "**Kisan Credit Card (KCC)**:\n• Loan: Up to ₹3 lakh at 4% interest\n• Repayment: Flexible, crop cycle based\n• Apply: Any nationalized bank with land documents\n• Benefits: Crop insurance, personal accident cover",
    'subsidy': "**Subsidy Information**:\n• Drip Irrigation: 55-90% subsidy (PMKSY)\n• Fertilizer: Govt subsidized Urea at ₹266/bag\n• Farm Equipment: 40-50% subsidy on tools\n• Organic Farming: ₹50,000/ha under PKVY\n• Solar Pump: PM-KUSUM Yojana - 60% subsidy\n• Apply via: CSC centers, state agriculture dept",
    'loan': "**Farm Loan Information**:\n• KCC: Up to ₹3 lakh at 4% interest\n• NABARD: Long-term loans for farm development\n• SHG Loans: For women farmer groups\n• PM-KISAN: Direct income support ₹6,000/year\n• Apply at: Any nationalized bank or cooperative bank",
    'msp': "**Minimum Support Price (MSP)**:\n• Paddy: ₹2,183/Qtl | Wheat: ₹2,275/Qtl\n• Cotton: ₹6,620-₹7,020/Qtl | Jowar: ₹3,180/Qtl\n• Tur: ₹7,000/Qtl | Moong: ₹8,558/Qtl\n• Mustard: ₹5,650/Qtl | Groundnut: ₹6,377/Qtl\n• Sugarcane FRP: ₹315/Qtl\n• Buy at: APMC mandis, govt procurement centers",

    // --- Seasonal Advice ---
    'kharif': "**Kharif Season (June-October)**:\n• Major Crops: Rice, Maize, Cotton, Soybean, Groundnut, Bajra, Jowar\n• Sowing: June-July (with monsoon)\n• Harvest: Sept-Nov\n• Key Activities: Land prep (May), sowing with first rains, pest scouting, weed management",
    'rabi': "**Rabi Season (October-March)**:\n• Major Crops: Wheat, Mustard, Gram, Barley, Pea, Lentil\n• Sowing: Oct-Nov\n• Harvest: March-April\n• Key Activities: Seed treatment, timely irrigation, rust monitoring in wheat",
    'zaid': "**Zaid Season (March-June)**:\n• Major Crops: Watermelon, Muskmelon, Cucumber, Moong, Sunflower\n• Short duration crops between Rabi harvest and Kharif sowing\n• Needs irrigation (no rain)",
    'harvest': "**Harvesting Tips**:\n• Harvest at right moisture (Rice: 20-22%, Wheat: 12-14%)\n• Use combine harvesters for efficiency\n• Dry grains to 12-14% moisture for safe storage\n• Store in clean, dry godowns, use fumigation if needed\n• Sell at APMC or through eNAM portal"
  };

  // ============================================================
  // 2. MARKET PRICE DATABASE (50+ Crops)
  // ============================================================
  const priceDatabase = {
    'rice': "Common: ₹2,200 | Basmati: ₹3,500-₹5,000", 'paddy': "MSP: ₹2,183 | Grade A: ₹2,203",
    'wheat': "MSP: ₹2,275 | Market: ₹2,400-₹2,700", 'maize': "MSP: ₹2,090 | Market: ₹2,100-₹2,400",
    'barley': "MSP: ₹1,850 | Market: ₹1,900-₹2,200", 'jowar': "MSP: ₹3,180 (Hybrid) | ₹3,225 (Maldandi)",
    'sorghum': "MSP: ₹3,180 (Hybrid) | ₹3,225 (Maldandi)", 'bajra': "MSP: ₹2,500 | Market: ₹2,300-₹2,600",
    'pearl millet': "MSP: ₹2,500 | Market: ₹2,300-₹2,600", 'ragi': "MSP: ₹3,846 | Market: ₹3,500-₹4,000",
    'finger millet': "MSP: ₹3,846 | Market: ₹3,500-₹4,000", 'foxtail millet': "₹3,000-₹4,500",
    'little millet': "₹3,500-₹5,000", 'kodo millet': "₹3,200-₹4,800",
    'gram': "MSP: ₹5,440 | Market: ₹5,800-₹6,500", 'chana': "MSP: ₹5,440 | Market: ₹5,800-₹6,500",
    'chickpea': "MSP: ₹5,440 | Market: ₹5,800-₹6,500", 'arhar': "MSP: ₹7,000 | Market: ₹8,500-₹10,500",
    'tur': "MSP: ₹7,000 | Market: ₹8,500-₹10,500", 'pigeon pea': "MSP: ₹7,000 | Market: ₹8,500-₹10,500",
    'moong': "MSP: ₹8,558 | Market: ₹7,500-₹9,000", 'green gram': "MSP: ₹8,558 | Market: ₹7,500-₹9,000",
    'urad': "MSP: ₹6,950 | Market: ₹7,200-₹8,500", 'black gram': "MSP: ₹6,950 | Market: ₹7,200-₹8,500",
    'masoor': "MSP: ₹6,425 | Market: ₹6,500-₹7,200", 'lentil': "MSP: ₹6,425 | Market: ₹6,500-₹7,200",
    'rajma': "₹8,000-₹11,000", 'kidney bean': "₹8,000-₹11,000",
    'horse gram': "₹4,000-₹6,000", 'cowpea': "₹5,500-₹7,500",
    'groundnut': "MSP: ₹6,377 | Market: ₹6,500-₹7,500", 'mustard': "MSP: ₹5,650 | Market: ₹5,200-₹5,800",
    'soybean': "MSP: ₹4,600 | Market: ₹4,200-₹4,800", 'sunflower': "MSP: ₹6,760 | Market: ₹6,000-₹7,000",
    'sesame': "MSP: ₹8,635 | Market: ₹9,000-₹12,000", 'til': "MSP: ₹8,635 | Market: ₹9,000-₹12,000",
    'castor': "₹5,500-₹6,200", 'linseed': "₹5,500-₹6,500",
    'safflower': "MSP: ₹5,800 | Market: ₹5,500-₹6,000",
    'cotton': "Medium Staple: ₹6,620 | Long Staple: ₹7,020", 'jute': "MSP: ₹5,050 | Market: ₹4,800-₹5,500",
    'sugarcane': "FRP: ₹315/Quintal", 'tobacco': "₹3,000-₹6,000 (leaves)",
    'indigo': "Niche Market: Rates vary",
    'tea': "Auction: ₹150-₹250/kg", 'coffee': "Arabica: ₹250-₹350/kg | Robusta: ₹150-₹200/kg",
    'rubber': "RSS-4: ₹150-₹180/kg", 'coconut': "Copra: ₹10,860/Qtl | Ball Copra: ₹11,750/Qtl",
    'arecanut': "₹35,000-₹45,000/Quintal",
    'black pepper': "₹500-₹600/kg", 'pepper': "₹500-₹600/kg", 'cardamom': "₹1,500-₹2,500/kg",
    'turmeric': "₹6,000-₹9,000/Qtl (Nizamabad)", 'ginger': "₹4,000-₹8,000/Qtl",
    'coriander': "₹6,500-₹8,500/Qtl", 'cumin': "₹25,000-₹30,000/Qtl (Unjha)",
    'jeera': "₹25,000-₹30,000/Qtl (Unjha)", 'clove': "₹800-₹1,000/kg",
    'red chilli': "₹15,000-₹25,000/Qtl (Guntur)", 'chilli': "Green: ₹3,000-₹5,000/Qtl | Dry: ₹15,000-₹25,000/Qtl",
    'mango': "₹2,500-₹5,000/Qtl (Season)", 'banana': "₹1,000-₹2,000/Qtl",
    'apple': "₹6,000-₹12,000/Qtl (Shimla/Kashmir)", 'orange': "₹2,500-₹4,500/Qtl (Nagpur)",
    'guava': "₹1,500-₹3,000/Qtl", 'pomegranate': "₹5,000-₹9,000/Qtl (Bhagawa)",
    'tomato': "₹1,200-₹3,000/Qtl | Retail: ₹30-₹60/kg", 'onion': "₹2,500-₹5,000/Qtl | Retail: ₹40-₹80/kg",
    'potato': "₹1,000-₹1,800/Qtl | Retail: ₹20-₹35/kg", 'brinjal': "₹1,500-₹2,500/Qtl",
    'okra': "₹2,000-₹4,000/Qtl", 'cabbage': "₹800-₹1,500/Qtl", 'cauliflower': "₹1,200-₹2,500/Qtl"
  };

  // ============================================================
  // 3. UTILITY FUNCTIONS
  // ============================================================
  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    if (sender === 'bot') {
      let html = text;
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\n/g, '<br>');
      html = html.replace(/•/g, '&bull;');
      html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" style="color:#4338ca;text-decoration:underline;">$1</a>');
      html = html.replace(/(^|[^"'=])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank">$2</a>');
      messageDiv.innerHTML = html;
    } else {
      messageDiv.innerText = text;
    }
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showLoading() {
    const el = document.createElement('div');
    el.classList.add('message', 'bot');
    el.innerHTML = '<em>🔍 Searching for the best answer...</em>';
    el.id = "loading-message";
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function hideLoading() {
    const el = document.getElementById('loading-message');
    if (el) el.remove();
  }

  // Question-type aware response formatting
  function detectQuestionType(query) {
    var q = query.trim().toLowerCase();
    if (/^what\b/i.test(q)) return 'what';
    if (/^how\b/i.test(q)) return 'how';
    if (/^why\b/i.test(q)) return 'why';
    if (/^when\b/i.test(q)) return 'when';
    if (/^which\b/i.test(q)) return 'which';
    if (/^where\b/i.test(q)) return 'where';
    return 'general';
  }

  function formatResponse(answer, questionType, rawQuery) {
    if (!answer) return answer;
    // If already formatted nicely from KB, return as-is
    if (answer.indexOf('**') === 0) return answer;

    switch (questionType) {
      case 'what':
        return '**📖 Definition:**\n' + answer + '\n\n*🌾 Farming Relevance: This information can help you make better farming decisions.*';
      case 'how':
        return '**📋 Step-by-Step Guide:**\n' + answer;
      case 'why':
        return '**❓ Reason:**\n' + answer + '\n\n*Understanding this helps you plan better and avoid risks.*';
      case 'when':
        return '**📅 Timing:**\n' + answer;
      default:
        return answer;
    }
  }

  async function fetchSafe(url, timeoutMs) {
    timeoutMs = timeoutMs || 8000;
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      return res;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  // ============================================================
  // 4. SMART INTENT DETECTION
  // ============================================================
  function extractSubject(query) {
    // Remove common question words and fillers to extract the core subject
    let q = query.toLowerCase().trim();
    const patterns = [
      /^(how\s+to\s+)/i, /^(how\s+do\s+i\s+)/i, /^(how\s+can\s+i\s+)/i,
      /^(what\s+is\s+)/i, /^(what\s+are\s+)/i, /^(what\s+is\s+the\s+)/i,
      /^(tell\s+me\s+about\s+)/i, /^(explain\s+)/i, /^(describe\s+)/i,
      /^(can\s+you\s+)/i, /^(please\s+)/i, /^(help\s+me\s+with\s+)/i,
      /^(i\s+want\s+to\s+know\s+about\s+)/i, /^(i\s+need\s+help\s+with\s+)/i,
      /^(give\s+me\s+info\s+on\s+)/i, /^(info\s+about\s+)/i,
      /^(who\s+is\s+)/i, /^(where\s+is\s+)/i, /^(when\s+is\s+)/i,
      /^(why\s+is\s+)/i, /^(which\s+is\s+)/i,
      /(\?+)$/
    ];
    patterns.forEach(p => { q = q.replace(p, '').trim(); });
    return q;
  }

  function getLocalResponse(rawQuery) {
    const q = rawQuery.toLowerCase().trim();
    const subject = extractSubject(rawQuery);

    // --- Greetings (exact or near-exact match) ---
    if (/^(hi|hey|hello|hii+)$/i.test(q.replace(/[!.?]/g, '').trim())) {
      return "Hello! 👋 I am your **Agri1 AI Assistant**. Ask me about:\n• 🌾 Crops & cultivation\n• 🐛 Pest & disease control\n• 💰 Market prices (50+ crops)\n• 🌤️ Live weather\n• 🏛️ Govt schemes & subsidies\n• 📚 Any topic (via Wikipedia)\n\nJust type your question!";
    }
    if (/^(namaste|namaskar)$/i.test(q.replace(/[!.?]/g, '').trim())) {
      return "Namaste! 🙏 I am your **Agri1 AI Assistant**. Ask me about crops, pests, weather, prices, or government schemes!";
    }
    if (q.includes('who are you') || q.includes('what are you')) {
      return "I am **Agri1**, your personal AI farming assistant. I know about 50+ crop prices, cultivation methods, pest control, government schemes, and I can search Wikipedia for anything else!";
    }
    if (q.includes('what can you do') || q.includes('help me') && q.length < 20) {
      return "I can help with:\n• 🌾 Crop cultivation (Rice, Wheat, Cotton, Vegetables...)\n• 🐛 Pest & disease management\n• 💰 Market prices for 50+ crops\n• 🌤️ Live weather data\n• 🏛️ Government schemes (PM-KISAN, PMFBY, KCC...)\n• 📚 Any general question (via Wikipedia)\n\nJust ask!";
    }
    if (/\b(thank|thanks|thankyou|thank\s*you|dhanyavad)\b/i.test(q)) {
      return "You're welcome! Happy farming! 🌱";
    }
    if (/\b(bye|goodbye|good\s*bye|alvida)\b/i.test(q)) {
      return "Goodbye! Wishing you a great harvest! 🌾";
    }

    // --- Price / Mandi Intent ---
    if (/\b(price|rate|cost|mandi|msp|market\s*value|bhav)\b/i.test(q)) {
      const crops = Object.keys(priceDatabase).sort((a, b) => b.length - a.length);
      for (const crop of crops) {
        if (q.includes(crop) || subject.includes(crop)) {
          const label = crop.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
          return "**💰 Market Rate: " + label + "**\n" + priceDatabase[crop] + "\n\n**📊 Advice:**\n• Prices change daily — check your nearest APMC mandi for today's rate.\n• If price is low, consider storing (if possible) and selling after 2-4 weeks.\n• If price is at or above MSP, it is a good time to sell.\n• Use **eNAM portal** to compare rates across mandis.\n*(Prices shown are approximate averages per Quintal unless specified.)*";
        }
      }
      return "I have prices for **50+ crops** including Rice, Wheat, Cotton, Pulses, Spices, Fruits & more.\nAsk: **'Price of [Crop Name]'**\n\nI need the crop name to give accurate price advice.";
    }

    // --- Farming Knowledge (check both raw query and extracted subject) ---
    const kbKeys = Object.keys(farmingKB).sort((a, b) => b.length - a.length);
    for (const key of kbKeys) {
      if (q.includes(key) || subject.includes(key)) {
        return farmingKB[key];
      }
    }

    // --- "How to grow X" / "How to cultivate X" ---
    if (/\b(grow|cultivat|plant|sow|farm)\b/i.test(q)) {
      const cropNames = Object.keys(farmingKB).filter(k => !k.includes(' '));
      const longest = cropNames.sort((a, b) => b.length - a.length);
      for (const c of longest) {
        if (q.includes(c) || subject.includes(c)) {
          return farmingKB[c];
        }
      }
    }

    // --- "How to treat/control/kill X" ---
    if (/\b(treat|control|kill|remove|cure|spray|manage)\b/i.test(q)) {
      const pestKeys = ['fall armyworm', 'stem borer', 'powdery mildew', 'downy mildew', 'leaf curl',
        'bollworm', 'whitefly', 'aphids', 'thrips', 'nematode', 'fungus', 'blight', 'rust', 'wilt'];
      for (const p of pestKeys) {
        if (q.includes(p) || subject.includes(p)) {
          return farmingKB[p];
        }
      }
      // Generic pest/disease
      if (/\b(pest|bug|insect|keet)\b/i.test(q)) return farmingKB['aphids'] + "\n\n*Ask about specific pests like 'whitefly', 'bollworm', 'stem borer', 'fall armyworm' for targeted control methods.*";
      if (/\b(disease|infection|rog|bimari)\b/i.test(q)) return farmingKB['fungus'] + "\n\n*Ask about 'blight', 'rust', 'wilt', 'powdery mildew', 'leaf curl' for specific treatment.*";
    }

    // --- Government / Scheme / Subsidy / Loan ---
    if (/\b(government|govt|scheme|yojana|pm.kisan|pmfby|kcc|subsidy|grant|loan|credit|insurance)\b/i.test(q)) {
      if (q.includes('pm-kisan') || q.includes('pm kisan') || q.includes('pmkisan')) return farmingKB['pm-kisan'];
      if (q.includes('pmfby') || q.includes('crop insurance')) return farmingKB['pmfby'];
      if (q.includes('kcc') || q.includes('kisan credit')) return farmingKB['kcc'];
      if (/\b(subsidy|grant)\b/i.test(q)) return farmingKB['subsidy'];
      if (/\b(loan|credit)\b/i.test(q)) return farmingKB['loan'];
      if (/\b(msp|minimum support)\b/i.test(q)) return farmingKB['msp'];
      return farmingKB['scheme'];
    }

    // --- Soil / Organic / Irrigation ---
    if (/\b(soil|land\s*type|mitti)\b/i.test(q)) return farmingKB['soil'];
    if (/\b(organic|jaivik)\b/i.test(q)) return farmingKB['organic farming'];
    if (/\b(irrigation|drip|sprinkler|sinchai)\b/i.test(q)) return farmingKB['irrigation'];
    if (/\b(vermicompost|kechua khad)\b/i.test(q)) return farmingKB['vermicompost'];
    if (/\b(urea)\b/i.test(q)) return farmingKB['urea'];
    if (/\b(dap)\b/i.test(q)) return farmingKB['dap'];
    if (/\b(npk)\b/i.test(q)) return farmingKB['npk'];
    if (/\b(fertilizer|fertiliser|khad|nutrient)\b/i.test(q)) return farmingKB['fertilizer'];

    // --- Seasonal ---
    if (/\b(kharif|monsoon\s*crop)\b/i.test(q)) return farmingKB['kharif'];
    if (/\b(rabi|winter\s*crop)\b/i.test(q)) return farmingKB['rabi'];
    if (/\b(zaid|summer\s*crop)\b/i.test(q)) return farmingKB['zaid'];
    if (/\b(harvest|storage|post.harvest)\b/i.test(q)) return farmingKB['harvest'];

    return null;
  }

  // ============================================================
  // 5. EXTERNAL APIs (CORS-safe, work on all platforms)
  // ============================================================
  function buildWikiQuery(query) {
    let q = query.toLowerCase().trim();
    const removePatterns = [
      /^(how\s+to\s+)/i, /^(how\s+do\s+i\s+)/i, /^(how\s+can\s+i\s+)/i,
      /^(what\s+is\s+)/i, /^(what\s+are\s+)/i, /^(tell\s+me\s+about\s+)/i,
      /^(explain\s+)/i, /^(describe\s+)/i, /^(can\s+you\s+)/i,
      /^(please\s+)/i, /^(help\s+me\s+with\s+)/i, /^(i\s+want\s+to\s+know\s+about\s+)/i,
      /(\?+)$/
    ];
    removePatterns.forEach(p => { q = q.replace(p, '').trim(); });

    if (/\b(grow|cultivat|plant|sow)\b/.test(q)) {
      const crop = q.replace(/\b(grow|plant|seed|sow|cultivate|cultivation|farming)\b/g, '').trim();
      if (crop.length > 2) return crop + ' agriculture';
    }
    if (/\b(treat|control|kill|remove|cure)\b/.test(q)) {
      const pest = q.replace(/\b(treat|control|kill|remove|cure|pest|disease|how|do|i|get|rid|of|my|crop|has|the)\b/g, '').trim();
      if (pest.length > 2) return pest + ' pest control';
    }
    return q;
  }

  async function callWeatherAPI() {
    var wd = await fetchWeatherData();
    if (!wd) return 'Real-time weather data is currently unavailable. Please try again.';

    var codes = {
      0: "☀️ Clear sky", 1: "🌤️ Mainly clear", 2: "⛅ Partly cloudy", 3: "☁️ Overcast",
      45: "🌫️ Foggy", 51: "🌧️ Light drizzle", 61: "🌧️ Rain", 71: "❄️ Snow", 80: "🌧️ Showers", 95: "⛈️ Thunderstorm"
    };
    var desc = codes[wd.weathercode] || "🌤️ Fair";

    var result = '**🌤️ Live Weather — ' + wd.city + (wd.state ? ', ' + wd.state : '') + '**';
    result += '\n• 🌡️ Temperature: **' + wd.temp + '°C**';
    if (wd.humidity !== null) result += '\n• 💧 Humidity: **' + wd.humidity + '%**';
    result += '\n• 💨 Wind: **' + wd.windspeed + ' km/h**';
    result += '\n• ☁️ Condition: ' + desc;
    if (wd.rainProbability !== null) result += '\n• 🌧️ Rain Probability: **' + wd.rainProbability + '%**';

    // 3-day forecast
    if (wd.dailyMax.length >= 3) {
      var days = ['Today', 'Tomorrow', 'Day 3'];
      result += '\n\n**📅 3-Day Forecast:**';
      for (var i = 0; i < 3; i++) {
        var dc = codes[wd.dailyCodes[i]] || '🌤️';
        result += '\n• ' + days[i] + ': ' + wd.dailyMin[i] + '-' + wd.dailyMax[i] + '°C, Rain: ' + (wd.dailyRain[i] || 0) + 'mm ' + dc;
      }
    }

    // Smart farming advice
    result += '\n\n**🌾 Farming Advice for ' + wd.city + ':**';
    if (wd.temp > 40) result += '\n• 🔥 Extreme heat! Irrigate early morning/evening. Use mulching. Shade nets for nurseries.';
    else if (wd.temp > 35) result += '\n• ☀️ Hot weather. Regular irrigation needed. Spray pesticides early morning only.';
    else if (wd.temp > 25) result += '\n• ✅ Good growing conditions. Monitor for pests. Ideal for field work.';
    else if (wd.temp > 15) result += '\n• ❄️ Cool weather — good for Rabi (Wheat, Mustard, Gram). Watch for frost below 5°C.';
    else result += '\n• 🥶 Very cold! Protect crops from frost with smoke/light irrigation. Cover nurseries.';

    if (wd.rainProbability > 60) result += '\n• 🌧️ High rain chance — avoid spraying. Postpone irrigation. Ensure drainage.';
    else if (wd.rainProbability > 30) result += '\n• 🌦️ Some rain possible — plan field operations accordingly.';
    else result += '\n• 💧 Low rain — irrigation may be needed for water-sensitive crops.';

    if (wd.humidity > 80) result += '\n• ⚠️ High humidity — fungal disease risk! Scout for blight, mildew. Apply preventive fungicide.';
    if (wd.humidity < 30) result += '\n• ⚠️ Very dry air — increase irrigation frequency. Use drip if available.';

    return result;
  }

  async function callWikipediaAPI(query) {
    try {
      var searchUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(query) + '&srlimit=3&format=json&origin=*';
      var searchRes = await fetchSafe(searchUrl);
      var searchData = await searchRes.json();

      if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
        return null;
      }

      var pageTitle = searchData.query.search[0].title;
      var summaryUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&exsentences=8&titles=' + encodeURIComponent(pageTitle) + '&format=json&origin=*';
      var summaryRes = await fetchSafe(summaryUrl);
      var summaryData = await summaryRes.json();

      var pages = summaryData.query.pages;
      var pageId = Object.keys(pages)[0];
      var extract = pages[pageId].extract;

      if (extract && extract.length > 30) {
        return "**📚 " + pageTitle + "**\n" + extract;
      }
      return null;
    } catch (error) {
      console.error("Wikipedia API Error:", error);
      return null;
    }
  }

  // ============================================================
  // 6. MAIN HANDLER
  // ============================================================
  async function handleSend() {
    var text = userInput.value.trim();
    if (text === '') return;

    addMessage(text, 'user');
    userInput.value = '';
    sendBtn.disabled = true;
    userInput.disabled = true;
    showLoading();

    var response = null;
    var lowerText = text.toLowerCase();

    var questionType = detectQuestionType(text);

    try {
      // Step 1: Local farming knowledge
      response = getLocalResponse(text);

      // Step 2: Weather intent
      if (!response && /\b(weather|temperature|forecast|climate|mausam|rain|barish|humidity|wind)\b/i.test(lowerText)) {
        response = await callWeatherAPI();
      }

      // Step 3: Wikipedia (try optimized query, then raw)
      if (!response) {
        var wikiQuery = buildWikiQuery(text);
        response = await callWikipediaAPI(wikiQuery);
        if (!response && wikiQuery.toLowerCase() !== text.toLowerCase()) {
          response = await callWikipediaAPI(text);
        }
      }

      // Apply question-type formatting
      if (response) {
        response = formatResponse(response, questionType, text);
      }

      // Step 4: For farming-related queries, append live weather context
      var isFarmingQuery = /\b(crop|grow|cultivat|plant|sow|pest|disease|irrigat|water|spray|harvest|seed|fertiliz)\b/i.test(lowerText);
      if (response && isFarmingQuery) {
        var wd = await fetchWeatherData();
        if (wd) {
          response += getWeatherContext(wd);
        }
      }

      // Step 5: Fallback
      if (!response) {
        var googleUrl = 'https://www.google.com/search?q=' + encodeURIComponent(text);
        response = "I need more details to give accurate advice. 🤔\n\nMeanwhile, you can try:\n• Be specific (e.g., 'How to grow rice?' or 'Price of wheat')\n• Ask about a crop, pest, disease, or scheme\n\n👉 **[Search Google for \"" + text + "\"](" + googleUrl + ")**";
      }
    } catch (err) {
      console.error("handleSend error:", err);
      response = "Sorry, something went wrong. Please check your internet connection and try again.";
    }

    hideLoading();
    addMessage(response, 'bot');
    sendBtn.disabled = false;
    userInput.disabled = false;
    userInput.focus();
  }

  // ============================================================
  // 7. EVENT LISTENERS
  // ============================================================
  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') handleSend();
  });

  document.querySelectorAll('.suggestion-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      userInput.value = chip.innerText;
      handleSend();
    });
  });

  // Auto-query from URL params
  var urlParams = new URLSearchParams(window.location.search);
  var autoQuery = urlParams.get('q');
  if (autoQuery) {
    setTimeout(function () {
      userInput.value = autoQuery;
      handleSend();
    }, 500);
  }
});