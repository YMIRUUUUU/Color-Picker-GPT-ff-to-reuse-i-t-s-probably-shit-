import React from 'react';

interface LogoProps {
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ size = 40 }) => {
  const s = size;
  return (
    <div
      className="rounded-2xl border border-white/30 backdrop-blur-md"
      style={{ width: s, height: s, background: 'conic-gradient(from 0deg, #f66, #ff6, #6f6, #6ff, #66f, #f6f, #f66)' }}
    />
  );
};

export default Logo;

