import React, { useEffect, useState } from "react";
import { useReducedEffects } from "@/hooks/useReducedEffects";

interface TypewriterProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
  cursorClassName?: string;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  phrases,
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseDuration = 2000,
  className = "",
  cursorClassName = "text-cyan-400",
}) => {
  const [currentText, setCurrentText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const reduced = useReducedEffects();

  useEffect(() => {
    if (reduced || phrases.length === 0) {
      setCurrentText(phrases[0] || "");
      return;
    }

    const currentPhrase = phrases[phraseIndex];

    let timer: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (currentText.length < currentPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration, reduced]);

  if (reduced) {
    return <span className={className}>{phrases[0]}</span>;
  }

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span className={`inline-block w-0.5 h-[1.1em] ml-1 bg-current animate-pulse ${cursorClassName}`} />
    </span>
  );
};

export default Typewriter;
