document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');

  // Enhanced Knowledge Base
  const knowledgeBase = {
    // Crops
    'rice': "Rice (Paddy) needs standing water. Best time to sow is June-July (Kharif). Use NPK 100:60:40 per hectare. Common pests: Stem Borer, Leaf Folder.",
    'paddy': "Rice (Paddy) needs standing water. Best time to sow is June-July (Kharif). Use NPK 100:60:40 per hectare. Common pests: Stem Borer, Leaf Folder.",
    'wheat': "Wheat is a Rabi crop. Sow in Nov-Dec. Requires cool chemicals. Irrigate at crown root initiation (21 days after sowing).",
    'maize': "Maize (Corn) requires well-drained loamy soil. Sensitive to water logging. Apply Zinc Sulfate for better yield.",
    'sugarcane': "Sugarcane is a long-duration crop (10-12 months). Heavy feeder of nutrients. Watch out for Red Rot and Shoot Borer.",
    'potato': "Potato needs loose soil for tuber formation. Earthing up is crucial. Late Blight is a common disease in winter.",
    'tomato': "For tomato crops, ensure consistent watering to prevent blossom end rot. Support plants with stakes. Watch out for early blight.",
    'cotton': "Cotton requires well-drained soil. Watch for pink bollworm. Recommended implementation of IPM strategies.",
    'chilli': "Chilli leaf curl virus is common; control whitefly vector. Use sticky traps.",

    // Pests
    'aphids': "To control aphids, you can spray a solution of Neem oil (5ml per liter of water). Ladybugs are also natural predators.",
    'armyworm': "Fall Armyworm attacks Maize. Look for sawdust-like frass. Spray Emamectin Benzoate if infestation is severe.",
    'whitefly': "Whiteflies transmit viruses. Use yellow sticky traps. Spray Imidacloprid if needed.",
    'stem borer': "Stem Borer causes 'dead heart' in rice. Apply Cartap Hydrochloride granules.",
    'rust': "Wheat Rust appears as orange/yellow powder on leaves. Use Propiconazole fungicide.",
    'blight': "Blight causes dark spots on leaves. Early blight in tomato/potato can be managed with Mancozeb.",
    'thrips': "Thrips cause curling of leaves and silvers streaks. Control with Blue Sticky Traps or spray Fipronil.",
    'mealybug': "Mealybugs appear as white cottony masses. Use cryptic beetles (natural enemy) or spray Profenofos.",
    'bollworm': "Pink Bollworm affects cotton. Use Pheromone traps for monitoring. Spray Emamectin Benzoate.",
    'cutworm': "Cutworms cut seedlings at ground level at night. Flood the field or use Chlorpyriphos.",
    'leaf miner': "Leaf Miners create zigzag white lines on leaves. Remove affected leaves. Spray Neem Oil.",
    'grasshopper': "Grasshoppers eat foliage. Plow soil to destroy eggs. Spray Malathion if swarm is large.",
    'mites': "Red Spider Mites cause yellowing/stippling. Use Sulphur based acaricides or Dicofol.",
    'termite': "Termites damage roots and stems. Treat seed with Chlorpyriphos. Apply neem cake in soil.",

    // General
    'price': "Market prices vary by mandi. Currently, tomatoes are trending around ₹1,200/Qtl, Onions ₹2,500/Qtl, and Wheat ₹2,100/Qtl in major hubs.",
    'weather': "The weather forecast predicts sunny skies for the next 3 days followed by light rain. Ideal for harvesting dry crops now.",
    'fertilizer': "For general growth, NPK 19-19-19 is a good starter. For fruiting stage, increase Potassium (K) levels. Always do a soil test first.",
    'organic': "Organic farming tips: Use Vermicompost, rotate crops, use Panchagavya, and apply Neem oil for pest control.",
    'soil': "Healthy soil is key. Add organic matter (FYM). Test soil pH (ideal is 6.5-7.5). Practice crop rotation.",

    // Greetings/Default
    'hello': "Namaste! I am your Agri1 Assistant. Ask me about Rice, Wheat, Cotton, Pests, Prices, or Weather.",
    'hi': "Hello! How can I help you with your farming today?",
    'thanks': "You're welcome! Happy farming!",
    'default': "I'm specific to farming queries. Try asking about: 'Rice cultivation', 'Tomato pests', 'Wheat fertilizer', 'Market prices', or 'Weather'."
  };

  function getBotResponse(query) {
    query = query.toLowerCase();

    // Check for specific keywords in the query
    // We prioritize specific pests/crops match first

    // 1. Direct Keyword Match
    for (const key in knowledgeBase) {
      if (query.includes(key) && key !== 'default' && key !== 'hello' && key !== 'hi') {
        return knowledgeBase[key];
      }
    }

    // 2. Greetings
    if (query.includes('hello') || query.includes('namaste')) return knowledgeBase['hello'];
    if (query.includes('hi')) return knowledgeBase['hi'];
    if (query.includes('thank')) return knowledgeBase['thanks'];

    // 3. Category Fallbacks (Broader matching)
    if (query.includes('insect') || query.includes('bug') || query.includes('pest')) return "Please specify the pest name (e.g., Aphids, Armyworm) or the crop affecting it.";
    if (query.includes('rate') || query.includes('cost')) return knowledgeBase['price'];
    if (query.includes('rain') || query.includes('temperature') || query.includes('climate')) return knowledgeBase['weather'];
    if (query.includes('nutrient') || query.includes('growth')) return knowledgeBase['fertilizer'];

    return knowledgeBase['default'];
  }

  function handleSend() {
    const text = userInput.value.trim();
    if (text === "") return;

    addMessage(text, 'user');
    userInput.value = "";

    // Simulate thinking delay
    setTimeout(() => {
      const response = getBotResponse(text);
      addMessage(response, 'bot');
    }, 800);
  }

  sendBtn.addEventListener('click', handleSend);
  userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });

  // Handle Suggestion Chips
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      userInput.value = chip.innerText;
      handleSend();
    });
  });

  // Check URL params for auto-query (from Pest page)
  const urlParams = new URLSearchParams(window.location.search);
  const autoQuery = urlParams.get('q');
  if (autoQuery) {
    setTimeout(() => {
      userInput.value = "How to treat " + autoQuery + "?";
      handleSend();
    }, 500);
  }

});
