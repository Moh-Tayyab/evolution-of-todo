'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  delay?: number;
}

export function AnimatedCard({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: 'easeOut'
      }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      {children}
    </motion.div>
  );
}

export function FadeIn({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
