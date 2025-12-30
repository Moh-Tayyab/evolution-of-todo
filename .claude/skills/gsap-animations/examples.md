# GSAP Animations Examples

## Basic React Component
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const SimpleFade = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".item", {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      duration: 0.8,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div ref={container} className="p-8">
      <h2 className="item text-2xl font-bold mb-4">Fade In Items</h2>
      <ul className="space-y-2">
        <li className="item p-4 bg-blue-100 rounded">First Item</li>
        <li className="item p-4 bg-blue-100 rounded">Second Item</li>
        <li className="item p-4 bg-blue-100 rounded">Third Item</li>
      </ul>
    </div>
  );
};
```

## Scroll-Triggered Parallax
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export const ParallaxSection = () => {
  const container = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useGSAP(() => {
    gsap.to(imageRef.current, {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: container.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }, { scope: container });

  return (
    <div ref={container} className="relative h-screen overflow-hidden">
      <img 
        ref={imageRef}
        src="/path-to-image.jpg" 
        className="absolute inset-0 w-full h-[130%] object-cover"
        alt="Parallax"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">SCROLL DOWN</h1>
      </div>
    </div>
  );
};
```

## Hover Effects with contextSafe
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const HoverButton = () => {
  const container = useRef<HTMLDivElement>(null);
  
  const { contextSafe } = useGSAP({ scope: container });

  const onMouseEnter = contextSafe((e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      duration: 0.3
    });
  });

  const onMouseLeave = contextSafe((e: React.MouseEvent) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      backgroundColor: "#f3f4f6",
      color: "#1f2937",
      duration: 0.3
    });
  });

  return (
    <div ref={container} className="p-20 flex justify-center">
      <button 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="px-6 py-3 bg-gray-100 rounded-full transition-shadow hover:shadow-lg"
      >
        Interactive Button
      </button>
    </div>
  );
};
```

## Complex Timeline Animation
```tsx
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export const IntroSequence = () => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({
      defaults: { ease: "power4.out" }
    });

    tl.from(".line", { 
        y: 100, 
        opacity: 0, 
        skewY: 7, 
        duration: 1.5, 
        stagger: 0.2 
      })
      .from(".cta", { 
        scale: 0, 
        opacity: 0, 
        duration: 1 
      }, "-=0.5")
      .to(".line", { 
        color: "#6366f1", 
        duration: 0.5 
      });
  }, { scope: container });

  return (
    <div ref={container} className="h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div className="overflow-hidden mb-2">
        <h1 className="line text-7xl font-black">WE BUILD</h1>
      </div>
      <div className="overflow-hidden mb-8">
        <h1 className="line text-7xl font-black">THE FUTURE</h1>
      </div>
      <button className="cta px-8 py-4 bg-indigo-500 rounded font-bold uppercase tracking-widest">
        Get Started
      </button>
    </div>
  );
};
```
