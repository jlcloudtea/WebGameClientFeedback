'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedTransitionProps {
  children: ReactNode;
  /** Unique key for AnimatePresence — change this to trigger a transition */
  eventKey: string;
  /** Duration in seconds (default 0.3) */
  duration?: number;
  /** Slide direction: "up" | "down" | "left" | "right" (default "up") */
  direction?: 'up' | 'down' | 'left' | 'right';
}

const directionOffset = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { y: 0, x: 24 },
  right: { y: 0, x: -24 },
};

export default function AnimatedTransition({
  children,
  eventKey,
  duration = 0.3,
  direction = 'up',
}: AnimatedTransitionProps) {
  const offset = directionOffset[direction];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={eventKey}
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: -offset.y, x: -offset.x }}
        transition={{ duration, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
