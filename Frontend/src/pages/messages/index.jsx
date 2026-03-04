import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';

const Messages = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showContactList, setShowContactList] = useState(true);
  const [unreadByContact, setUnreadByContact] = useState({});
  const messagesEndRef = useRef(null);

  // Determine user role at component level
  const roleName = user?.role?.name || user?.role || localStorage.getItem('userRole') || 'user';
  const isCaregiverOrTherapist = ['caregiver', 'therapist'].includes(roleName);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/api/messages/unread-by-contact');
      setUnreadByContact(data?.unreadByContact || {});
    } catch {
      setUnreadByContact({});
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        let mapped = [];
        if (isCaregiverOrTherapist) {
          const { data } = await axiosClient.get('/api/user-assignments/my-users');
          mapped = (Array.isArray(data) ? data : [])
            .filter(a => a.isActive && a.userId)
            .map(a => ({
              id: a.userId._id || a.userId,
              name: a.userId.name || 'Unknown',
              email: a.userId.email || '',
              role: 'user',
              assignmentId: a._id
            }));
        } else {
          const { data } = await axiosClient.get(`/api/user-assignments/${user.id}`);
          mapped = (Array.isArray(data) ? data : [])
            .filter(a => a.isActive && a.relatedUserId)
            .map(a => ({
              id: a.relatedUserId._id || a.relatedUserId,
              name: a.relatedUserId.name || 'Unknown',
              email: a.relatedUserId.email || '',
              role: a.relationshipType,
              assignmentId: a._id
            }));
        }
        setContacts(mapped);
        fetchUnreadCounts();
      } catch {
        setContacts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, isCaregiverOrTherapist, fetchUnreadCounts]);

  const fetchMessages = useCallback(async (contactId) => {
    try {
      const { data } = await axiosClient.get(`/api/messages/messages?contactId=${contactId}`);
      const myId = user?.id?.toString?.() || user?.id;
      const list = (Array.isArray(data) ? data : []).map(m => {
        const sid = m.senderId?.toString?.() || m.senderId;
        return {
          id: m._id,
          senderId: sid,
          isMe: sid === myId,
          content: m.content,
          timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
          read: m.read
        };
      });
      setMessages(list);
    } catch {
      setMessages([]);
    }
  }, [user]);

  const selectContact = (contact) => {
    setSelectedContact(contact);
    setShowContactList(false);
    fetchMessages(contact.id);
    setUnreadByContact(prev => ({ ...prev, [contact.id]: 0 }));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages every 10s
  useEffect(() => {
    if (!selectedContact) return;
    const interval = setInterval(() => fetchMessages(selectedContact.id), 10000);
    return () => clearInterval(interval);
  }, [selectedContact, fetchMessages]);

  // Poll for unread counts every 15s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => fetchUnreadCounts(), 15000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCounts]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedContact) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);
    try {
      const { data } = await axiosClient.post('/api/messages/send', {
        receiverId: selectedContact.id,
        content
      });
      setMessages(prev => [...prev, {
        id: data._id,
        senderId: user?.id,
        isMe: true,
        content: data.content || content,
        timestamp: data.createdAt ? new Date(data.createdAt) : new Date(),
        read: true
      }]);
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    const now = new Date();
    const d = new Date(ts);
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  const getInitials = (name) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Messages - NestifyND</title></Helmet>
      <Header />
      <TabNavigation />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Messages</h1>
          <p className="text-sm text-text-secondary mt-1">
            {isCaregiverOrTherapist 
              ? 'Communicate with your assigned users'
              : 'Communicate with your therapists and caregivers'}
          </p>
        </div>

        <div className="bg-surface border border-border rounded-lg overflow-hidden flex" style={{ height: '70vh' }}>
          {/* Contact List */}
          <div className={`w-full md:w-80 border-r border-border flex-shrink-0 flex flex-col ${!showContactList && selectedContact ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Contacts</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-6 text-center">
                  <Icon name="Users" size={40} className="mx-auto mb-3 text-text-tertiary" />
                  <p className="text-sm text-text-secondary">No contacts yet</p>
                  <p className="text-xs text-text-tertiary mt-1">
                    {isCaregiverOrTherapist 
                      ? 'Users can assign you from their Settings to connect.'
                      : 'Assign a therapist or caregiver from Settings to start messaging.'}
                  </p>
                </div>
              ) : (
                contacts.map(contact => {
                  const unreadCount = unreadByContact[contact.id] || 0;
                  return (
                    <button
                      key={contact.id}
                      onClick={() => selectContact(contact)}
                      className={`w-full flex items-center space-x-3 p-4 text-left transition-colors hover:bg-surface-secondary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary ${selectedContact?.id === contact.id ? 'bg-primary-50 border-l-4 border-l-primary' : ''}`}
                    >
                      <div className="relative w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold text-sm">{getInitials(contact.name)}</span>
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium px-1">
                            {unreadCount > 9 ? '9+' : unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-text-primary truncate">{contact.name}</span>
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-error text-error-foreground text-xs rounded-full px-2 py-0.5 font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-text-secondary capitalize">{contact.role}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showContactList && !selectedContact ? 'hidden md:flex' : 'flex'}`}>
            {selectedContact ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center space-x-3">
                  <button
                    onClick={() => setShowContactList(true)}
                    className="md:hidden p-2 rounded-lg hover:bg-surface-secondary"
                    aria-label="Back to contacts"
                  >
                    <Icon name="ArrowLeft" size={20} className="text-text-secondary" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">{getInitials(selectedContact.name)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{selectedContact.name}</h3>
                    <p className="text-xs text-text-secondary capitalize">{selectedContact.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Icon name="MessageCircle" size={48} className="text-text-tertiary mb-3" />
                      <p className="text-sm text-text-secondary">No messages yet</p>
                      <p className="text-xs text-text-tertiary mt-1">Send a message to start the conversation</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-surface-secondary text-text-primary rounded-bl-sm'}`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${msg.isMe ? 'text-primary-foreground opacity-70' : 'text-text-tertiary'}`}>
                            <span className="text-xs">{formatTime(msg.timestamp)}</span>
                            {msg.isMe && (
                              <Icon name={msg.read ? 'CheckCheck' : 'Check'} size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-end space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-text-primary resize-none text-sm"
                      style={{ maxHeight: '120px' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                      }}
                    />
                    <Button
                      variant="primary"
                      iconName="Send"
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      aria-label="Send message"
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-text-tertiary">
                    <span>Enter to send, Shift+Enter for new line</span>
                    <span>{newMessage.length}/500</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Icon name="MessageCircle" size={64} className="text-text-tertiary mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Select a conversation</h3>
                <p className="text-sm text-text-secondary">
                  Choose a contact from the list to start messaging
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Messages;
