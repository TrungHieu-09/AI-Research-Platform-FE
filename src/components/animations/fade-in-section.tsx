"use client";

import { motion } from "framer-motion";
import React from "react";

interface FadeInSectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export function FadeInSection({ children, className, id }: FadeInSectionProps) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  );
}
