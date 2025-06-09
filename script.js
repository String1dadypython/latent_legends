// Get elements
const chatHistory = document.getElementById('chat-history');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const voiceBtn = document.getElementById('voice-btn');
const clearBtn = document.getElementById('clear-btn');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const closeBtn = document.getElementById('close-btn');
const customizeBtn = document.getElementById('customize-btn');
const customizePanel = document.getElementById('customize-panel');
const colorPickerInput = document.getElementById('color-picker-input');
const fontPicker = document.getElementById('font-picker');

let awaitingOrderNumber = false;
let awaitingDelayResponse = false;
let lastOrderNumber = null;

// Scroll chat to bottom
function scrollToBottom() {
  chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Append message (supports HTML)
function appendMessage(text, sender = 'bot', isHTML = false) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  if (isHTML) {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }
  chatHistory.appendChild(msg);
  scrollToBottom();
}

// Chatbot response logic
function getBotResponse(input) {
  input = input.toLowerCase();

  if (awaitingOrderNumber) {
    awaitingOrderNumber = false;
    lastOrderNumber = input.match(/\d+/)?.[0] || '102';
    return `📦 Order #${lastOrderNumber} is currently in transit and expected to arrive in 3 days.`;
  }

  if (awaitingDelayResponse) {
    awaitingDelayResponse = false;
    if (input.includes('cancel')) {
      return "❌ Your order has been canceled. If you need anything else, just ask!";
    } else if (
      input.includes('wait') ||
      input.includes('ok') ||
      input.includes('okay') ||
      input.includes('yes')
    ) {
      return "⏳ Thank you for waiting! We'll keep you updated on your order status.";
    } else {
      awaitingDelayResponse = true; // still awaiting valid input
      return "Please reply with 'cancel' or 'wait'.";
    }
  }

  if (input.includes('offer') || input.includes('discount') || input.includes('sale')) {
    return `🎉 Yes! We have 20% off on electronics and 15% off on fashion. <a href="offers.html" target="_blank" style="color: var(--primary-color); text-decoration: underline;">Click here</a> to view all offers.`;
  }

  if (
    input.includes('where is my order') ||
    input.includes('track order') ||
    input.includes('order status') ||
    input.includes('order details')
  ) {
    awaitingOrderNumber = true;
    return "Please provide your order number (e.g., #102) so I can check the status.";
  }

  if (input.includes('late delivery') || input.includes('delay')) {
    awaitingDelayResponse = true;
    return "⚠️ Your product delivery is delayed by 3 days. Would you like to cancel the order or wait?";
  }

  if (input.includes('hi') || input.includes('hello') || input.includes('hey')) {
    return "Hello! How can I assist you today?";
  }

  if (
    input.includes('thank') ||
    input.includes('thanks') ||
    input.includes('okk') ||
    input.includes('got it') ||
    input.includes('got')
  ) {
    return "You're welcome! If you have any other questions, feel free to ask.";
  }

  if (input.includes('bye') || input.includes('goodbye')) {
    return "Goodbye! Have a great day!";
  }

  return "I'm sorry, I didn't quite understand that. Can you please rephrase?";
}

// Send message function
function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  userInput.value = '';

  setTimeout(() => {
    const botReply = getBotResponse(text);
    const isHTML = botReply.includes('<a ');
    appendMessage(botReply, 'bot', isHTML);
  }, 600);
}

// Voice recognition setup
let recognition;
if ('webkitSpeechRecognition' in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    userInput.value = speechResult;
    sendMessage();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error', event.error);
  };
} else {
  voiceBtn.style.display = 'none';
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

voiceBtn.addEventListener('click', () => {
  if (recognition) recognition.start();
  else alert('Voice recognition not supported in your browser.');
});

clearBtn.addEventListener('click', () => {
  if (confirm('Clear chat history?')) chatHistory.innerHTML = '';
});

darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
});

closeBtn.addEventListener('click', () => {
  alert('Chat closed. You can reopen by refreshing the page.');
  document.getElementById('chat-container').style.display = 'none';
});

// Customize panel toggle
customizeBtn.addEventListener('click', () => {
  customizePanel.style.display = customizePanel.style.display === 'block' ? 'none' : 'block';
});

// Handle color picker change
colorPickerInput.addEventListener('input', (e) => {
  const colorValue = e.target.value;
  document.documentElement.style.setProperty('--primary-color', colorValue);
  localStorage.setItem('primaryColor', colorValue);
});

// Handle font picker change
fontPicker.addEventListener('change', (e) => {
  const fontValue = e.target.value;
  document.documentElement.style.setProperty('--font-family', fontValue);
  localStorage.setItem('fontFamily', fontValue);
});

// Restore settings on load
window.addEventListener('load', () => {
  // Dark mode
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }

  // Primary color
  const savedColor = localStorage.getItem('primaryColor');
  if (savedColor) {
    document.documentElement.style.setProperty('--primary-color', savedColor);
    colorPickerInput.value = savedColor;
  }

  // Font family
  const savedFont = localStorage.getItem('fontFamily');
  if (savedFont) {
    document.documentElement.style.setProperty('--font-family', savedFont);
    fontPicker.value = savedFont;
  }

  appendMessage("Hello! I am your AI customer care assistant. How can I help you today?");
});
