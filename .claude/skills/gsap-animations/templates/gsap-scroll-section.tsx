import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * GSAPScrollSection
 * A template for pinned horizontal scroll or vertical parallax sections.
 */
export const GSAPScrollSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Horizontal Scroll Animation
    const panels = gsap.utils.toArray('.panel');
    
    gsap.to(panels, {
      xPercent: -100 * (panels.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: triggerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (panels.length - 1),
        end: () => "+=" + triggerRef.current?.offsetWidth,
      }
    });

    // 2. Individual Item Reveal (Parallax)
    gsap.from(".reveal-text", {
      y: 100,
      opacity: 0,
      stagger: 0.1,
      scrollTrigger: {
        trigger: triggerRef.current,
        start: "top center",
        toggleActions: "play none none reverse"
      }
    });

  }, { scope: triggerRef });

  return (
    <div ref={triggerRef} className="overflow-hidden bg-zinc-950">
      <div ref={sectionRef} className="flex w-[300%] h-screen">
        <section className="panel w-screen h-full flex items-center justify-center p-20">
          <h1 className="reveal-text text-8xl font-black text-white">SECTION ONE</h1>
        </section>
        <section className="panel w-screen h-full flex items-center justify-center p-20 bg-indigo-600">
          <h1 className="text-8xl font-black text-white">SECTION TWO</h1>
        </section>
        <section className="panel w-screen h-full flex items-center justify-center p-20 bg-rose-600">
          <h1 className="text-8xl font-black text-white">SECTION THREE</h1>
        </section>
      </div>
    </div>
  );
};
