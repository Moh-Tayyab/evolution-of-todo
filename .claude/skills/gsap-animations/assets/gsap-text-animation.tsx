import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(TextPlugin);

/**
 * GSAPTextEffect
 * A template for advanced text animations like typing or character reveals.
 */
export const GSAPTextEffect = () => {
  const container = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // 1. Typing effect (requires TextPlugin)
    tl.to(textRef.current, {
      duration: 2,
      text: "the next generation of web animations.",
      ease: "none",
    })
    .to(textRef.current, {
      duration: 1,
      opacity: 0,
      delay: 2
    });

    // 2. Character reveal (Staggered lines)
    gsap.from(".line span", {
      yPercent: 100,
      duration: 1,
      stagger: 0.05,
      ease: "power4.out",
    });

  }, { scope: container });

  return (
    <div ref={container} className="p-20 bg-white">
      <div className="line h-20 overflow-hidden text-5xl font-bold flex">
        {"CREATING".split("").map((char, i) => (
          <span key={i} className="inline-block">{char === " " ? "\u00A0" : char}</span>
        ))}
      </div>
      
      <div className="mt-4 text-xl text-zinc-500 font-mono">
        Discovering <span ref={textRef} className="text-zinc-900 font-bold border-r-2 border-zinc-900 pr-1"></span>
      </div>
    </div>
  );
};
