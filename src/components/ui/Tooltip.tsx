import React, { useState, useRef } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Don't render a wrapper if there's no tooltip text
  if (!text) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    // Set a timeout to show the tooltip after a delay
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, 300); // Faster delay
  };

  const handleMouseLeave = () => {
    // Clear the timeout if the mouse leaves before it fires
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <>
          <div 
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] text-xs rounded-md whitespace-nowrap z-[100] pointer-events-none shadow-lg"
            style={{ 
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            {text}
            {/* Tooltip arrow */}
            <div 
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px]"
              style={{
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid rgba(var(--foreground-primary-rgb))'
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Tooltip;