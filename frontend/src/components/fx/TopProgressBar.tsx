import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedEffects } from "@/hooks/useReducedEffects";

export const TopProgressBar: React.FC = () => {
  const location = useLocation();
  const reduced = useReducedEffects();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) return;

    setVisible(true);
    setProgress(35);

    const t1 = setTimeout(() => setProgress(75), 100);
    const t2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => setVisible(false), 200);
    }, 280);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [location.pathname, reduced]);

  if (reduced || !visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-50 pointer-events-none"
    >
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-bright transition-all duration-200 ease-out shadow-[0_0_10px_var(--accent-glow)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default TopProgressBar;
