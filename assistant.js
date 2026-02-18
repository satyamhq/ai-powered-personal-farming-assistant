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
  // 4. LIVE MANDI PRICE API (data.gov.in)
  // ============================================================
  const MANDI_API_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
  const MANDI_API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
  const mandiCache = {};

  // Hindi crop name → English API name
  var hindiCropMap = {
    'gehu': 'Wheat', 'gehun': 'Wheat', 'गेहूं': 'Wheat', 'गेहू': 'Wheat',
    'dhan': 'Paddy(Dhan)(Common)', 'chawal': 'Rice', 'चावल': 'Rice', 'धान': 'Paddy(Dhan)(Common)',
    'makka': 'Maize', 'makki': 'Maize', 'मक्का': 'Maize',
    'chana': 'Bengal Gram(Gram)(Whole)', 'चना': 'Bengal Gram(Gram)(Whole)',
    'sarson': 'Mustard', 'सरसों': 'Mustard',
    'kapas': 'Cotton', 'कपास': 'Cotton',
    'tamatar': 'Tomato', 'टमाटर': 'Tomato',
    'pyaz': 'Onion', 'pyaaz': 'Onion', 'प्याज': 'Onion',
    'aloo': 'Potato', 'आलू': 'Potato',
    'soyabean': 'Soyabean', 'soya': 'Soyabean', 'सोयाबीन': 'Soyabean',
    'moong': 'Green Gram (Moong)(Whole)', 'मूंग': 'Green Gram (Moong)(Whole)',
    'urad': 'Black Gram (Urd Beans)(Whole)', 'उड़द': 'Black Gram (Urd Beans)(Whole)',
    'arhar': 'Arhar (Tur/Red Gram)(Whole)', 'tur': 'Arhar (Tur/Red Gram)(Whole)', 'तूर': 'Arhar (Tur/Red Gram)(Whole)',
    'bhindi': 'Bhindi(Ladies Finger)', 'भिंडी': 'Bhindi(Ladies Finger)',
    'gobhi': 'Cauliflower', 'gobi': 'Cauliflower', 'गोभी': 'Cauliflower',
    'matar': 'Peas', 'मटर': 'Peas',
    'lahsun': 'Garlic', 'लहसुन': 'Garlic',
    'adrak': 'Ginger', 'अदरक': 'Ginger',
    'mirch': 'Chillies', 'mirchi': 'Chillies', 'मिर्ची': 'Chillies',
    'ganna': 'Sugarcane', 'गन्ना': 'Sugarcane',
    'baigan': 'Brinjal', 'baingan': 'Brinjal', 'बैंगन': 'Brinjal',
    'jeera': 'Cumin Seed', 'जीरा': 'Cumin Seed',
    'haldi': 'Turmeric', 'हल्दी': 'Turmeric',
    'mungfali': 'Groundnut', 'moongfali': 'Groundnut', 'मूंगफली': 'Groundnut',
    'jowar': 'Jowar(Sorghum)', 'ज्वार': 'Jowar(Sorghum)',
    'bajra': 'Bajra(Pearl Millet)', 'बाजरा': 'Bajra(Pearl Millet)'
  };

  async function fetchLiveMandiPrice(cropName) {
    if (!cropName) return null;
    var cacheKey = cropName.toLowerCase();
    if (mandiCache[cacheKey] && (Date.now() - mandiCache[cacheKey].ts) < 5 * 60 * 1000) {
      return mandiCache[cacheKey].data;
    }
    try {
      var url = MANDI_API_BASE + '?api-key=' + MANDI_API_KEY + '&format=json&limit=15&filters[commodity]=' + encodeURIComponent(cropName);
      var res = await fetchSafe(url, 10000);
      var json = await res.json();
      var records = json.records || [];
      if (records.length > 0) {
        mandiCache[cacheKey] = { data: records, ts: Date.now() };
      }
      return records.length > 0 ? records : null;
    } catch (e) {
      console.error('Mandi API error:', e);
      return null;
    }
  }

  function formatMandiResponse(records, cropName) {
    var label = cropName.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
    var prices = records.map(function (r) { return parseFloat(r.modal_price) || 0; }).filter(function (p) { return p > 0; });
    var avg = prices.length > 0 ? prices.reduce(function (a, b) { return a + b; }, 0) / prices.length : 0;
    var sorted = records.slice().sort(function (a, b) { return (parseFloat(b.modal_price) || 0) - (parseFloat(a.modal_price) || 0); });
    var best = sorted[0];
    var worst = sorted[sorted.length - 1];
    var bestPrice = parseFloat(best.modal_price) || 0;
    var worstPrice = parseFloat(worst.modal_price) || 0;

    // Lead with best mandi recommendation
    var result = '**📍 Best Mandi: Sell ' + label + ' at ' + (best.market || '') + ', ' + (best.state || '') + ' — ₹' + bestPrice.toLocaleString('en-IN') + '/Qtl**\n';
    result += '*(₹' + Math.round(bestPrice - avg).toLocaleString('en-IN') + ' above average of ₹' + Math.round(avg).toLocaleString('en-IN') + '/Qtl)*\n\n';

    // Top markets (max 5, concise)
    var shown = Math.min(records.length, 5);
    for (var i = 0; i < shown; i++) {
      var r = records[i];
      var modal = parseFloat(r.modal_price) || 0;
      var market = (r.market || '?') + ', ' + (r.state || '');
      var diffFromAvg = modal - avg;
      var diffLabel = diffFromAvg >= 0 ? '▲₹' + Math.round(diffFromAvg) : '▼₹' + Math.round(Math.abs(diffFromAvg));
      result += (i === 0 ? '🏆 ' : '• ') + '**' + market + '** — ₹' + modal.toLocaleString('en-IN') + '/Qtl (' + diffLabel + ' avg)\n';
    }
    if (records.length > shown) {
      result += '\n*+' + (records.length - shown) + ' more markets on [Market page](market.html?q=' + encodeURIComponent(cropName) + ')*\n';
    }

    // Smart recommendation
    var spread = prices.length > 0 ? ((Math.max.apply(null, prices) - Math.min.apply(null, prices)) / avg * 100).toFixed(0) : 0;
    result += '\n**💡 Recommendation:** ';
    if (spread > 30) {
      result += 'Price difference is large (' + spread + '%). Compare mandis and sell at the best one. Transport may be worth it!';
    } else if (bestPrice > avg * 1.1) {
      result += 'Prices are good. Sell now at ' + (best.market || 'best mandi') + ' for the best return.';
    } else if (worstPrice < avg * 0.85) {
      result += 'Prices are low in some markets. Avoid selling at ' + (worst.market || 'lowest market') + '. Store if possible and wait.';
    } else {
      result += 'Prices are stable across markets. Good time to sell at your nearest mandi.';
    }

    result += '\n\n👉 **[See all prices](market.html?q=' + encodeURIComponent(cropName) + ')**';
    return result;
  }

  // Extract crop name from a price query (English + Hindi)
  function extractCropFromPriceQuery(query) {
    var q = query.toLowerCase().trim();

    // Check Hindi crop names first
    var hindiKeys = Object.keys(hindiCropMap);
    for (var h = 0; h < hindiKeys.length; h++) {
      if (q.includes(hindiKeys[h])) {
        return hindiCropMap[hindiKeys[h]];
      }
    }

    // Remove price-related words (English + Hindi)
    q = q.replace(/\b(price|rate|cost|mandi|msp|market|value|bhav|daam|kimat|kharcha|ka|ki|ke|kya|hai|batao|bata|dikhao|dikha|kitna|kitne|kitni|aaj|abhi|of|for|the|what|is|are|how|much|today|current|live|show|tell|me|get|check)\b/gi, '').trim();

    // Also try matching against known crops
    var crops = Object.keys(priceDatabase).sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < crops.length; i++) {
      if (query.toLowerCase().includes(crops[i])) return crops[i];
    }
    return q || null;
  }

  // ============================================================
  // 5. SMART INTENT DETECTION
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
    if (/^(hi|hey|hello|hii+|start|wake|up)$/i.test(q.replace(/[!.?]/g, '').trim())) {
      return "Namaste! 👋 Main hoon **AgriBot**, aapka farming assistant.\n\n🌾 Crop advice | 💰 Mandi prices | 🌤️ Weather | 🐛 Pest help\n\nPuchho: *'Gehu ka bhav'* ya *'Price of cotton'*";
    }
    if (/^(namaste|namaskar|jai\s*hind|jai\s*jawan|ram\s*ram|pranam)$/i.test(q.replace(/[!.?]/g, '').trim())) {
      return "Namaste! 🙏 Main **Agri1 AI Assistant** hoon. Puchho — fasal, keede, mausam, bhav, sarkari yojana — sab bataunga!";
    }
    if (q.includes('who are you') || q.includes('what are you') || q.includes('kaun ho') || q.includes('kaun hai')) {
      return "Main **Agri1** hoon — aapka AI farming assistant! 50+ faslon ke bhav, kheti ki salah, keet niyantran, sarkari yojanaein — sab jaanta hoon.";
    }
    if (q.includes('what can you do') || q.includes('kya kar sakte') || (q.includes('help') && q.length < 20) || q.includes('madad')) {
      return "Main help kar sakta hoon:\n• 🌾 Fasal ki jaankari\n• 🐛 Keet/rog samadhan\n• 💰 50+ faslon ke live bhav\n• 🌤️ Mausam\n• 🏛️ Sarkari yojanaein\n\nBas puchho!";
    }
    if (/\b(thank|thanks|thankyou|thank\s*you|dhanyavad|shukriya)\b/i.test(q)) {
      return "Dhanyavaad! Acchi fasal ki shubhkaamnayein! 🌱";
    }
    if (/\b(bye|goodbye|good\s*bye|alvida|chalo)\b/i.test(q)) {
      return "Alvida! Acchi fasal ho! 🌾";
    }

    // --- Founder / Creator ---
    if (/\b(satyam\s*kumar|satyam)\b/i.test(q) || q.includes('founder') || q.includes('creator') || q.includes('who made') || q.includes('who built') || q.includes('kisne banaya')) {
      return "👨‍💻 **Satyam Kumar** — Founder & Developer of Agri1\n\n" +
        "Satyam Kumar is the **founder and sole developer** of the **Agri1 platform** — an AI-powered personal farming assistant built to empower Indian farmers with technology.\n\n" +
        "🌾 **What he built:**\n" +
        "• Live mandi prices from 300+ markets across India\n" +
        "• AI chatbot for crop guidance, pest control & weather\n" +
        "• 7-day weather forecast with farming advisory\n" +
        "• Government scheme finder for farmers\n\n" +
        "🎯 **Vision:** To make smart farming accessible to every farmer in India — from small-scale to commercial — using AI and real-time data.\n\n" +
        "📍 Built with ❤️ at LPU, India";
    }

    // --- Price / Mandi Intent (English + Hindi) ---
    if (/\b(price|rate|cost|mandi|msp|market\s*value|bhav|daam|kimat|kharcha|kitna|kitne)\b/i.test(q)) {
      return '__LIVE_PRICE_INTENT__'; // Signal to handleSend to fetch live data
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
      // Generic pest/disease (Hindi + English)
      if (/\b(pest|bug|insect|keet|keede|कीट)\b/i.test(q)) return farmingKB['aphids'] + "\n\n*Specific pest puchho — 'whitefly', 'bollworm', 'stem borer', 'fall armyworm' for targeted control.*";
      if (/\b(disease|infection|rog|bimari|बीमारी|रोग)\b/i.test(q)) return farmingKB['fungus'] + "\n\n*Ask about 'blight', 'rust', 'wilt', 'powdery mildew', 'leaf curl' for specific treatment.*";
    }

    // --- Government / Scheme / Subsidy / Loan ---
    if (/\b(government|govt|scheme|yojana|sarkari|pm.kisan|pmfby|kcc|subsidy|grant|loan|credit|insurance|anudan)\b/i.test(q)) {
      if (q.includes('pm-kisan') || q.includes('pm kisan') || q.includes('pmkisan')) return farmingKB['pm-kisan'];
      if (q.includes('pmfby') || q.includes('crop insurance')) return farmingKB['pmfby'];
      if (q.includes('kcc') || q.includes('kisan credit')) return farmingKB['kcc'];
      if (/\b(subsidy|grant)\b/i.test(q)) return farmingKB['subsidy'];
      if (/\b(loan|credit)\b/i.test(q)) return farmingKB['loan'];
      if (/\b(msp|minimum support)\b/i.test(q)) return farmingKB['msp'];
      return farmingKB['scheme'];
    }

    // --- Soil / Organic / Irrigation ---
    if (/\b(soil|land\s*type|mitti|मिट्टी)\b/i.test(q)) return farmingKB['soil'];
    if (/\b(organic|jaivik|जैविक)\b/i.test(q)) return farmingKB['organic farming'];
    if (/\b(irrigation|drip|sprinkler|sinchai|सिंचाई|paani|pani)\b/i.test(q)) return farmingKB['irrigation'];
    if (/\b(vermicompost|kechua khad|केंचुआ)\b/i.test(q)) return farmingKB['vermicompost'];
    if (/\b(urea)\b/i.test(q)) return farmingKB['urea'];
    if (/\b(dap)\b/i.test(q)) return farmingKB['dap'];
    if (/\b(npk)\b/i.test(q)) return farmingKB['npk'];
    if (/\b(fertilizer|fertiliser|khad|nutrient|खाद)\b/i.test(q)) return farmingKB['fertilizer'];

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
  // 6. FARMING-ONLY TOPIC GUARD
  // ============================================================
  function isFarmingRelated(query) {
    var q = query.toLowerCase();
    // Comprehensive farming/agriculture keyword list (English + Hindi)
    return /\b(crop|fasal|khet|kheti|farm|agri|seeds|beej|plant|sow|grow|cultivat|harvest|yield|produce|grain|cereal|pulse|vegetable|sabzi|fruit|phal|flower|phool|weed|kharpatwar|nursery|compost|mulch|manure|organic|jaivik|soil|mitti|land|zameen|field|irrigation|sinchai|drip|sprinkler|canal|borewell|tubewell|pani|paani|water|rain|barish|baarish|monsoon|drought|sukha|flood|baadh|pest|keet|keede|insect|bug|disease|rog|bimari|blight|rust|wilt|mildew|fungus|virus|bacteria|spray|pesticide|herbicide|fungicide|neem|bio.control|fertilizer|fertiliser|khad|urea|dap|npk|potash|nitrogen|phosphorus|nutrient|weather|mausam|temperature|humidity|wind|heatwave|frost|cold|garmi|sardi|forecast|climate|season|rabi|kharif|zaid|price|rate|cost|bhav|daam|kimat|mandi|market|msp|apmc|enam|quintal|commodity|wheat|gehu|rice|dhan|chawal|cotton|kapas|maize|makka|bajra|jowar|sugarcane|ganna|soyabean|soya|mustard|sarson|chana|gram|arhar|tur|moong|urad|dal|onion|pyaz|tomato|tamatar|potato|aloo|chilli|mirch|garlic|lahsun|ginger|adrak|turmeric|haldi|cumin|jeera|groundnut|moongfali|brinjal|baingan|okra|bhindi|cauliflower|gobhi|gobi|peas|matar|banana|kela|mango|aam|guava|amrood|papaya|coconut|nariyal|tea|chai|coffee|rubber|jute|tobacco|cashew|cardamom|pepper|scheme|yojana|sarkari|government|govt|pm.kisan|pmfby|kcc|subsidy|anudan|loan|credit|insurance|msp|minimum.support|procurement|warehouse|cold.storage|food.processing|dairy|cattle|livestock|poultry|fish|aqua|goat|bakri|cow|gaay|buffalo|bhains|tractor|plough|harvester|thresher|sprayer|machinery|equipment|tool|vermicompost|kechua|biogas|solar|dryer|greenhouse|polyhouse|horticulture|floriculture|sericulture|apiculture|mushroom|animal.husbandry|veterinary|fodder|silage|hay)\b/i.test(q);
  }

  // ============================================================
  // 7. MAIN HANDLER
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

      // Step 1b: Live Price Intent — fetch from data.gov.in API
      if (response === '__LIVE_PRICE_INTENT__') {
        response = null;
        var cropName = extractCropFromPriceQuery(text);
        if (cropName) {
          addMessage('📊 Fetching live mandi prices for **' + cropName + '**...', 'bot');
          var liveRecords = await fetchLiveMandiPrice(cropName);
          if (liveRecords && liveRecords.length > 0) {
            response = formatMandiResponse(liveRecords, cropName);
          } else {
            // Fallback to local price DB
            var crops = Object.keys(priceDatabase).sort(function (a, b) { return b.length - a.length; });
            for (var ci = 0; ci < crops.length; ci++) {
              if (text.toLowerCase().includes(crops[ci])) {
                var lbl = crops[ci].split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
                response = "**💰 Market Rate: " + lbl + "** (Reference Prices)\n" + priceDatabase[crops[ci]] +
                  "\n\n*(Live API prices unavailable right now. Above are approximate reference prices.)*" +
                  "\n\n**📊 Advice:**\n• Check your nearest APMC mandi for today's rate.\n• Use **eNAM portal** to compare rates across mandis.\n• 👉 **[View Market Page](market.html?q=" + encodeURIComponent(crops[ci]) + ")**";
                break;
              }
            }
            if (!response) {
              response = "I couldn't find live prices for '" + cropName + "'. Try a different spelling (e.g. 'Wheat', 'Tomato', 'Rice').\n\nI have prices for **50+ crops** — ask: **'Price of [Crop Name]'**";
            }
          }
        } else {
          response = "I have **live prices** for 300+ crops from Indian mandis!\nAsk: **'Price of [Crop Name]'** (e.g. Price of Wheat, Rate of Tomato)\n\n👉 Or visit the **[Market Prices page](market.html)**";
        }
      }

      // Step 2: Weather intent
      if (!response && /\b(weather|temperature|forecast|climate|mausam|rain|barish|humidity|wind|garmi|sardi|baarish)\b/i.test(lowerText)) {
        addMessage('🌍 Checking weather for your location...', 'bot'); // Feedback
        response = await callWeatherAPI();
      }

      // Step 3: Wikipedia — ONLY for farming-related queries
      if (!response && isFarmingRelated(text)) {
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

      // Step 5: Fallback — farming-only guard
      if (!response) {
        if (isFarmingRelated(text)) {
          response = "I don't have specific info on that yet, but here's what I can help with:\n\n" +
            "• 🌾 **Crop guidance** — 'How to grow rice?'\n" +
            "• 💰 **Mandi prices** — 'Price of wheat' / 'Gehu ka bhav'\n" +
            "• 🐛 **Pest solutions** — 'How to control whitefly?'\n" +
            "• 🌤️ **Weather** — 'What is the weather today?'\n" +
            "• 🏛️ **Schemes** — 'PM-KISAN details'\n\n" +
            "Try rephrasing your question with a crop or topic name!";
        } else {
          response = "🚜 I'm **Agri1 AI Assistant** — I only help with **farming and agriculture** topics.\n\n" +
            "I can answer questions about:\n" +
            "• 🌾 Crops, seeds, cultivation\n" +
            "• 💰 Mandi prices & market rates\n" +
            "• 🐛 Pests, diseases & treatment\n" +
            "• 🌤️ Weather & farming advice\n" +
            "• 🏛️ Government schemes & subsidies\n" +
            "• 💧 Irrigation, soil, fertilizers\n\n" +
            "Please ask a farming-related question! 🌱";
        }
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