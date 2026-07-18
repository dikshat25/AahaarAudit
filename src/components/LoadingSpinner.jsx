import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield } from 'lucide-react';

const TAGLINES = [
  { lang: 'mr', text: 'सही अन्न. उत्तम जीवन.' },      // Marathi
  { lang: 'hi', text: 'सही भोजन. बेहतर जीवन.' },       // Hindi
  { lang: 'en', text: 'Right Food. Better Life.' },     // English
];

// A stylised 24-spoke chakra, drawn as an inline SVG so it can be recoloured via currentColor.
function Chakra({ className = '' }) {
  const spokes = Array.from({ length: 24 });
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="100" cy="100" r="10" fill="currentColor" />
      {spokes.map((_, i) => {
        const angle = (i * 360) / spokes.length;
        return (
          <line
            key={i}
            x1="100"
            y1="100"
            x2="100"
            y2="14"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle} 100 100)`}
          />
        );
      })}
    </svg>
  );
}

export default function LoadingSpinner({ onFinish, duration = 3200 }) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const cycle = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, duration / TAGLINES.length);

    const done = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onFinish && onFinish(), 500);
    }, duration);

    return () => {
      clearInterval(cycle);
      clearTimeout(done);
    };
  }, [duration, onFinish]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => onFinish && onFinish(), 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A2647] overflow-hidden"
        >
          {/* faint tricolor wash in the background */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            background: 'linear-gradient(135deg, #FF9933 0%, transparent 30%, transparent 70%, #128807 100%)'
          }} />

          {/* Rotating chakra with the shield/emblem centered */}
          <div className="relative w-40 h-40 flex items-center justify-center mb-8">
            <Chakra className="w-40 h-40 text-[#FF9933] chakra-wheel" />
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
              className="absolute w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg"
            >
              <Shield className="w-8 h-8 text-[#0A2647]" />
            </motion.div>
          </div>

          {/* Wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center mb-6"
          >
            <h1 className="text-white font-display font-bold text-3xl tracking-wide">AAHAAR-AUDIT</h1>
          </motion.div>

          {/* Cycling trilingual tagline */}
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={taglineIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className={`text-lg font-semibold ${TAGLINES[taglineIndex].lang !== 'en' ? 'font-devanagari' : ''} text-[#FF9933]`}
              >
                {TAGLINES[taglineIndex].text}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden mt-8">
            <motion.div
              className="h-full bg-[#FF9933] rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
            />
          </div>

          <button
            onClick={handleSkip}
            className="mt-6 text-emerald-200/60 hover:text-white text-xs font-medium tracking-wide underline underline-offset-4 transition-colors"
          >
            Enter Portal
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}