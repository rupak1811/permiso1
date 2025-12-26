import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const BrandLogo = ({
  showWordmark = true,
  size = 48,
  wordmark = 'Permiso',
  className = '',
  wordmarkClassName = '',
  wordmarkStyle = {},
  logoImage = '/logo.jpg' // Default path - user can override with their image
}) => {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  const displayWordmark = (wordmark || 'PERMISO').toUpperCase();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme-based colors for wordmark
  const strokeColor = isDark ? 'rgba(200, 230, 255, 1)' : 'rgba(37, 99, 235, 1)';

  return (
    <div className={`flex items-center space-x-3 ${className}`} aria-label={displayWordmark || 'PERMISO'}>
      <div
        className="logo-core relative flex items-center justify-center overflow-hidden"
        style={{ width: dimension, height: dimension }}
      >
        {/* Logo Image */}
        <img
          src={logoImage}
          alt={`${displayWordmark} Logo`}
          className="w-full h-full object-contain"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block'
          }}
          onError={(e) => {
            // Fallback if image doesn't load
            console.warn(`Logo image not found at ${logoImage}. Please add your logo.jpg file to the public folder.`);
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* PERMISO Wordmark */}
      {showWordmark && displayWordmark && (
        <span
          className={`logo-wordmark text-xl sm:text-2xl md:text-3xl font-bold tracking-[0.15em] ${wordmarkClassName}`}
          style={{
            color: strokeColor,
            ...wordmarkStyle
          }}
        >
          {displayWordmark}
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
