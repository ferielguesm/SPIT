import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Hello! I am SPIT AI. How can I help you with your travel plans in Tunisia today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8084/api/chat', {
        message: message
      });
      
      const botMsg = { role: 'bot', text: response.data.response };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2" stroke="white"></rect>
                  <circle cx="12" cy="5" r="2" fill="var(--accent)" stroke="var(--accent)"></circle>
                  <path d="M12 7v4" stroke="white"></path>
                  <circle cx="8" cy="16" r="0.5" fill="var(--accent)" stroke="var(--accent)"></circle>
                  <circle cx="16" cy="16" r="0.5" fill="var(--accent)" stroke="var(--accent)"></circle>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>SPIT AI</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Online Intelligence</div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-typing">
                  Thinking <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              className="chat-input"
              placeholder="Ask about SPIT..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="chat-send" onClick={handleSend}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="chat-trigger" onClick={() => setIsOpen(!isOpen)}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Signal Ping for Antenna */}
          <circle cx="12" cy="5" r="4" stroke="var(--accent)" strokeWidth="1" className="bot-antenna-ping" opacity="0.5"></circle>
          
          <rect x="3" y="11" width="18" height="10" rx="2" stroke="var(--primary)"></rect>
          <circle cx="12" cy="5" r="2" fill="var(--accent)" stroke="var(--accent)"></circle>
          <path d="M12 7v4" stroke="var(--primary)"></path>
          <circle cx="8" cy="16" r="0.8" fill="var(--accent)" stroke="var(--accent)" className="bot-eye"></circle>
          <circle cx="16" cy="16" r="0.8" fill="var(--accent)" stroke="var(--accent)" className="bot-eye"></circle>
        </svg>
      </div>
    </div>
  );
};

export default ChatWidget;
