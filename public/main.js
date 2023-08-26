$(function () {
    const socket = io();
    let username = null;
    const messages = [];
    let userValues = {};


    // Function to prompt for username
    function promptForUsername() {
        username = prompt('Enter your username:');
        if (username.trim() === '') {
            promptForUsername();
        } else {
            socket.emit('join', username);
            $('#join-container').hide();
            $('#chat-container').removeClass('hidden');
            $('#message-input').focus()
        }
    }

    // Trigger the username prompt when the page loads
    promptForUsername();

    // Function to send a message
    function sendMessage() {
        const message = $('#message-input').val();
        if (message.trim() !== '') {
            // Check if the message is a slash command
            if (message.startsWith('/')) {
                const parts = message.split(' ');
                const command = parts[0].toLowerCase(); // Get the lowercase command name

                switch (command) {
                    case '/help':
                        // Display a help message in an alert dialog
                        const helpMessage = 'Available commands:\n' +
                            '1.) /help - Display this help message\n' +
                            '2.) /random - Get a random number\n' +
                            '3.) /calc - `/calc 3+5` will post the result of the calculator.\n' +
                            '4.) /rem - `/rem <name> <value>` Set a value and by the given name.   e.g. `/rem answer 42` or `/rem city Atlantis`. This value can then be recalled by `/rem <name>` e.g. `/rem answer` will post `42` and `/rem city` will post `Atlantis\n' +
                            '5.) /clear - Clear the chat history';
                        alert(helpMessage);
                        break;

                    case '/rem':
                        // Check if the command has two additional arguments
                        if (parts.length === 3) {
                            const name = parts[1];
                            const value = parts[2];

                            // Store the value in a dictionary
                            userValues[name] = value;

                            // Send a confirmation message
                            messages.push(`Value "${value}" has been set for "${name}".`)
                        } else if (parts.length === 2) {
                            // Recall a value by name
                            const name = parts[1];
                            const value = userValues[name];

                            if (value !== undefined) {
                                // Send the recalled value
                                messages.push(`Value for "${name}" is "${value}".`)
                            } else {
                                // Value not found
                                messages.push(`Value for "${name}" not found.`)

                            }
                        } else {
                            // Invalid command usage
                            messages.push('Invalid /rem command. Usage: /rem <name> <value> or /rem <name>')
                        }

                        renderMessages(); // Re-render the chat
                        break;

                    case '/calc':
                        if (parts.length === 2) {
                            try {
                                // Evaluate the expression using JavaScript's eval function
                                const result = eval(parts[1])
                                messages.push(`Result: ${result}`)

                            } catch (error) {
                                // Handle calculation error
                                messages.push("Invalid expression")
                            }
                        } else {
                            messages.push('Invalid /calc command. Usage: /calc <expression>')

                        }
                        renderMessages(); // Re-render the chat
                        break;
                    case '/random':
                        const randomNum = Math.random()
                        messages.push(`Here is your random number: ${randomNum}`)
                        renderMessages(); // Re-render the chat
                        break;

                    case '/clear':
                        // Clear the chat history
                        messages.length = 0;
                        renderMessages(); // Re-render the chat
                        break;

                    // Add more commands as needed

                    default:
                        // Handle unknown command
                        socket.emit('chatMessage', 'Unknown command. Type /help for a list of commands.', 'ChatterBox');
                        break;
                }

                $('#message-input').val('');

                // Prevent the command from being displayed as a regular message
                return;
            }

            const emojiMessage = replaceWordWithEmoji(message)

            socket.emit('chatMessage', emojiMessage, username);
            $('#message-input').val('');
        }
    }

    // Send message when the send button is clicked
    $('#send-button').click(sendMessage);

    // Send message when Enter key is pressed in the message input field
    $('#message-input').keypress(function (e) {
        if (e.which === 13) {
            // 13 is the key code for Enter
            sendMessage();
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
            // Slash messages 
            if (!message.user) {
                const bubble = $('<div>').addClass('message-bubble').addClass('slash-bubble').text(message);
                $('#messages').prepend(bubble);
                return
            }
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
