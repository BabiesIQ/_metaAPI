import { motion } from "motion/react";
import type React from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.38, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}
