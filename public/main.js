$(function () {
    const socket = io();
    let username = null;
    const messages = []; // Store messages with timestamps

    // Function to prompt for username
    function promptForUsername() {
        username = prompt('Enter your username:');
        if (username.trim() === '') {
            promptForUsername();
        } else {
            socket.emit('join', username);
            $('#join-container').hide();
            $('#chat-container').removeClass('hidden');
        }
    }

    // Trigger the username prompt when the page loads
    promptForUsername();

    // Send message when the send button is clicked
    $('#send-button').click(function () {
        const message = $('#message-input').val();

        if (message.trim() !== '') {

            // Replace words with emojis
            const emojiMessage = replaceWordWithEmoji(message)

            const timestamp = new Date().toLocaleTimeString(); // Get the current time
            socket.emit('chatMessage', emojiMessage, username, timestamp);
            $('#message-input').val('');
        }
    });

    socket.on('chatMessage', (message) => {
        // Add the message to the array
        messages.push(message);
        // Render messages based on timestamps
        renderMessages();
    });

    // Function to render messages based on timestamps
    function renderMessages() {
        $('#messages').empty(); // Clear the message container
        // Append messages to the message container
        messages.forEach((message) => {
            // Create a chat bubble with appropriate class based on sender or receiver
            const bubbleClass = message.user === username ? 'sender-bubble' : 'receiver-bubble';
            const bubble = $('<div>').addClass('message-bubble').addClass(bubbleClass).text(`${message.user}: ${message.text}`);
            $('#messages').prepend(bubble);
        });
        // Scroll to the bottom of the chat container
        $('#messages').scrollTop($('#messages')[0].scrollHeight);
    }

    // Update the user list when received from the server
    socket.on('updateUserList', (users) => {
        $('#users').empty();
        users.forEach((user) => {
            $('#users').append($('<li>').text(user));
        });
    });
});

const replaceWordWithEmoji = (message) => {
    // Define a dictionary of word-to-emoji mappings
    let wordToEmoji = {
        "react": "⚛︎",
        "woah": "😲",
        "hey": "👋",
        "lol": "😂",
        "like": "❤",
        "congratulations": "🎉",
    };

    // Split the input string into words
    let words = message.split(" ");

    // Initialize an empty array to store the processed words
    let processedWords = [];

    // Iterate through the words in the input string
    for (let word of words) {
        // Check if the word is in the word-to-emoji dictionary, and replace it with the emoji if found
        if (word.toLowerCase() in wordToEmoji) {
            let emoji = wordToEmoji[word.toLowerCase()];
            processedWords.push(emoji);
        } else {
            processedWords.push(word);
        }
    }

    // Join the processed words back into a string
    let updatedMessage = processedWords.join(" ");

    return updatedMessage
}
