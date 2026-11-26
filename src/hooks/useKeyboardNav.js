import { useState, useEffect, useCallback } from 'react';

export function useKeyboardNav({ itemCount, isOpen, onSelect, onClose }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    setActiveIndex(-1);
  }, [itemCount, isOpen]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveIndex(-1);
        if (onClose) onClose();
        return;
      }

      if (itemCount <= 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % itemCount);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((prev) => (prev <= 0 ? itemCount - 1 : prev - 1));
      } else if (event.key === 'Home') {
        event.preventDefault();
        setActiveIndex(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setActiveIndex(itemCount - 1);
      } else if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < itemCount) {
        event.preventDefault();
        if (onSelect) onSelect(activeIndex);
      }
    },
    [itemCount, isOpen, activeIndex, onSelect, onClose]
  );

  return { activeIndex, setActiveIndex, handleKeyDown };
}
