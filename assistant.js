document.addEventListener('DOMContentLoaded', () => {
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');
  const chatMessages = document.getElementById('chat-messages');

  // Pre-programmed responses for "Strong Chatbox"
  const knowledgeBase = {
    'aphids': "To control aphids, you can spray a solution of Neem oil (5ml per liter of water). Ladybugs are also natural predators.",
    'tomato': "For tomato crops, ensure consistent watering to prevent blossom end rot. Support plants with stakes. Watch out for early blight.",
    'price': "Market prices vary by mandi. Currently, tomatoes are trending around ₹1,200/Qtl and Onions around ₹2,500/Qtl in major hubs.",
    'weather': "The weather forecast predicts sunny skies for the next 3 days followed by light rain. Ideal for harvesting dry crops now.",
    'fertilizer': "For general growth, NPK 19-19-19 is a good starter. For fruiting stage, increase Potassium (K) levels.",
    'cotton': "Cotton requires well-drained soil. Watch for pink bollworm. Recommended implementation of IPM strategies.",
    'hello': "Namaste! I am your Agri1 Assistant. Ask me about crops, pests, weather, or market prices.",
    'hi': "Hello! How can I help you with your farming today?",
    'default': "I can help with that. Could you provide more specific details? I can answer questions about specific crops, pests, or prices."
  };

  function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerText = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto scroll
  }

  function getBotResponse(query) {
    query = query.toLowerCase();
    
    // Simple keyword matching
    if (query.includes('aphid') || query.includes('insect')) return knowledgeBase['aphids'];
    if (query.includes('tomato')) return knowledgeBase['tomato'];
    if (query.includes('price') || query.includes('rate') || query.includes('cost')) return knowledgeBase['price'];
    if (query.includes('weather') || query.includes('rain') || query.includes('temperature')) return knowledgeBase['weather'];
    if (query.includes('fertilizer') || query.includes('nutrient')) return knowledgeBase['fertilizer'];
    if (query.includes('cotton')) return knowledgeBase['cotton'];
    if (query.includes('hello') || query.includes('namaste')) return knowledgeBase['hello'];
    if (query.includes('hi')) return knowledgeBase['hi'];
    
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
