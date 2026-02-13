document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    function addMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        msgDiv.innerHTML = `<p>${text}</p>`;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getBotResponse(input) {
        const lowerInput = input.toLowerCase();

        if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
            return "Hello! How can I assist you with your farming needs today?";
        }
        if (lowerInput.includes('summer')) {
            return "In summer (Zaid season), crops like Watermelon, Musk Melon, Cucumber, and Bitter Gourd thrive well due to the warm weather.";
        }
        if (lowerInput.includes('winter') || lowerInput.includes('rabi')) {
            return "For winter (Rabi season), Wheat, Mustard, Barley, and Peas are excellent choices.";
        }
        if (lowerInput.includes('rain') || lowerInput.includes('monsoon') || lowerInput.includes('kharif')) {
            return "During the monsoon (Kharif season), Rice (Paddy), Maize, Cotton, and Soybean are the best crops to grow.";
        }
        if (lowerInput.includes('pest') || lowerInput.includes('insect')) {
            return "To control pests, you can use Neem oil spray as a natural organic pesticide. For specific pests, please tell me the crop name.";
        }
        if (lowerInput.includes('irrigation') || lowerInput.includes('water')) {
            return "Drip irrigation is the most water-efficient method. It saves water and delivers nutrients directly to plant roots.";
        }
        if (lowerInput.includes('price') || lowerInput.includes('market')) {
            return "You can check the latest market rates on our 'Market Prices' page. Would you like me to take you there?";
        }
        if (lowerInput.includes('thank')) {
            return "You're welcome! Happy Farming!";
        }
        return "I'm not sure about that. Try asking about 'seasonal crops', 'pest control', or 'irrigation tips'.";
    }

    function handleSend() {
        const text = userInput.value.trim();
        if (text === "") return;

        addMessage(text, true);
        userInput.value = '';

        // Simulate typing delay
        setTimeout(() => {
            const botReply = getBotResponse(text);
            addMessage(botReply, false);
        }, 600);
    }

    sendBtn.addEventListener('click', handleSend);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.textContent;
            handleSend();
        });
    });
});
