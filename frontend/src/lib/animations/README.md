# Animation Utilities System

A comprehensive animation system built with Framer Motion and GSAP for the Next.js Todo application.

## Directory Structure

```
src/lib/animations/
├── variants.ts          # Pre-defined animation variants
├── easings.ts          # Custom easing functions
├── hooks.ts            # Custom animation hooks
├── gsap-provider.tsx   # GSAP context provider
├── index.ts            # Export all utilities
└── README.md           # This file

src/components/animations/
├── fade-in.tsx         # Fade-in components
├── stagger-children.tsx # Stagger animation components
└── page-transition.tsx # Page transition components
```

## Features

### 1. Framer Motion Variants
- `fadeInUp` - Fade in with upward slide
- `staggerContainer` - Container for staggered animations
- `scaleIn` - Scale animation
- `slideIn` - Slide from left
- `pageTransition` - Page transition variants
- `modalTransition` - Modal animation variants
- `buttonHover` - Button hover effects

### 2. Custom Easings
- `bounceEase` - Bouncy spring animation
- `smoothSpring` - Smooth spring physics
- `sharpSpring` - Sharp spring animation
- `backEaseIn/Out` - Back easing functions
- Presets for different animation types

### 3. Animation Hooks
- `useReducedMotion()` - Check user's reduced motion preference
- `useInViewElement()` - Intersection Observer hook
- `useAnimationComplete()` - Track animation completion
- `useGSAPAnimation()` - GSAP animations with cleanup
- `useScrollTrigger()` - Scroll-triggered animations
- `useScrollFadeIn()` - Fade in on scroll
- `useHoverScale()` - Hover scale animation
- `useTypingAnimation()` - Text typing animation

### 4. Components
#### FadeIn Components
- `FadeIn` - Basic fade in component
- `FadeInUp` - Fade in with upward motion
- `FadeInStagger` - Staggered fade in for lists
- `FadeInWithGSAP` - GSAP-based fade in
- `AnimatedContainer` - Container with fade animation

#### Stagger Components
- `StaggerChildren` - Generic stagger container
- `StaggerList` - List with stagger animation
- `StaggerGrid` - Grid with stagger animation
- `StaggerCards` - Card-based stagger layout

#### Page Transitions
- `PageTransition` - Generic page transition
- `PageSlideLeft/Right/Up/Down` - Directional slides
- `PageFade` - Fade transition
- `PageScale` - Scale transition
- `withRouteTransition` - HOC for page transitions

### 5. GSAP Integration
- `GSAPProvider` - Context provider for GSAP
- `useGSAP` - Hook for GSAP utilities
- Automatic cleanup on unmount
- ScrollTrigger integration
- Draggable support

## Usage Examples

### Basic Fade In
```tsx
import { FadeIn } from '@/components/animations/fade-in';

<FadeIn duration={0.8} distance={30}>
  <div>Content to fade in</div>
</FadeIn>
```

### Stagger List
```tsx
import { StaggerList } from '@/components/animations/stagger-children';

<StaggerList
  items={items}
  renderItem={(item) => <div>{item.name}</div>}
  staggerDelay={0.1}
/>
```

### Page Transition
```tsx
import { PageSlideRight } from '@/components/animations/page-transition';

<PageSlideRight>
  <div>Content with slide transition</div>
</PageSlideRight>
```

### Custom Hook
```tsx
import { useScrollFadeIn } from '@/lib/animations/hooks';

const { ref, inView } = useScrollFadeIn({
  duration: 1,
  distance: 50,
});

return <div ref={ref}>{inView && 'Content is visible'}</div>;
```

### GSAP Animation
```tsx
import { useGSAPAnimation } from '@/lib/animations/hooks';

const ref = useGSAPAnimation((gsap) => {
  gsap.to(ref.current, { rotation: 360, duration: 2 });
});

return <div ref={ref} />;
```

## Best Practices

### 1. Reduced Motion
Always respect user's reduced motion preference:
```tsx
import { useReducedMotion } from 'framer-motion';

const prefersReducedMotion = useReducedMotion();

// Use this to disable animations when needed
const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.4 };
```

### 2. Performance
- Use `transform` and `opacity` for animations
- Limit simultaneous animations
- Use `will-change` for complex animations
- Clean up GSAP animations on unmount

### 3. Accessibility
- Provide alternatives for animated content
- Use `prefers-reduced-motion` media query
- Ensure content remains usable without animations

### 4. Stagger Animations
- Keep stagger delays small (0.05-0.2s)
- Consider using `staggerChildren` for lists
- Use different animation types for variety

## Integration

### With Next.js Layout
Wrap your app with GSAP provider in `layout.tsx`:
```tsx
import { GSAPProvider } from '@/lib/animations/gsap-provider';

export default function RootLayout({ children }) {
  return (
    <GSAPProvider>
      {children}
    </GSAPProvider>
  );
}
```

### Custom Variants
You can extend the default variants:
```tsx
import { fadeInUp } from '@/lib/animations/variants';

const customVariants = {
  ...fadeInUp,
  visible: {
    ...fadeInUp.visible,
    transition: { ...fadeInUp.visible.transition, duration: 1 }
  }
};
```

## Troubleshooting

### TypeScript Errors
- Make sure to install all dependencies (`react-intersection-observer`)
- Check that GSAP plugins are registered in the provider

### Animation Not Working
- Verify the component is a Client Component (`"use client"`)
- Check for conflicting CSS
- Ensure reduced motion isn't disabled animations

### GSAP Issues
- Verify GSAP provider is wrapping your app
- Check that plugins are registered
- Use `useGSAP` hook for component-level animations

## Contributing

When adding new animations:
1. Follow the existing pattern for variants/hooks
2. Include TypeScript types
3. Add documentation with `@spec` comments
4. Test with reduced motion enabled
5. Ensure proper cleanup for GSAP animations