import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalMenuProps {
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  children: React.ReactNode;
  placement?: 'auto' | 'above' | 'below';
  offset?: number;
  align?: 'right' | 'left';
}

// Lightweight portal menu that positions itself relative to the anchor
// and sits above all stacking contexts to ensure reliable clicks.
const PortalMenu: React.FC<PortalMenuProps> = ({ anchorRef, isOpen, children, placement = 'auto', offset = 8, align = 'right' }) => {
  const [coords, setCoords] = useState<{ left: number; top: number } | null>(null);
  const [finalPlacement, setFinalPlacement] = useState<'above' | 'below'>('below');
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const estimatedHeight = containerRef.current?.offsetHeight ?? 160;

      let desired: 'above' | 'below';
      if (placement === 'auto') {
        const spaceBelow = window.innerHeight - rect.bottom - offset;
        const spaceAbove = rect.top - offset;
        if (spaceBelow >= estimatedHeight) desired = 'below';
        else if (spaceAbove >= estimatedHeight) desired = 'above';
        else desired = spaceBelow >= spaceAbove ? 'below' : 'above';
      } else {
        desired = placement;
      }
      setFinalPlacement(desired);

      const leftBase = align === 'right' ? rect.right : rect.left;
      const topBase = desired === 'below' ? (rect.bottom + offset) : (rect.top - offset - estimatedHeight);
      setCoords({ left: leftBase, top: topBase });
    };

    if (isOpen) {
      update();
      // Recompute on scroll/resize for robustness
      window.addEventListener('scroll', update, true);
      window.addEventListener('resize', update);
      // Recompute after first paint to get actual height
      requestAnimationFrame(update);
    }
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorRef, isOpen, placement, offset, align]);

  if (!isOpen || !coords) return null;

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-auto"
      style={{ 
        left: coords.left, 
        top: coords.top, 
        transform: align === 'right' ? 'translateX(-100%)' : 'translateX(0)'
      }}
      onMouseDown={(e) => { e.stopPropagation(); }}
      onPointerDown={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); }}
      role="menu"
      ref={containerRef}
    >
      <div className="relative">
        {children}
        <div 
          className={`absolute ${finalPlacement === 'above' ? 'bottom-[-6px]' : 'top-[-6px]'} right-4`}
          style={{
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: finalPlacement === 'above' ? '6px solid rgba(var(--background-primary-rgb))' : '0',
            borderBottom: finalPlacement === 'below' ? '6px solid rgba(var(--background-primary-rgb))' : '0'
          }}
        />
      </div>
    </div>,
    document.body
  );
};

export default PortalMenu;