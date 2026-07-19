import React, { useState } from 'react';
import { Search, Type, Contrast, Globe2 } from 'lucide-react';

export default function GovHeader() {
  const [lang, setLang] = useState('EN');
  const [textSize, setTextSize] = useState(0); // 0,1,2 -> A A+ A++

  const sizeClasses = ['text-[13px]', 'text-sm', 'text-base'];

  return (
    <div className="relative z-[60]">
      {/* Skip link — accessibility, standard on Indian govt portals */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-1 focus:bg-white focus:text-[#0A2647] focus:px-3 focus:py-1 focus:rounded focus:z-50 focus:text-xs focus:font-bold"
      >
        Skip to Main Content
      </a>

      {/* Top identification bar */}
      <div className={`gov-topbar w-full px-4 md:px-6 py-1.5 flex items-center justify-between ${sizeClasses[textSize]}`}>
       
        <div className="flex items-center gap-4 text-[#0A2647]/70">
          <button
            onClick={() => setTextSize((s) => (s + 1) % 3)}
            className="hidden sm:flex items-center gap-1 hover:text-[#0A2647] transition-colors"
            title="Change text size"
          >
            <Type className="w-3.5 h-3.5" /> {['A', 'A+', 'A++'][textSize]}
          </button>
          <button className="hidden sm:flex items-center gap-1 hover:text-[#0A2647] transition-colors" title="High contrast">
            <Contrast className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1 hover:text-[#0A2647] transition-colors" title="Search site">
            <Search className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent font-bold text-[#0A2647] focus:outline-none cursor-pointer"
            >
              <option value="EN">English</option>
              <option value="MR">मराठी</option>
              <option value="HI">हिंदी</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tricolor hairline */}
      <div className="gov-strip-tricolor" />
    </div>
  );
}