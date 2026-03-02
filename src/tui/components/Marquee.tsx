import React, { useState, useEffect } from "react";
import { Text } from "ink";

interface MarqueeProps {
  text: string;
  width: number;
  active: boolean;
  color?: string;
  speed?: number;
}

export function Marquee({ text, width, active, color, speed = 300 }: MarqueeProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [text, active]);

  useEffect(() => {
    if (!active || text.length <= width) return;
    const padded = text + "   " + text;
    const maxOffset = text.length + 3;
    const timer = setInterval(() => {
      setOffset((o) => (o + 1) % maxOffset);
    }, speed);
    return () => clearInterval(timer);
  }, [active, text, width, speed]);

  if (text.length <= width) {
    return <Text color={color}>{text}</Text>;
  }

  if (!active) {
    return <Text color={color}>{text.slice(0, width - 1) + "\u2026"}</Text>;
  }

  const padded = text + "   " + text;
  const visible = padded.slice(offset, offset + width);
  return <Text color={color}>{visible}</Text>;
}
