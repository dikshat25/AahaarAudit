import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! I am the Anti-Lenova Agent. How can I help you with product verification?' }]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    
    // Simulate or call the actual chatbot backend
    // Since the friend made a chatbot in Python, we would normally fetch here.
    // Assuming standard localhost port for now or just a mock if not running.
    try {
      setMessages(prev => [...prev, { sender: 'bot', text: '...' }]);
      
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      
      if (!response.ok) throw new Error('Chatbot offline');
      const data = await response.json();
      
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { sender: 'bot', text: data.reply || 'Sorry, I could not understand that.' };
        return newMsgs;
      });
    } catch (e) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { sender: 'bot', text: 'The chatbot service seems to be offline. (Mock: Please start the backend on port 8001)' };
        return newMsgs;
      });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-xl shadow-2xl border border-emerald-200 flex flex-col overflow-hidden"
          >
            <div className="bg-[#0A2647] p-4 text-white flex justify-between items-center">
              <h3 className="font-bold">Anti-Lenova Assistant</h3>
              <button onClick={() => setIsOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-[#F6F5F1]">
              {messages.map((msg, i) => (
                <div key={i} className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.sender === 'user' ? 'bg-[#FF9933] text-white self-end' : 'bg-white border border-emerald-100 text-emerald-900 self-start'}`}>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-emerald-100 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 border border-emerald-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#FF9933]"
              />
              <button onClick={handleSend} className="bg-[#0A2647] text-white p-2 rounded hover:bg-[#153C6E]">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0A2647] hover:bg-[#153C6E] text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
