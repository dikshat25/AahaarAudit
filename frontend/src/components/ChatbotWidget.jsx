import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const QUICK_REPLIES = [
  'How do I submit a complaint?',
  'What is a CMP-ID?',
  'How does AI inspection work?',
  'What violations can be detected?',
  'How is my food safety score calculated?',
  'How do I check my scorecard as an owner?',
  'What does "Inspection Completed" mean?',
  'How do I track my complaint?',
];

function renderBotText(text) {
  // Convert **bold**, bullet points (- item), and newlines to formatted HTML-like JSX
  const lines = text.split('\n');
  return lines.map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1" />;
    // Bold
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) =>
      j % 2 === 1 ? <strong key={j}>{part}</strong> : part
    );
    // Bullet line
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      return (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-[#FF9933] mt-0.5 shrink-0">•</span>
          <span>{rendered}</span>
        </div>
      );
    }
    // Heading line (starts with #)
    if (line.trim().startsWith('###')) {
      return <div key={i} className="font-bold text-[#0A2647] mt-1">{line.replace(/^#+\s*/, '')}</div>;
    }
    return <div key={i}>{rendered}</div>;
  });
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! 👋 I am the **Aahaar-Audit AI Assistant**.\n\nI can help you with:\n- Submitting and tracking complaints\n- Understanding AI inspection results\n- Navigating the portal as Customer, Owner, or Admin\n- Food safety regulations and scores\n\nWhat would you like to know?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg || loading) return;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);
    setShowQuickReplies(false);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: data.reply || 'No response received.' },
      ]);
    } catch (e) {
      console.error('Chatbot error:', e);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: '⚠️ Unable to connect to the AI assistant right now. Please ensure the backend is running, or try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => sendMessage(input);
  const handleQuickReply = (text) => sendMessage(text);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-16 right-0 w-[340px] sm:w-[380px] h-[520px] bg-white rounded-2xl shadow-2xl border border-[#0A2647]/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A2647] to-[#153C6E] p-3.5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FF9933] flex items-center justify-center shadow-md">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Aahaar-Audit Assistant</h3>
                  <span className="text-[10px] text-emerald-300 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    AI-Powered · Always On
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 bg-[#F6F5F1] scroll-smooth">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[11.5px] leading-relaxed flex flex-col gap-0.5 ${
                    msg.sender === 'user'
                      ? 'bg-[#0A2647] text-white self-end rounded-br-none shadow-sm'
                      : 'bg-white border border-[#0A2647]/10 text-[#1a1a2e] self-start rounded-bl-none shadow-sm'
                  }`}
                >
                  {msg.sender === 'bot'
                    ? renderBotText(msg.text)
                    : <p className="whitespace-pre-wrap">{msg.text}</p>}
                </div>
              ))}

              {/* Quick replies shown after initial message */}
              {showQuickReplies && messages.length === 1 && (
                <div className="flex flex-col gap-1.5 self-start w-full">
                  <p className="text-[10px] text-[#0A2647]/50 font-medium px-1">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_REPLIES.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => handleQuickReply(qr)}
                        className="text-[10.5px] bg-white border border-[#0A2647]/20 text-[#0A2647] rounded-full px-2.5 py-1 hover:bg-[#0A2647] hover:text-white transition-all duration-150 hover:border-[#0A2647] shadow-sm"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {loading && (
                <div className="bg-white border border-[#0A2647]/10 text-[#0A2647]/50 text-[11px] px-3 py-2.5 rounded-2xl self-start rounded-bl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-bounce inline-block" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-bounce inline-block [animation-delay:0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-bounce inline-block [animation-delay:0.30s]" />
                  <span className="ml-1 text-[10.5px]">AI thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Show quick replies toggle */}
            {!showQuickReplies && (
              <div className="px-3 pt-1.5 bg-[#F6F5F1]">
                <button
                  onClick={() => setShowQuickReplies((v) => !v)}
                  className="text-[10px] text-[#0A2647]/50 hover:text-[#0A2647] flex items-center gap-1 transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                  Show suggested questions
                </button>
              </div>
            )}
            {showQuickReplies && !loading && messages.length > 1 && (
              <div className="px-3 pt-2 bg-[#F6F5F1]">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {QUICK_REPLIES.slice(0, 4).map((qr) => (
                    <button
                      key={qr}
                      onClick={() => handleQuickReply(qr)}
                      className="text-[10px] bg-white border border-[#0A2647]/20 text-[#0A2647] rounded-full px-2 py-0.5 hover:bg-[#0A2647] hover:text-white transition-all duration-150"
                    >
                      {qr}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#0A2647]/10 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about the app, complaints, inspections..."
                className="flex-1 border border-[#0A2647]/15 rounded-xl px-3 py-2 text-[11.5px] focus:outline-none focus:border-[#FF9933] bg-[#F6F5F1] transition-colors"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-[#0A2647] text-white p-2.5 rounded-xl hover:bg-[#FF9933] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-14 h-14 bg-[#0A2647] hover:bg-[#FF9933] text-white rounded-full flex items-center justify-center shadow-2xl transition-colors duration-200 relative"
        title="Open Aahaar-Audit Assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FF9933] rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
}
