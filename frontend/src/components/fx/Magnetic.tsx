import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  pullFactor?: number;
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className = "",
  pullFactor = 0.35,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedEffects();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    setPosition({ x: middleX * pullFactor, y: middleY * pullFactor });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 220, damping: 18, mass: 0.2 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
