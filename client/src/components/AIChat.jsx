import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageSquare, Send, Loader2, Bot, User } from 'lucide-react';
import api from '../utils/api';

export function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/api/chat', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data.data);
    } catch (err) {
      console.error('Chat history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setLoading(true);

    // Add user message optimistically
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);

    try {
      const token = localStorage.getItem('token');
      const { data } = await api.post('/api/chat', { query: userMsg }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(prev => [...prev, { role: 'model', content: data.data }]);
    } catch (err) {
      console.error('Chat error:', err);
      alert('Failed to get advice. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white h-[600px] rounded-xl shadow-sm border border-gray-100 flex flex-col sticky top-24">
      <div className="px-6 py-4 border-b border-gray-100 bg-primary/5 rounded-t-xl flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center text-secondary">
          <MessageSquare className="mr-2 w-5 h-5" /> AI Advisor
        </h2>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Online</span>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
        {historyLoading ? (
          <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Ask me about your budget or spending habits!</p>
          </div>
        ) : (
          messages.map((m, i) => (//ai response will be in form of many messages(an array of messages)
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                ? 'bg-primary text-white rounded-tr-none shadow-md'
                : 'bg-gray-100 text-gray-700 rounded-tl-none border border-gray-200'
                }`}>
                <div className="flex items-center space-x-1 mb-1 opacity-70">
                  {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  <span className="text-[10px] font-bold uppercase tracking-tighter">
                    {m.role === 'user' ? 'You' : 'TrackAI'}
                  </span>
                </div>
                {m.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/30">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            placeholder="Ask about your budget..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 top-1.5 p-1.5 bg-primary text-white rounded-lg hover:bg-secondary disabled:opacity-50 shadow-sm transition-all active:scale-90"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </section>
  );
}
