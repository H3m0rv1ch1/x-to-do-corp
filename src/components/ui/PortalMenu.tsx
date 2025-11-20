import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export type MenuPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'right-start' | 'right-end' | 'left-start' | 'left-end';

interface PortalMenuProps {
  anchorRef: React.RefObject<HTMLElement>;
  isOpen: boolean;
  children: React.ReactNode;
  preferredPosition?: MenuPosition;
  offset?: number;
  onClose?: () => void;
}

const PortalMenu: React.FC<PortalMenuProps> = ({
  anchorRef,
  isOpen,
  children,
  preferredPosition = 'bottom-right',
  offset = 8,
  onClose
}) => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      const menu = menuRef.current;
      if (!anchor || !menu || !isOpen) return;

      const anchorRect = anchor.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Helper to check if a rect fits in viewport
      const fits = (top: number, left: number, width: number, height: number) => {
        return (
          top >= 0 &&
          left >= 0 &&
          top + height <= viewportHeight &&
          left + width <= viewportWidth
        );
      };

      // Calculate coordinates for a given position
      const getCoords = (pos: MenuPosition) => {
        let top = 0;
        let left = 0;

        switch (pos) {
          case 'bottom-right':
            top = anchorRect.bottom + offset;
            left = anchorRect.right - menuRect.width;
            break;
          case 'bottom-left':
            top = anchorRect.bottom + offset;
            left = anchorRect.left;
            break;
          case 'top-right':
            top = anchorRect.top - menuRect.height - offset;
            left = anchorRect.right - menuRect.width;
            break;
          case 'top-left':
            top = anchorRect.top - menuRect.height - offset;
            left = anchorRect.left;
            break;
          case 'right-start':
            top = anchorRect.top;
            left = anchorRect.right + offset;
            break;
          case 'right-end':
            top = anchorRect.bottom - menuRect.height;
            left = anchorRect.right + offset;
            break;
          case 'left-start':
            top = anchorRect.top;
            left = anchorRect.left - menuRect.width - offset;
            break;
          case 'left-end':
            top = anchorRect.bottom - menuRect.height;
            left = anchorRect.left - menuRect.width - offset;
            break;
        }
        return { top, left };
      };

      // Try preferred position first
      let { top, left } = getCoords(preferredPosition);

      // If it doesn't fit, try to flip vertically/horizontally
      if (!fits(top, left, menuRect.width, menuRect.height)) {
        const positions: MenuPosition[] = [
          'bottom-right', 'bottom-left', 'top-right', 'top-left',
          'right-start', 'right-end', 'left-start', 'left-end'
        ];

        // Find first position that fits
        for (const pos of positions) {
          if (pos === preferredPosition) continue;
          const testCoords = getCoords(pos);
          if (fits(testCoords.top, testCoords.left, menuRect.width, menuRect.height)) {
            top = testCoords.top;
            left = testCoords.left;
            break;
          }
        }

        // If nothing fits perfectly, constrain to viewport
        if (!fits(top, left, menuRect.width, menuRect.height)) {
          // Constrain vertically
          if (top < 0) top = offset;
          if (top + menuRect.height > viewportHeight) top = viewportHeight - menuRect.height - offset;

          // Constrain horizontally
          if (left < 0) left = offset;
          if (left + menuRect.width > viewportWidth) left = viewportWidth - menuRect.width - offset;
        }
      }

      setCoords({ top, left });
    };

    if (isOpen) {
      // Initial update
      updatePosition();

      // Update on resize/scroll
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      // Use ResizeObserver for menu size changes
      const resizeObserver = new ResizeObserver(updatePosition);
      if (menuRef.current) resizeObserver.observe(menuRef.current);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
        resizeObserver.disconnect();
      };
    }
  }, [isOpen, preferredPosition, offset, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop to handle clicks outside */}
      <div
        className="fixed inset-0 z-[9998] cursor-default"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-[9999] animate-scale-in"
        style={{
          top: coords ? coords.top : -9999,
          left: coords ? coords.left : -9999,
          opacity: coords ? 1 : 0, // Hide until positioned
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  );
};

export default PortalMenu;