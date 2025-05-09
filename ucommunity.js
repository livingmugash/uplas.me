// Place this within <script> tags in your community.html

document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme-toggle'); // If you have a theme toggle button
    const goBackLink = document.getElementById('go-back');
    const goBackAlternativeLink = document.getElementById('go-back-alternative');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.querySelector('.send-button'); // Use querySelector if no ID
    const messagesArea = document.getElementById('messages-area');

    // Function to toggle the theme
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        // You might also want to save the user's preference in local storage here
    }

    // Event listener for the theme toggle button (if you have one)
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Check for user's saved preference on load (optional)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // Go back to the previous page functionality for "Click here"
    if (goBackLink) {
        goBackLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent any default link behavior
            window.history.back();
        });
    }
    
    if (goBackAlternativeLink) {
        goBackAlternativeLink.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent any default link behavior
            window.history.back();
        });
    }
});

// Basic JavaScript for testing - You'll need to expand on this for real functionality
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.querySelector('.send-button');
    const messageInput = document.getElementById('message-input');
    const messagesArea = document.getElementById('messages-area');

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
    
    // --- WebSocket Connection ---
    // Determine room name dynamically (e.g., from URL path or a data attribute)
    const roomName = "general"; // Replace with dynamic room name logic if needed
    // Construct WebSocket URL - use wss:// for secure connections in production
    const chatSocketUrl = `ws://${window.location.host}/ws/chat/${roomName}/`; 
    
    let chatSocket = null;

    function connectWebSocket() {
        console.log(`Attempting to connect to ${chatSocketUrl}`);
        chatSocket = new WebSocket(chatSocketUrl);

        chatSocket.onopen = function(e) {
            console.log('WebSocket connection opened.');
            // Maybe request history here or upon receiving a specific message
        };

        chatSocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log('Message received:', data);
            
            // --- Display Received Message ---
            const messageContent = data.message;
            const username = data.username; // Get username from received data
            
            // Check if message and username exist
            if (messageContent && username) {
                 // Determine if it's a message sent by the current user (compare username if needed)
                 // For simplicity, we assume all received messages are from others here
                 const messageDiv = document.createElement('div');
                 messageDiv.classList.add('message', 'received'); // Always show as received for now
                 
                 // Simple display (adapt to match your received message HTML structure)
                 messageDiv.innerHTML = `
                     <div class="profile-avatar">${username.charAt(0).toUpperCase()}</div> 
                     <div class="message-content-container">
                         <span class="user-name">${username}</span>
                         <div class="message-content">${messageContent}</div>
                     </div>
                 `;
                 messagesArea.appendChild(messageDiv);
                 messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom
            } else {
                 console.log("Received data doesn't contain message or username:", data);
            }
        };

        chatSocket.onerror = function(e) {
            console.error('WebSocket error:', e);
        };

        chatSocket.onclose = function(e) {
            console.error('Chat socket closed unexpectedly. Code:', e.code, 'Reason:', e.reason);
            // Optional: Attempt to reconnect after a delay
            // setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
        };
    }

    // --- Sending Messages ---
    function sendMessage() {
        if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
            console.error("WebSocket is not connected.");
            // Optionally, try to reconnect or inform the user
            return;
        }

        const messageContent = messageInput.value.trim();
        if (messageContent !== "") {
            console.log('Sending message:', messageContent);
            chatSocket.send(JSON.stringify({
                'message': messageContent
            }));
            
            // --- Display Sent Message Immediately (Optimistic Update) ---
            // This assumes the message will send successfully. More robust UI would handle errors.
            const sentMessageDiv = document.createElement('div');
            sentMessageDiv.classList.add('message', 'sent');
            // Adapt HTML structure to match your sent message layout
            sentMessageDiv.innerHTML = `
                <div class="message-content-container">
                     <div class="message-content">${messageContent}</div>
                 </div>
                 <div class="profile-avatar">Y</div> 
            `; // 'Y' for 'You' - replace with dynamic user initial
            messagesArea.appendChild(sentMessageDiv);
            messageInput.value = ""; // Clear input
            messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom
        }
    }

    // Event listeners for sending
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, allow Shift+Enter for newline
            event.preventDefault(); // Prevent default newline behavior
            sendMessage();
        }
    });

    // --- Initial Connection ---
    connectWebSocket(); // Connect when the page loads



    // Example inside uprojects.js or another script

async function getUserData() {
    try {
        // Use the utility function for authenticated endpoints
        const userData = await fetchAuthenticated('/api/users/profile/'); 
        console.log("User profile data:", userData);
        // Update UI with user data
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Handle error (e.g., show message, redirect to login if needed)
    }
}

// Call it when needed
// getUserData();


// Conceptual updates for ucommunity.js onmessage handler

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('Data received:', data);
    
    const messageType = data.type; // Get the message type

    if (messageType === 'history') {
        // Handle message history
        console.log('Processing history...');
        messagesArea.innerHTML = ''; // Clear existing messages before loading history
        data.messages.forEach(msg => {
            displayMessage(msg.username, msg.message, msg.timestamp, false); // isSent=false
        });
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom after loading history

    } else if (messageType === 'message') {
        // Handle a regular incoming chat message
        console.log('Processing incoming message...');
        // Determine if it's from the current user based on username if needed
        const isSentByCurrentUser = (data.username ===/* your logic to get current username */'You'); // Example check
        displayMessage(data.username, data.message, data.timestamp, isSentByCurrentUser);
        messagesArea.scrollTop = messagesArea.scrollHeight; // Scroll to bottom

    } else if (messageType === 'error') {
         // Handle error messages from the server
         console.error('Server error message:', data.message);
         alert(`Error: ${data.message}`); // Simple alert, improve UI later
    } else {
         console.warn('Unknown message type received:', messageType);
    }
};

// --- Create a reusable function to display messages ---
function displayMessage(username, messageContent, timestamp, isSent) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isSent ? 'sent' : 'received');
    
    // Format timestamp (requires a library like date-fns or Intl.DateTimeFormat)
    const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

    const userInitial = username ? username.charAt(0).toUpperCase() : '?';
    // Adapt HTML structure EXACTLY to your ucommunity.html
    messageDiv.innerHTML = `
        ${!isSent ? `<div class="profile-avatar">${userInitial}</div>` : ''}
        <div class="message-content-container">
            ${!isSent ? `<span class="user-name">${username}</span>` : ''}
            <div class="message-content">${messageContent}</div>
            <span class="message-timestamp" style="font-size: 0.7em; color: grey; margin-left: 5px; margin-right: 5px;">${formattedTime}</span> 
        </div>
        ${isSent ? `<div class="profile-avatar">Y</div>` : ''} 
    `; // 'Y' for 'You' needs better logic
    messagesArea.appendChild(messageDiv);
    
}


// Conceptual updates for ucommunity.js onmessage handler

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('Data received:', data);
    
    const messageType = data.type; 

    if (messageType === 'history') {
        // ... (handle history as before) ...
    } else if (messageType === 'message') {
        // ... (handle incoming message as before) ...
    } else if (messageType === 'user_list') {
        // --- Handle updated online user list ---
        console.log('Updating online users:', data.online_users);
        updateOnlineUsersUI(data.online_users); // Call a function to update the UI
        // --- End presence handling ---
    } else if (messageType === 'error') {
         // ... (handle error as before) ...
    } else {
         console.warn('Unknown message type received:', messageType);
    }
};

// --- Add a function to update the online users UI ---
function updateOnlineUsersUI(onlineUsernames) {
    const onlineListElement = document.getElementById('online-users-list'); // Assume you have an element with this ID
    if (onlineListElement) {
        onlineListElement.innerHTML = ''; // Clear current list
        onlineUsernames.forEach(username => {
            const userElement = document.createElement('li');
            // Add classes or styles as needed
            userElement.textContent = username; 
            onlineListElement.appendChild(userElement);
        });
    } else {
         console.warn("Element with ID 'online-users-list' not found for presence update.");
    }
}

// --- You also need an element in your ucommunity.html to display the list ---
/* Example HTML somewhere in chat-container:
<div class="online-users-panel"> 
    <h4>Online Now</h4>
    <ul id="online-users-list">
        </ul>
</div> 
*/

// ... (rest of your ucommunity.js code: displayMessage, connectWebSocket, etc.) ...
