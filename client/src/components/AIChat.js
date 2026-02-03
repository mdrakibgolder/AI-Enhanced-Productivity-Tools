import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader, Bot, User, Sparkles } from 'lucide-react';
import { aiService } from '../services/api';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI productivity coach. Ask me anything about managing tasks, improving focus, or boosting your productivity!"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await aiService.chat(userMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.message 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "How can I be more productive?",
    "Help me prioritize my tasks",
    "I'm feeling overwhelmed",
    "Tips for better focus"
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`ai-chat-button ${isOpen ? 'hidden' : ''}`}
        aria-label="Open AI Chat"
      >
        <Sparkles size={24} />
        <span className="ai-chat-button-pulse"></span>
      </button>

      {/* Chat Window */}
      <div className={`ai-chat-window ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-avatar">
              <Bot size={20} />
            </div>
            <div>
              <h3>AI Productivity Coach</h3>
              <span className="ai-chat-status">
                <span className="status-dot"></span>
                Powered by DeepSeek AI
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="ai-chat-close">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="ai-chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`ai-chat-message ${msg.role}`}>
              <div className="ai-chat-message-avatar">
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`ai-chat-message-content ${msg.isError ? 'error' : ''}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="ai-chat-message assistant">
              <div className="ai-chat-message-avatar">
                <Bot size={16} />
              </div>
              <div className="ai-chat-message-content loading">
                <Loader size={16} className="spin" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="ai-chat-quick-prompts">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(prompt);
                }}
                className="quick-prompt-btn"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="ai-chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="ai-chat-input"
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="ai-chat-send"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
};

export default AIChat;
