
import { useEffect, RefObject } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: AnyEvent) => void,
): void {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      // Ignore right-clicks
      if (event instanceof MouseEvent && event.button !== 0) return;

      const el = ref?.current;
      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    // Listen on mousedown/touchstart so outside detection happens before onClick handlers,
    // while components can stopPropagation on mousedown to allow internal clicks.
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default useClickOutside;