import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

// If using plugins, register them once at the top level
// gsap.registerPlugin(ScrollTrigger);

interface Props {
  title?: string;
  children?: React.ReactNode;
}

/**
 * GSAPComponentTemplate
 * A professional boilerplate for GSAP animations in React.
 */
export const GSAPComponentTemplate = ({ title = "Animated Section", children }: Props) => {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Setup Defaults
    const tl = gsap.timeline({
      defaults: { duration: 0.8, ease: "power2.out" }
    });

    // 2. Define Animations
    tl.from(".gsap-reveal", {
      opacity: 0,
      y: 30,
      stagger: 0.1,
    });

    // 3. Example of an animation scoped to the container
    // gsap.to(".gsap-box", { rotation: 360, scrollTrigger: { ... } });

  }, { 
    scope: container,
    dependencies: [] // add deps if animation should re-run on state change
  });

  // Example of an event handler using contextSafe
  const { contextSafe } = useGSAP({ scope: container });
  
  const handleInteraction = contextSafe(() => {
    gsap.to(".gsap-reveal", { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
  });

  return (
    <div ref={container} className="w-full py-12 px-4 flex flex-col items-center">
      <h2 className="gsap-reveal text-3xl font-bold mb-6 text-gray-900" onClick={handleInteraction}>
        {title}
      </h2>
      <div className="gsap-reveal w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
        {children || (
          <p className="text-gray-600">
            This component is powered by GSAP. Edit the useGSAP hook to customize animations.
          </p>
        )}
      </div>
    </div>
  );
};
