import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  placement?: 'above' | 'below';
}

const Tooltip: React.FC<TooltipProps> = ({ children, text, placement = 'above' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ left: number; top: number; placement: 'above' | 'below' } | null>(null);

  // Don't render a wrapper if there's no tooltip text
  if (!text) {
    return <>{children}</>;
  }

  const handleMouseEnter = () => {
    // Set a timeout to show the tooltip after a delay
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);

      // Compute viewport-based coordinates to avoid clipping
      const el = anchorRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const margin = 8;
        const estimatedHeight = 28; // approximate small tooltip height
        const hasSpaceAbove = rect.top > (estimatedHeight + margin);
        const hasSpaceBelow = (window.innerHeight - rect.bottom) > (estimatedHeight + margin);
        const finalPlacement: 'above' | 'below' = placement === 'above'
          ? (hasSpaceAbove ? 'above' : 'below')
          : (hasSpaceBelow ? 'below' : 'above');

        const centerX = rect.left + rect.width / 2;
        const left = Math.min(Math.max(centerX, margin), window.innerWidth - margin);
        const top = finalPlacement === 'above' ? rect.top - margin : rect.bottom + margin;
        setCoords({ left, top, placement: finalPlacement });
      }
    }, 250); // slight delay for smoother feel
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
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={anchorRef}
    >
      {children}
      {isVisible && coords && createPortal(
        <div 
          role="tooltip"
          className="fixed px-3 py-1.5 bg-[rgba(var(--foreground-primary-rgb))] text-[rgba(var(--background-primary-rgb))] text-xs rounded-md whitespace-nowrap z-[1000] pointer-events-none shadow-lg"
          style={{
            left: `${coords.left}px`,
            top: `${coords.top}px`,
            transform: coords.placement === 'above' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {text}
          <div 
            className={`absolute ${coords.placement === 'above' ? 'bottom-[-4px]' : 'top-[-4px]'} left-1/2 -translate-x-1/2`}
            style={{
              width: 0,
              height: 0,
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
              borderTop: coords.placement === 'above' ? '4px solid rgba(var(--foreground-primary-rgb))' : '0',
              borderBottom: coords.placement === 'below' ? '4px solid rgba(var(--foreground-primary-rgb))' : '0'
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default Tooltip;