# GSAP Animations References

Official documentation and resources for GreenSock Animation Platform (GSAP) with React integration.

## Official Resources

- **GSAP Official Website**: https://greensock.com/gsap/
- **Documentation**: https://greensock.com/docs/
- **GitHub Repository**: https://github.com/greensock/GSAP
- **Community Forums**: https://greensock.com/forums/

## Installation

### npm/yarn/pnpm
```bash
npm install gsap
# or
yarn add gsap
# or
pnpm add gsap
```

### CDN
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
```

## Core Documentation

### Getting Started
- **Quick Start**: https://greensock.com/get-started/
- **Installation Guide**: https://greensock.com/docs/v3/Installation
- **CDN Options**: https://greensock.com/cdn/

### Core API
- **gsap.to()**: https://greensock.com/docs/v3/GSAP/gsap.to()
- **gsap.from()**: https://greensock.com/docs/v3/GSAP/gsap.from()
- **gsap.fromTo()**: https://greensock.com/docs/v3/GSAP/gsap.fromTo()
- **gsap.set()**: https://greensock.com/docs/v3/GSAP/gsap.set()
- **gsap.timeline()**: https://greensock.com/docs/v3/GSAP/gsap.timeline()

### Easing Functions
- **Ease Visualizer**: https://greensock.com/ease-visualizer
- **Easing Reference**: https://greensock.com/docs/v3/Eases
- **Custom Eases**: https://greensock.com/docs/v3/Eases/CustomEase

## Plugins

### ScrollTrigger
- **Documentation**: https://greensock.com/docs/v3/Plugins/ScrollTrigger
- **Examples**: https://greensock.com/scrolltrigger/
- **Configuration**: https://greensock.com/docs/v3/Plugins/ScrollTrigger/static

### Flip Plugin
- **Documentation**: https://greensock.com/docs/v3/Plugins/Flip
- **Examples**: https://greensock.com/flip/
- **State Transitions**: https://greensock.com/flip-examples/

### Draggable Plugin
- **Documentation**: https://greensock.com/docs/v3/Plugins/Draggable
- **Examples**: https://greensock.com/draggable/
- **Type Definitions**: https://greensock.com/docs/v3/Plugins/Draggable/create()

### MorphSVG Plugin
- **Documentation**: https://greensock.com/docs/v3/Plugins/MorphSVGPlugin
- **Examples**: https://greensock.com/morphsvg/

### Other Plugins
- **DrawSVG**: https://greensock.com/docs/v3/Plugins/DrawSVGPlugin
- **TextPlugin**: https://greensock.com/docs/v3/Plugins/TextPlugin
- **SplitText**: https://greensock.com/docs/v3/Plugins/SplitText

## React Integration

### Official React Resources
- **GSAP with React**: https://greensock.com/react/
- **useGSAP Hook**: https://greensock.com/docs/v3/PluginUseGSAP/
- **React Examples**: https://greensock.com/react-example/

### React Patterns
```typescript
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function MyComponent() {
  useGSAP(() => {
    gsap.to('.box', { rotation: 360, duration: 2 });
  });

  return <div className="box">Rotate me</div>;
}
```

### Context Safety
```typescript
import { useContext, useContextSafety } from '@gsap/react';
import gsap from 'gsap';

function HoverEffect() {
  const ctx = useContextSafety(gsap.context());

  const handleMouseEnter = () => {
    ctx.current && gsap.to(box, { scale: 1.2 });
  };

  return <div ref={box} onMouseEnter={handleMouseEnter}>Hover</div>;
}
```

## TypeScript Support

### Type Definitions
```bash
npm install @types/gsap
```

### Common Types
```typescript
import gsap from 'gsap';
import type { GSAPTimeline, TweenVars } from 'gsap';

// Timeline with typing
const tl: GSAPTimeline = gsap.timeline();

// Animation vars with typing
const vars: TweenVars = {
  x: 100,
  rotation: 90,
  duration: 1,
  ease: 'power2.out'
};

gsap.to('.element', vars);
```

## Performance Optimization

### Best Practices
- **Use transforms** (x, y, scale, rotation) instead of position properties
- **Will-change**: Apply sparingly to animated elements
- **Batch animations**: Group multiple tweens together
- **Avoid layout thrashing**: Read then write, not interleaved
- **GPU acceleration**: Use transform and opacity

### Performance Tips
```typescript
// Good - GPU accelerated
gsap.to(element, { x: 100, opacity: 0 });

// Avoid - causes reflow
gsap.to(element, { width: '100%', height: '100%' });

// Batch for better performance
gsap.to(['.box1', '.box2', '.box3'], {
  x: 100,
  stagger: 0.1
});
```

## Learning Resources

### Tutorials
- **GSAP 3 Express**: https://greensock.com/gsap-3-express/
- **Cheat Sheet**: https://greensock.com/cheatsheet/
- **Video Tutorials**: https://greensock.com/videos/
- **Interactive Challenges**: https://greensock.com/challenges/

### Examples by Category
- **Hover Effects**: https://greensock.com/hover-effects/
- **Page Transitions**: https://greensock.com/page-transitions/
- **Scroll Effects**: https://greensock.com/scroll-effects/
- **Text Effects**: https://greensock.com/text-effects/
- **SVG Animation**: https://greensock.com/svg-animation/

## Troubleshooting

### Common Issues

**Issue: ScrollTrigger not working**
- Ensure `ScrollTrigger` is registered: `gsap.registerPlugin(ScrollTrigger)`
- Check if element has height
- Verify `scrub` and `trigger` configuration

**Issue: React 18 Strict Mode double-invocation**
- Use `useGSAP` hook with cleanup
- Store context for cleanup
- Return cleanup function from `useEffect`

**Issue: Animations not starting**
- Check if elements exist when animation runs
- Use `useLayoutEffect` for synchronous animations
- Verify selector matches actual elements

**Issue: Performance problems**
- Reduce number of simultaneous animations
- Use `will-change` CSS property sparingly
- Optimize ScrollTrigger markers in production

## Plugin Pricing

### Club GreenSock
- **Shockingly Green**: Plugins + bonus tools (yearly)
- **Fantastic Green**: All plugins + future updates (yearly)
- **Business Green**: Commercial license + everything
- **Free Forever**: Core GSAP is always free

See: https://greensock.com/club/

## Community & Support

- **Forums**: https://greensock.com/forums/
- **CodePen**: https://codepen.io/GreenSock/
- **Twitter/X**: @greensock
- **YouTube**: https://www.youtube.com/c/GreenSockLearning

## CodeSandbox & Templates

### Starter Templates
- **React + GSAP**: https://codesandbox.io/s/gsap-react-starter
- **Next.js + GSAP**: https://codesandbox.io/s/gsap-nextjs-starter
- **Vite + GSAP**: https://codesandbox.io/s/gsap-vite-starter

### Examples Collection
- **CodePen Collection**: https://codepen.io/collection/Xqrpag
- **StackBlitz Examples**: https://stackblitz.com/@gsap

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (including mobile)
- **Mobile Browsers**: Full support with touch events

### Polyfills
GSAP works without polyfills in all modern browsers. For IE11 support:
- Include `requestAnimationFrame` polyfill
- Use ES5 build: `gsap/dist/gsap.min.js`

## Accessibility

### Reduced Motion
```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  gsap.to(element, { x: 100 });
}
```

### ARIA Updates
```typescript
// Update ARIA during animation
gsap.to(element, {
  opacity: 0,
  onComplete: () => {
    element.setAttribute('aria-hidden', 'true');
  }
});
```

## Debugging Tools

### GSAP DevTools
- **DevTools Plugin**: https://greensock.com/docs/v3/Plugins/GSDevTools
- **Features**: Pause, resume, scrub, speed control
- **Installation**: Available to Club GreenSock members

### Console Debugging
```typescript
// Enable debug mode
gsap.registerPlugin({ name: 'debug', init: () => {} });

// Log tween values
gsap.to(element, {
  x: 100,
  onUpdate: () => console.log('Progress:', this.progress())
});
```

## Migration Guides

### GSAP 2 to 3
- **Migration Guide**: https://greensock.com/3-to-2-migration/
- **Breaking Changes**: https://greensock.com/3-breaking-changes/
- **Why Upgrade**: https://greensock.com/3-improvements/
