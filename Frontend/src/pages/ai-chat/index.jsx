import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/ui/Header';
import TabNavigation from '../../components/ui/TabNavigation';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import axiosClient from '../../api/axiosClient';

const AIChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const listEndRef = useRef(null);

  const scrollToBottom = () => listEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    (async () => {
      setLoadingHistory(true);
      try {
        const { data } = await axiosClient.get('/api/ai/chat/history');
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setError('');
    setMessages((m) => [...m, { role: 'user', content: text, timestamp: new Date() }]);
    setLoading(true);
    try {
      const { data } = await axiosClient.post('/api/ai/chat', { message: text });
      setMessages((m) => [...m, { role: 'assistant', content: data.reply || data.response || '', timestamp: new Date() }]);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not get a response. Try again.');
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <TabNavigation />
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <Icon name="MessageCircle" size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">AI Assistant</h1>
            <p className="text-sm text-text-secondary">Routine setup, queries, and productivity tips.</p>
          </div>
        </div>

        <div className="flex-1 bg-surface rounded-xl border border-border overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Icon name="Loader2" size={28} className="animate-spin text-primary" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Icon name="MessageCircle" size={48} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium text-text-primary mb-1">Start a conversation</p>
                <p className="text-sm">Ask for help with routines, time management, or motivation.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-surface-secondary text-text-primary'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-surface-secondary rounded-lg px-4 py-2">
                  <Icon name="Loader2" size={18} className="animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {error && (
            <div className="px-4 py-2 bg-error-50 text-error-700 text-sm">{error}</div>
          )}

          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1 px-3 py-2 border border-border rounded-lg bg-surface text-text-primary focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
            <Button variant="primary" onClick={sendMessage} disabled={loading || !input.trim()} iconName="Send">
              Send
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AIChatPage;
