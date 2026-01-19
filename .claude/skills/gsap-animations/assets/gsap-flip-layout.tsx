import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

/**
 * GSAPFlipLayout
 * A template for smooth layout transitions using the Flip plugin.
 */
export const GSAPFlipLayout = () => {
  const container = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const { contextSafe } = useGSAP({ scope: container });

  const toggleLayout = contextSafe(() => {
    // 1. Capture current state
    const state = Flip.getState(".box", { props: "borderRadius,backgroundColor" });

    // 2. Apply DOM changes (synchronously via state update)
    setLayout(prev => prev === 'grid' ? 'list' : 'grid');

    // 3. Animate from captured state to new state
    // We use a timeout or useEffect for state-based Flip, but contextSafe works
    // if we trigger Flip.from immediately after the DOM update.
    // In React, it's often safer to use useGSAP with dependencies.
  });

  // Handle the animation when layout state changes
  useGSAP(() => {
    const state = Flip.getState(".box");
    Flip.from(state, {
      duration: 0.6,
      ease: "power3.inOut",
      stagger: 0.05,
      absolute: true,
      onEnter: elements => gsap.fromTo(elements, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1 }),
      onLeave: elements => gsap.to(elements, { opacity: 0, scale: 0 })
    });
  }, { dependencies: [layout], scope: container });

  return (
    <div ref={container} className="p-10">
      <button 
        onClick={toggleLayout}
        className="mb-8 px-6 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
      >
        Toggle {layout === 'grid' ? 'List' : 'Grid'} View
      </button>

      <div className={layout === 'grid' ? "grid grid-cols-3 gap-4" : "flex flex-col gap-2"}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div 
            key={i} 
            className={`box ${layout === 'grid' ? 'h-32' : 'h-16'} bg-indigo-500 rounded-xl flex items-center justify-center text-white font-bold`}
          >
            Item {i}
          </div>
        ))}
      </div>
    </div>
  );
};
