import { useState, useCallback, useEffect } from "react";

export function useSelection(itemCount: number, viewportHeight: number) {
  const [cursor, setCursor] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Reset cursor when list changes
  useEffect(() => {
    if (cursor >= itemCount) {
      setCursor(Math.max(0, itemCount - 1));
    }
  }, [itemCount, cursor]);

  const moveUp = useCallback(() => {
    setCursor((c) => {
      const next = Math.max(0, c - 1);
      setScrollOffset((offset) => {
        if (next < offset) return next;
        return offset;
      });
      return next;
    });
  }, []);

  const moveDown = useCallback(() => {
    setCursor((c) => {
      const next = Math.min(itemCount - 1, c + 1);
      setScrollOffset((offset) => {
        if (next >= offset + viewportHeight) return next - viewportHeight + 1;
        return offset;
      });
      return next;
    });
  }, [itemCount, viewportHeight]);

  const reset = useCallback(() => {
    setCursor(0);
    setScrollOffset(0);
  }, []);

  return { cursor, scrollOffset, moveUp, moveDown, reset, setCursor };
}
