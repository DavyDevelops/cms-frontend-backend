const mongoose = require("mongoose");
const ChatSchema = new mongoose.Schema({
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }]
  });
  
  const Chat = mongoose.model('Chat', ChatSchema);
  module.exports = Chat;
  