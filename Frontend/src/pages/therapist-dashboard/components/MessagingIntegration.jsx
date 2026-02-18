import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MessagingIntegration = ({ 
  selectedClient, 
  accessibilitySettings 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageFilter, setMessageFilter] = useState('all');
  const messagesEndRef = useRef(null);

  // Mock messages data
  useEffect(() => {
    if (selectedClient) {
      const mockMessages = [
        {
          id: 1,
          senderId: selectedClient.id,
          senderName: selectedClient.name,
          senderType: 'client',
          content: "Hi Dr. Smith, I'm having trouble with my morning routine. I keep forgetting to take my medication.",
          timestamp: new Date(Date.now() - 3600000),
          read: true,
          priority: 'normal',
          type: 'text'
        },
        {
          id: 2,
          senderId: 'therapist-1',
          senderName: 'Dr. Smith',
          senderType: 'therapist',
          content: "Thank you for reaching out. Let's work on setting up some reminder strategies. Have you tried using the app's notification feature?",
          timestamp: new Date(Date.now() - 3300000),
          read: true,
          priority: 'normal',
          type: 'text'
        },
        {
          id: 3,
          senderId: selectedClient.id,
          senderName: selectedClient.name,
          senderType: 'client',
          content: "Yes, but I still miss it sometimes. Maybe we could try a different approach?",
          timestamp: new Date(Date.now() - 3000000),
          read: true,
          priority: 'normal',
          type: 'text'
        },
        {
          id: 4,
          senderId: 'therapist-1',
          senderName: 'Dr. Smith',
          senderType: 'therapist',
          content: "Absolutely! Let\'s schedule a quick call to discuss some visual cues and habit stacking techniques that might work better for you.",
          timestamp: new Date(Date.now() - 2700000),
          read: true,
          priority: 'normal',
          type: 'text'
        },
        {
          id: 5,
          senderId: selectedClient.id,
          senderName: selectedClient.name,
          senderType: 'client',
          content: "That sounds great! When would be a good time?",
          timestamp: new Date(Date.now() - 1800000),
          read: false,
          priority: 'normal',
          type: 'text'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      senderId: 'therapist-1',
      senderName: 'Dr. Smith',
      senderType: 'therapist',
      content: newMessage,
      timestamp: new Date(),
      read: true,
      priority: 'normal',
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Simulate client response
      const clientResponse = {
        id: Date.now() + 1,
        senderId: selectedClient.id,
        senderName: selectedClient.name,
        senderType: 'client',
        content: "Thank you for your help! I\'ll try that approach.",
        timestamp: new Date(),
        read: false,
        priority: 'normal',
        type: 'text'
      };
      setMessages(prev => [...prev, clientResponse]);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const markAsRead = (messageId) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, read: true } : msg
      )
    );
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffHours = Math.floor((now - messageTime) / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor((now - messageTime) / (1000 * 60));
      return `${diffMinutes}m ago`;
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }
    return messageTime.toLocaleDateString();
  };

  const filteredMessages = messages.filter(message => {
    if (messageFilter === 'all') return true;
    if (messageFilter === 'unread') return !message.read;
    if (messageFilter === 'client') return message.senderType === 'client';
    if (messageFilter === 'therapist') return message.senderType === 'therapist';
    return true;
  });

  const messageFilters = [
    { value: 'all', label: 'All Messages', count: messages.length },
    { value: 'unread', label: 'Unread', count: messages.filter(m => !m.read).length },
    { value: 'client', label: 'From Client', count: messages.filter(m => m.senderType === 'client').length },
    { value: 'therapist', label: 'From Me', count: messages.filter(m => m.senderType === 'therapist').length }
  ];

  if (!selectedClient) {
    return (
      <div className="bg-surface rounded-lg border border-border p-8 text-center">
        <Icon name="MessageCircle" size={48} className="mx-auto mb-4 text-text-tertiary" />
        <h3 className="text-lg font-medium text-text-primary mb-2">
          Select a Client
        </h3>
        <p className="text-text-secondary">
          Choose a client to view and manage your conversations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border flex flex-col h-96">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {selectedClient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">
                {selectedClient.name}
              </h3>
              <p className="text-sm text-text-secondary">
                {messages.filter(m => !m.read).length} unread messages
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              iconName="Phone"
              onClick={() => {/* Schedule call */}}
              aria-label="Schedule call"
            />
            <Button
              variant="outline"
              iconName="Calendar"
              onClick={() => {/* Schedule appointment */}}
              aria-label="Schedule appointment"
            />
          </div>
        </div>

        {/* Message Filters */}
        <div className="flex flex-wrap gap-2">
          {messageFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setMessageFilter(filter.value)}
              className={`
                flex items-center space-x-2 px-3 py-1 rounded-lg text-sm
                transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary
                ${messageFilter === filter.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }
                ${accessibilitySettings.reducedMotion ? 'transition-none' : ''}
              `}
              aria-pressed={messageFilter === filter.value}
            >
              <span>{filter.label}</span>
              {filter.count > 0 && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${messageFilter === filter.value
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-surface text-text-tertiary'
                  }
                `}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.map((message) => (
          <div
            key={message.id}
            className={`
              flex ${message.senderType === 'therapist' ? 'justify-end' : 'justify-start'}
            `}
          >
            <div
              className={`
                max-w-xs lg:max-w-md px-4 py-2 rounded-lg
                ${message.senderType === 'therapist' ?'bg-primary text-primary-foreground' :'bg-surface-secondary text-text-primary'
                }
                ${!message.read && message.senderType === 'client' ? 'ring-2 ring-primary ring-opacity-50' : ''}
              `}
              onClick={() => !message.read && markAsRead(message.id)}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-2">
                <span className={`
                  text-xs opacity-75
                  ${message.senderType === 'therapist' ? 'text-primary-foreground' : 'text-text-secondary'}
                `}>
                  {formatTimestamp(message.timestamp)}
                </span>
                {message.senderType === 'therapist' && (
                  <Icon 
                    name={message.read ? 'CheckCheck' : 'Check'} 
                    size={14} 
                    className="opacity-75"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-secondary text-text-primary px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs text-text-secondary ml-2">
                  {selectedClient.name} is typing...
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
          </div>
          <Button
            variant="primary"
            iconName="Send"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            aria-label="Send message"
          />
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-text-secondary">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>{newMessage.length}/500</span>
        </div>
      </div>
    </div>
  );
};

export default MessagingIntegration;