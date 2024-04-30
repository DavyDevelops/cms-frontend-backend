const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');

require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Route to handle sending messages via Termii API
app.post('/send-message', async (req, res) => {
  try {
    const { to, message } = req.body;

    const data = {
      "to": to, // Phone numbers to send SMS to
      "from": "YourSenderID", // Sender ID registered with Termii
      "sms": message, // Message to send
      "type": "plain", // Type of message (plain or unicode)
      "api_key": process.env.TERMII_API_KEY, // Your Termii API key
      "channel": "generic" // Communication channel (generic or whatsapp)
    };

    const options = {
      method: 'POST',
      url: 'https://api.ng.termii.com/api/sms/send/bulk',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error('Error sending message:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Message sent successfully:', body);
      return res.status(200).json({ message: 'Messages sent successfully' });
    });
  } catch (error) {
    console.error('Error sending messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
