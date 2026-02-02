// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Animation components barrel export

// Scroll-based animations (GSAP)
export {
  ScrollReveal,
  StaggerChildren,
  FadeIn,
  ScaleReveal,
  ParallaxScroll,
} from './scroll-reveal';

// Page transitions (Framer Motion)
export {
  PageTransition,
  StaggeredPageTransition,
  LayoutTransition,
  AnimatePresenceWrapper,
  RouteTransition,
  ListTransition,
  usePageTransition,
  // Variants
  fadeInVariants,
  slideUpVariants,
  slideDownVariants,
  scaleVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from './page-transition';

// Reduced motion provider
export {
  ReducedMotionProvider,
  ReducedMotionToggle,
  ReducedMotionWrapper,
  useReducedMotionContext,
  usePrefersReducedMotion,
  useAnimationValue,
  useAnimationClass,
} from './reduced-motion-provider';

// Loading states
export {
  LoadingSpinner,
  PulseLoader,
  Skeleton,
  SkeletonList,
  BarLoader,
  WaveLoader,
  DotsLoader,
  SpinnerWithText,
  FullPageLoader,
  InlineLoader,
  CardSkeleton,
} from './loading-states';
