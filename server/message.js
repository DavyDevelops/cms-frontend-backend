const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const { isValidObjectId } = mongoose.Types.ObjectId;

require("dotenv").config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Load models
const Message = require('./models/messages');
const User = require('./models/user'); 
const Contact = require('./models/contact'); 

app.use(bodyParser.json());

// Route to handle fetching messages for a specific user
app.get('/api/messages/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId: chatId });
    return res.status(200).json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to handle sending messages and returning sent messages
app.post('/send-message', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contacts = await Contact.find({ postedBy: userId });
    if (!contacts.length) {
      return res.status(400).json({ error: 'No contacts found for the user' });
    }

    const sentMessages = await sendMessagesToContacts(user, contacts, message);

    await Message.insertMany(sentMessages);
    return res.status(200).json({ message: 'Messages sent successfully', sentMessages });
  } catch (error) {
    console.error('Error sending messages:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

async function sendMessagesToContacts(user, contacts, message) {
  const sentMessages = [];

  for (const contact of contacts) {
    const options = {
      method: 'POST',
      url: 'https://send.api.mailtrap.io/api/send',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Api-Token': process.env.MAILTRAP_API_TOKEN
      },
      body: {
        to: [{ email: contact.email, name: contact.name }],
        from: { email: 'sales@example.com', name: 'Example Sales Team' },
        subject: 'New Message From Example',
        text: message,
        html: `<p>${message}</p>`
      },
      json: true
    };

    const response = await new Promise((resolve, reject) => {
      request(options, (error, response, body) => {
        if (error) reject(error);
        resolve(body);
      });
    });

    sentMessages.push({
      sender: user.name,
      recipient: contact.name,
      content: message,
      messageId: response.message_ids[0] // Assuming there's only one message ID
    });
  }

  return sentMessages;
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
