import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import AuthContext from "../context/AuthContext";

const MessagingComponent = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState(''); // State to handle new message input
  const { user } = useContext(AuthContext);
  const [currentChatId, setCurrentChatId] = useState(null);

  const fetchMessages = async () => {
    try {
      if (!user) {
        console.error('User not found in AuthContext');
        setIsLoading(false); // Set isLoading to false to handle the case where user is not found
        return;
      }

      // Fetch messages associated with the user from MongoDB
      const response = await axios.get(`http://localhost:5000/api/messages/${user._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`, // Use token from AuthContext
        },
      });

      // Set messages state with fetched messages
      setMessages(response.data.messages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setIsLoading(false); // Set isLoading to false in case of error
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user, fetchMessages]); // Fetch messages whenever user changes

  const sendMessage = async (event) => {
    event.preventDefault();
  
    try {
      if (!user) {
        console.error('User not found in AuthContext');
        return;
      }
  
      await axios.post(`http://localhost:5000/send-message`, {
        userId: user._id,
        content: newMessage,
        chatId: currentChatId, // Add the chatId to the message
      }, {
        headers: {
          Authorization: `Bearer ${user.token}`, // Use token from AuthContext
        },
      });
  
      setNewMessage(''); // Clear the input field
      fetchMessages(); // Fetch messages again to update the list
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  return (
    <div>
      <h2>Previous Messages</h2>
      {isLoading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p></p>
      ) : (
        <ul>
          {messages.map((message, index) => (
            <li key={index}>
              <p>From: {message.sender}</p>
              <p>To: {message.recipient}</p>
              <p>Message: {message.content}</p>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default MessagingComponent;
