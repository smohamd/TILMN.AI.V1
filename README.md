<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>

# Tutorial

## Prerequisites
Before starting, ensure you have a Facebook Page. If you don't have one, create a Facebook Page first.

## Installation
Ensure you have Node.js installed, then run:

```bash
npm install express body-parser fs axios
```

## Step 1: Go to Facebook Developers
1. **Navigate to Facebook Developers:**
   - Open your web browser and go to [developers.facebook.com](https://developers.facebook.com).

2. **Create a Developer Account (if you don’t have one):**
   - Log in with your Facebook credentials and follow the prompts to set up a developer account.

## Step 2: Create an App
1. **Create an App:**
   - Click on "My Apps" in the top-right corner.
   - Select "Create App".
   - Choose "Business" as the app type.
   - Fill out the required details such as the app display name and contact email, then click "Create App ID".

## Step 3: Add the Messenger Product
1. **Set Up Messenger:**
   - In the left sidebar of your app's dashboard, click on "Add Product".
   - Locate "Messenger" and click the "Set Up" button.

## Step 4: Connect Your Facebook Page
1. **Generate a Page Access Token:**
   - Scroll to the "Access Tokens" section.
   - Click on "Add or Remove Pages".
   - Follow the prompts to connect your Facebook Page.
   - Once connected, click "Generate Token" and copy the token for later use.

## Step 5: Set Up Webhooks
1. **Configure Webhooks:**
   - Scroll down to the "Webhooks" section in Messenger settings.
   - Click "Setup Webhooks".
   - Enter the following details:
     - **Callback URL:** `https://your_hosting.site/webhook`
     - **Verify Token:** `pagebot-v3`
   - Subscribe to the following fields:
     - `messages`
     - `messaging_optins`
     - `messaging_postbacks`
   - Click "Verify and Save".

## Step 6: Add Page Subscriptions
1. **Subscribe to Page Events:**
   - Under "Webhooks", navigate to "Page Subscriptions".
   - Select the page you connected earlier.
   - Ensure that `messages`, `messaging_optins`, and `messaging_postbacks` are selected.

## Step 7: Retrieve Your Page Access Token
1. **Copy the Token:**
   - Go back to "Access Tokens".
   - Copy the generated Page Access Token.

## Step 8: Configure the Bot with the Token
1. **Enter the Token:**
   - Paste the Page Access Token into `configure.json`.

## Step 9: Test Your Messenger Bot
1. **Test Bot Functionality:**
   - Open your Facebook Page.
   - Send a message (e.g., "help") to verify if the bot responds correctly.
   - Ensure that the account used for testing has a role in the app.

**Note:** The bot will only respond to accounts assigned specific roles within the app.

## Step 10: Deploy Your Bot
1. **Deployment Instructions:**
   - Ensure your server is set up with Node.js.
   - Deploy the app to your server or cloud platform (e.g., Heroku, Render, Vercel).

2. **Run Your App:**
   - Navigate to your project directory and install any additional dependencies:
     ```bash
     npm install
     ```
   - Start your server:
     ```bash
     node index.js
     ```
   - To ensure your server restarts when code changes, consider using `nodemon` (optional):
     ```bash
     npm install -g nodemon
     nodemon index.js
     ```

## Adding Roles
1. **Navigate to [developers.facebook.com](https://developers.facebook.com):**
   - Go to [developers.facebook.com](https://developers.facebook.com).

2. **Access Your App:**
   - Log in and navigate to "My Apps".

3. **Select "App Roles":**
   - Find the "App Roles" section in your app's dashboard.

4. **Add Roles:**
   - Click on "Add Role" to start the process.

5. **Define Role Details:**
   - Specify role name and permissions as needed.

6. **Assign Roles to Users:**
   - Assign the role to specific users by providing their name or user ID.

# Creating a New Command for Your Bot

This guide explains how to create a new command for your bot using the structure provided in the sample code. Each section of the command is explained below, including where to define specific logic and utilities.

## Command File Structure

### 1. **Import Dependencies**
At the top of the file, import all required modules. For example:
```javascript
const axios = require("axios");
const { sendMessage } = require('../handles/message');
```
- `axios`: Used for making API requests.
- `sendMessage`: A utility function for sending messages.

### 2. **Command Metadata**
Define the metadata for the command, including its name, description, role, and author.
```javascript
module.exports = {
  name: "ai",              // The command trigger name.
  description: "Gpt4o x Gemini AI", // A brief description of what the command does.
  role: 1,                 // Role-based access control (1 = accessible to all).
  author: "Kiana",        // Author of the command.
```

### 3. **Main Function**
Define the `execute` function, which contains the core logic of the command. This function should:
- Validate inputs (e.g., `event.sender.id`, `args`).
- Process user input or handle attachments (e.g., analyze images or text prompts).
- Call external APIs and handle responses.

Example:
```javascript
  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error('Invalid event object: Missing sender ID.');
      sendMessage(bot, { text: 'Error: Missing sender ID.' }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const userPrompt = args.join(" ");

    if (!userPrompt && !event.message.reply_to?.mid) {
      return sendMessage(bot, { text: "Please enter your question or reply with an image to analyze." }, authToken);
    }

    try {
      // Core logic here...
    } catch (error) {
      console.error("Error in command execution:", error);
      sendMessage(bot, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
    }
  }
```

### 4. **Helper Functions**
Place utility functions below the main logic. These should handle specific tasks like:
- Interacting with APIs.
- Extracting image URLs.
- Sending long messages.

#### Example: Image Recognition Helper
```javascript
async function handleImageRecognition(apiUrl, prompt, imageUrl, senderId) {
  try {
    const { data } = await axios.get(apiUrl, {
      params: {
        q: prompt,
        uid: senderId,
        imageUrl: imageUrl || ""
      }
    });
    return data;
  } catch (error) {
    throw new Error("Failed to connect to the Gemini Vision API.");
  }
}
```

#### Example: Extracting Image URLs
```javascript
async function extractImageUrl(event, authToken) {
  try {
    if (event.message.reply_to?.mid) {
      return await getRepliedImage(event.message.reply_to.mid, authToken);
    } else if (event.message?.attachments?.[0]?.type === 'image') {
      return event.message.attachments[0].payload.url;
    }
  } catch (error) {
    console.error("Failed to extract image URL:", error);
  }
  return "";
}
```

#### Example: Sending Long Messages
```javascript
function sendLongMessage(bot, text, authToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(bot, { text: message }, authToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
```

### 5. **Export Command**
Export the entire module so it can be registered and used by the bot.
```javascript
};
```

## Notes
- Use meaningful names for functions and variables.
- Add error handling for all asynchronous tasks to ensure stability.
- Place comments to describe the purpose of each block of code.
- Test the command thoroughly before deploying it.

## Example Command File
Refer to the full example above for detailed implementation.



## Credits
- This guide was created by Clarence, Kyle, Christel, and Akira.
- Thanks to Deku (https://api.joshweb.click) for their APIs.
- Thanks to Kaiz-Api and Hiroshi for their contributions.

**Note:** Feel free to modify this file as needed.

## Contact Information
Feel free to contact **French Clarence Mangigo** if you have any concerns: [https://www.facebook.com/frenchclarence.mangigo.9](https://www.facebook.com/frenchclarence.mangigo.9)

</body>
</html>
