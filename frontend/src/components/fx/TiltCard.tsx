import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  sheen?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = "",
  intensity = 15,
  sheen = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedEffects();

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sheenPos, setSheenPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -intensity;
    const rotateY = ((x - centerX) / centerX) * intensity;

    setTilt({ x: rotateX, y: rotateY });
    setSheenPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (!reduced) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  if (reduced) {
    return (
      <div className={`transition-shadow hover:shadow-lg ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="relative">
      <motion.div
        ref={cardRef}
        className={`relative overflow-hidden rounded-2xl will-change-transform ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.015 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          mass: 0.5,
        }}
        {...(props as any)}
      >
        {children}

        {sheen && isHovered && (
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(circle 220px at ${sheenPos.x}% ${sheenPos.y}%, rgba(255, 255, 255, 0.12), transparent 80%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TiltCard;
