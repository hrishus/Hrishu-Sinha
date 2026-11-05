import { useEffect, useMemo, useState, useRef, CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";

export type TextMorphProps = {
  words?: string[];
  interval?: number;
  className?: string;
  charClassName?: string;
  style?: CSSProperties;
};

const defaultWords = [
  "Creative Developer",
  "Visual Engineer",
  "Problem Solver"
];

export function TextMorph({
  words = defaultWords,
  interval = 2500,
  className,
  charClassName,
  style,
}: TextMorphProps) {
  const [index, setIndex] = useState(0);
  const wordsRef = useRef(words);
  wordsRef.current = words;

  useEffect(() => {
    if (!wordsRef.current.length) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % wordsRef.current.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval]);

  const currentWord = words[index] ?? wordsRef.current[index] ?? "";
  const chars = useMemo(() => {
    return Array.from(currentWord);
  }, [currentWord]);

  if (!words.length) return null;

  return (
    <div className="relative inline-flex items-center">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className={`inline-flex items-center overflow-visible whitespace-nowrap ${className ?? ""}`}
          style={style}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          {chars.map((char, i) => (
            <motion.span
              key={`${index}-${i}-${char}`}
              className={`inline-block ${charClassName ?? ""}`}
              initial={{ opacity: 0, y: 5, filter: "blur(5px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -5, filter: "blur(5px)" }}
              transition={{
                delay: i * 0.02,
                duration: 0.28,
                ease: "easeOut"
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default TextMorph;
