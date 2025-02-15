import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react'; // You can use any icon or custom design

const Alice = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: 'AI Assistant: How can I help you today?', sender: 'bot' }
  ]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = () => {
    if (message.trim()) {
      setMessages([
        ...messages,
        { text: `You: ${message}`, sender: 'user' },
        { text: `Q-Bot Alice: I'm here to assist you!`, sender: 'bot' }
      ]);
      setMessage(''); // Clear the input field
    }
  };

  return (
    <div>
      {/* Floating button to open/close AI Assistant */}
      <div 
        onClick={toggleChat} 
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg cursor-pointer transition-all ${
          isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        <MessageCircle size={24} className={isDarkMode ? 'text-white' : 'text-white'} />
      </div>

      {/* Chatbox (visible when 'isOpen' is true) */}
      {isOpen && (
        <div className={`fixed bottom-24 right-6 w-80 h-96 p-4 border rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-black border-gray-300'
        }`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Q-Bot Alice</h3>
              <button 
                onClick={toggleChat} 
                className={`text-gray-500 hover:text-gray-700 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                X
              </button>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className={msg.sender === 'bot' ? 
                  (isDarkMode ? 'bg-gray-700 text-white p-2 rounded-md' : 'bg-gray-200 text-black p-2 rounded-md') :
                  (isDarkMode ? 'bg-blue-600 text-white p-2 rounded-md' : 'bg-blue-200 text-black p-2 rounded-md')
                }>
                  <p>{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Input Field and Submit Button */}
            <div className="flex mt-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className={`p-2 border rounded-md w-full mr-2 ${
                  isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-black border-gray-300'
                }`}
                value={message}
                onChange={handleInputChange}
              />
              <button 
                onClick={handleSubmit} 
                className={`bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 ${
                  isDarkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alice;
