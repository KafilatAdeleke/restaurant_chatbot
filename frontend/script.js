document.addEventListener('DOMContentLoaded', function () {
   const chatMessages = document.getElementById('chat-messages');
   const userInput = document.getElementById('user-input');
   const sendBtn = document.getElementById('send-btn');
   const welcomeSection = document.getElementById('welcome-section');

   // Generate a unique session ID for the device
   let sessionId = localStorage.getItem('chatbot_session_id');
   if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('chatbot_session_id', sessionId);
   }

   // Show initial welcome message in chat area
   setTimeout(() => {
      addBotMessage(`🍽️ Welcome to our Restaurant ChatBot!

I'm here to help you place orders, check your current order, view order history, and more.

📋 MAIN MENU OPTIONS:

1️⃣  Place an order
9️⃣9️⃣ Checkout order  
9️⃣7️⃣ See current order
9️⃣8️⃣ See order history
0️⃣  Cancel order

💳 PAYMENT PROCESS:
After checkout (99), type '100' to start payment, then '101' to complete it.

� eTo get started, simply type the number of your choice!
Example: Type '1' to see our delicious menu.`);
   }, 500);

   // Send button click handler
   sendBtn.addEventListener('click', sendMessage);

   // Enter key press handler
   userInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
         sendMessage();
      }
   });

   function sendMessage() {
      const message = userInput.value.trim();
      if (message) {
         // Hide welcome section on first user message
         if (welcomeSection) {
            welcomeSection.style.display = 'none';
         }

         addUserMessage(message);
         userInput.value = '';

         // Process the message and get response from backend
         processMessage(message);
      }
   }

   function addUserMessage(message) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'user-message');
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;
   }

   function addBotMessage(message) {
      const messageElement = document.createElement('div');
      messageElement.classList.add('message', 'bot-message');
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      // Hide the welcome section when the first bot message appears
      const welcomeSection = document.getElementById('welcome-section');
      if (welcomeSection && welcomeSection.style.display !== 'none') {
         welcomeSection.style.display = 'none';
      }
   }

   function processMessage(message) {
      // Send message to backend
      fetch('/api/chat', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            message: message,
            sessionId: sessionId
         })
      })
         .then(response => response.json())
         .then(data => {
            addBotMessage(data.response);
         })
         .catch(error => {
            console.error('Error:', error);
            addBotMessage("Sorry, there was an error processing your request.");
         });
   }

   function generateSessionId() {
      return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
   }
});