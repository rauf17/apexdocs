import { Link } from 'react-router-dom';

export default function Logo({ theme = 'dark', className = '', onClick }) {
  const textColor = theme === 'dark' ? '#f0f0f0' : '#1a1a1a';
  
  return (
    <Link to="/" className={`flex items-center gap-3 group ${className}`} onClick={onClick}>
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 transition-transform group-hover:scale-105 duration-300">
        {/* Subtle drop shadow for the pages */}
        <filter id="shadow" x="-2" y="-2" width="44" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
        </filter>
        
        <g filter="url(#shadow)">
          {/* Left Page */}
          <path d="M19.5 32C15.5 32 9 30 6 28V12C9 14 15.5 16 19.5 16V32Z" fill="#fafafa" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round"/>
          {/* Right Page */}
          <path d="M20.5 32C24.5 32 31 30 34 28V12C31 14 24.5 16 20.5 16V32Z" fill="#fafafa" stroke="#1a1a1a" strokeWidth="1.5" strokeLinejoin="round"/>
        </g>
        
        {/* Spine */}
        <line x1="20" y1="16" x2="20" y2="32" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
        
        {/* Left Page Lines */}
        <path d="M9 19.5C12 20.5 15.5 21.5 18 21.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        <path d="M9 23.5C12 24.5 15.5 25.5 18 25.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        <path d="M9 27.5C12 28.5 15.5 29.5 18 29.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        
        {/* Right Page Lines */}
        <path d="M31 19.5C28 20.5 24.5 21.5 22 21.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        <path d="M31 23.5C28 24.5 24.5 25.5 22 25.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        <path d="M31 27.5C28 28.5 24.5 29.5 22 29.5" stroke="#cccccc" strokeWidth="1" strokeLinecap="round"/>
        
        {/* Gold Sparkle */}
        <path d="M20 5 L21.5 9.5 L26 11 L21.5 12.5 L20 17 L18.5 12.5 L14 11 L18.5 9.5 Z" fill="#d4a843" className="origin-center animate-[float_3s_ease-in-out_infinite]"/>
      </svg>
      <span className="font-serif text-[22px] tracking-wide" style={{ color: textColor }}>ApexDocs</span>
    </Link>
  );
}
