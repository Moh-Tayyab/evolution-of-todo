# Tasks: Phase III - Modern UI/UX with Animation

**Input**: Design documents from `/specs/003-modern-ui-ux/`
**Prerequisites**: plan.md, spec.md, Phase II completion

**Tests**: Not required for this UI/UX enhancement phase (visual validation only)

**Organization**: Tasks are grouped by implementation phase for systematic enhancement.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Story labels: Not applicable (UI/UX enhancement, not feature-based)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/`

---

## Phase 1: Setup & Dependencies

**Purpose**: Install and configure all animation libraries and premium components

- [X] T001 Install Framer Motion and GSAP with ScrollTrigger in frontend/package.json
- [X] T002 [P] Add @aceternity/3d-card component via shadcn CLI
- [X] T003 [P] Add @aceternity/bento-grid component via shadcn CLI
- [X] T004 [P] Add @aceternity/card-spotlight component via shadcn CLI
- [X] T005 Create magnetic button component manually with Framer Motion (Aceternity component unavailable)
- [X] T006 Create text generate effect manually with Framer Motion (Aceternity component unavailable)
- [X] T007 Update frontend/CLAUDE.md with Framer Motion conventions and patterns
- [X] T008 Update frontend/CLAUDE.md with GSAP ScrollTrigger usage
- [X] T009 Update frontend/CLAUDE.md with Aceternity UI component usage

**Checkpoint**: Dependencies installed, agent context updated

---

## Phase 2: Animation Foundation

**Purpose**: Create the animation library with reusable variants, easing presets, and hooks

- [X] T010 Create frontend/src/lib/animations/index.ts with animation exports
- [X] T011 [P] Create frontend/src/lib/animations/variants.ts with fade, scale, slide variants
- [X] T012 [P] Create frontend/src/lib/animations/easing.ts with spring and custom easings
- [X] T013 [P] Create frontend/src/lib/animations/hooks.ts with useAnimation variants
- [X] T014 Create frontend/src/lib/animations/presets.ts with component-specific animations
- [X] T015 Create frontend/src/lib/animations/reduced-motion.ts with accessibility support
- [X] T016 [P] Create frontend/src/lib/animations/gsap-provider.tsx for GSAP context management
- [X] T017 [P] Create frontend/src/lib/animations/use-gsap.ts hook for React integration

**Checkpoint**: Animation library complete, ready for component integration

---

## Phase 3: Animated Components (Core)

**Purpose**: Wrap shadcn/ui base components with Framer Motion animations

### 3.1 Button Component

- [X] T018 Wrap Button component with motion in frontend/src/components/ui/button.tsx
- [X] T019 Add scale variants for idle, hover, tap, and loading states
- [X] T020 Implement loading spinner with rotation animation
- [X] T021 Add magnetic hover effect for primary action buttons

### 3.2 Input Component

- [X] T022 Wrap Input component with focus animations in frontend/src/components/ui/input.tsx
- [X] T023 Add border highlight animation on focus
- [X] T024 Implement error state shake animation
- [X] T025 Add floating label transition support

### 3.3 Card Component

- [X] T026 Wrap Card component in frontend/src/components/ui/card.tsx
- [X] T027 Add hover lift effect with scale and shadow
- [X] T028 Implement entrance fade-in and slide-up animation
- [X] T029 Add glass morphism variant support

### 3.4 Dialog Component

- [X] T030 Wrap Dialog with AnimatePresence in frontend/src/components/ui/dialog.tsx
- [X] T031 Add scale + fade entrance animation (300ms spring)
- [X] T032 Implement backdrop blur fade animation
- [X] T033 Add exit animation for modal close

### 3.5 Additional Components

- [X] T034 [P] Animate Badge component with scale on mount
- [X] T035 [P] Animate Select dropdown with slide and fade
- [X] T036 [P] Animate Dropdown Menu with stagger animation
- [X] T037 [P] Animate Toast notifications with slide-in

**Checkpoint**: All core components animated and functional

---

## Phase 4: Page Animations

**Purpose**: Implement page transitions, dashboard animations, and scroll effects

### 4.1 Page Transitions

- [X] T038 Create frontend/src/app/template.tsx for page-by-page transitions
- [X] T039 Implement page entrance/exit animations (400ms ease-out)
- [X] T040 Add loading skeleton with pulse animation
- [X] T041 Create route change animation handlers

### 4.2 Dashboard Animations

- [X] T042 Animate task list with staggered entrance (80ms stagger)
- [X] T043 Implement scroll progress indicator in dashboard header
- [X] T044 Add parallax effect to dashboard header section
- [X] T045 Animate filter panel slide-down transition
- [X] T046 Implement task card hover lift effect

### 4.3 GSAP Scroll Animations

- [X] T047 Implement GsapScrollReveal component for section reveal animations
- [X] T048 Implement GsapParallaxHero component for hero section parallax
- [X] T049 Implement GsapTimelineAnimation component for step-by-step animations
- [X] T050 Add scroll-triggered fade-in to dashboard task cards
- [X] T051 Implement horizontal scroll section for dashboard features
- [X] T052 Add pin-and-scrub animation for statistics section

### 4.4 Task Interactions

- [X] T053 Add drag-to-reorder using Reorder.Group in TaskList
- [X] T054 Implement swipe-to-delete gesture support
- [X] T055 Animate checkbox with spring scale and checkmark draw
- [X] T056 Add optimistic UI update animations for task operations
- [X] T057 Implement task completion toggle with color transition

**Checkpoint**: All pages and interactions animated

---

## Phase 5: Aceternity UI Premium Components

**Purpose**: Install and integrate premium animated components

### 5.1 Bento Grid Dashboard

- [X] T058 Create dashboard grid using BentoGrid in frontend/src/components/aceternity/bento-grid.tsx
- [X] T059 Create Analytics card with sparkline chart animation
- [X] T060 Create Quick Add card with floating action button
- [X] T061 Create Tags overview card with animated chip layout
- [X] T062 Create Statistics card with number counter animation

### 5.2 3D Card Effects

- [X] T063 Implement CardContainer with perspective in frontend/src/components/aceternity/3d-card.tsx
- [X] T064 Create PremiumTaskCard with 3D tilt on hover
- [X] T065 Add Feature highlight cards with 3D translateZ effects
- [X] T066 Implement Achievement badges with 3D rotation

### 5.3 Spotlight Effects

- [X] T067 Create CardSpotlight component in frontend/src/components/aceternity/card-spotlight.tsx
- [X] T068 Add spotlight border effect to task cards
- [X] T069 Implement gradient spotlight on hover for feature cards

### 5.4 Animated Backgrounds

- [X] T070 Create animated gradient mesh background for dashboard
- [X] T071 Add spotlight pulse effect to dashboard
- [X] T072 Implement subtle particle animation

**Checkpoint**: Premium components integrated and functional

---

## Phase 6: Micro-interactions & Polish

**Purpose**: Add finishing touches and ensure consistent experience

### 6.1 Button Interactions

- [X] T073 Add ripple effect on primary button click
- [X] T074 Implement icon scale animation on hover
- [X] T075 Add success state animation for form submission

### 6.2 Icon Animations

- [X] T076 Animate Chevron rotation on dropdown expand/collapse
- [X] T077 Add checkmark draw animation for success states
- [X] T078 Implement icon bounce on notification

### 6.3 Loading States

- [X] T079 Create animated loading skeleton with shimmer effect
- [X] T080 Add pulse animation to empty state placeholders
- [X] T081 Implement spinner with rotation for loading states

### 6.4 Empty States

- [X] T082 Create animated empty task list illustration
- [X] T083 Add stagger animation to empty state elements
- [X] T084 Implement call-to-action button animation

**Checkpoint**: Micro-interactions complete, polished experience

---

## Phase 7: Accessibility & Responsive Design

**Purpose**: Ensure animations respect user preferences and work on all devices

### 7.1 Reduced Motion

- [X] T085 Implement useReducedMotion hook in all animated components
- [X] T086 Create fallback static styles for prefers-reduced-motion
- [X] T087 Add reduced motion toggle in user preferences

### 7.2 Keyboard Navigation

- [X] T088 Ensure focus states are clearly visible on all interactive elements
- [X] T089 Add focus ring animation with scale and color
- [X] T090 Implement keyboard navigation for animated dropdowns

### 7.3 Responsive Animations

- [X] T091 Adjust animation durations for mobile (faster)
- [X] T092 Simplify complex animations on touch devices
- [X] T093 Disable drag gestures on touch where appropriate

**Checkpoint**: Accessibility requirements met, responsive animations complete

---

## Phase 8: Performance Optimization

**Purpose**: Ensure smooth 60fps animations and optimal bundle size

### 8.1 Animation Performance

- [X] T094 Verify all animations use transform and opacity only
- [X] T095 Add will-change hints for complex animations
- [X] T096 Optimize layout animations with layout prop
- [X] T097 Reduce simultaneous animations to max 3-5 elements

### 8.2 Bundle Optimization

- [X] T098 Implement code splitting for heavy Aceternity components
- [X] T099 Lazy load animated card components
- [X] T100 Tree-shake unused Framer Motion exports
- [X] T101 Verify bundle size impact (<500KB additional)

### 8.3 Testing

- [X] T102 Run Lighthouse performance audit (LCP < 2.5s)
- [X] T103 Verify 60fps animation frame rate
- [X] T104 Test on low-end mobile device
- [X] T105 Run accessibility audit (Axe/Pa11y)

**Checkpoint**: Performance targets met, ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Animation Foundation
    ↓
Phase 3: Animated Components (can parallelize within phase)
    ↓
Phase 4: Page Animations (depends on Phase 3)
    ↓
Phase 5: Premium Components (can run parallel with Phase 4)
    ↓
Phase 6: Micro-interactions (depends on Phases 3, 4, 5)
    ↓
Phase 7: Accessibility
    ↓
Phase 8: Performance & Testing
```

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T002 | T003 | T004 | T005 | T006 (Aceternity UI components)
```

**Phase 2 (Animation Foundation)**:
```
T011 | T012 | T013 | T016 | T017 (variants, easing, hooks, GSAP)
```

**Phase 3 (Animated Components)**:
```
Button (T018-T021) | Input (T022-T025) | Card (T026-T029)
Dialog (T030-T033) | Badge (T034) | Select (T035)
Dropdown (T036) | Toast (T037)
```

**Phase 5 (Premium Components)**:
```
Bento Grid (T058-T062) | 3D Cards (T063-T066)
Spotlight (T067-T069) | Backgrounds (T070-T072)
```

**Phase 6 (Micro-interactions)**:
```
Buttons (T073-T075) | Icons (T076-T078)
Loading (T079-T081) | Empty States (T082-T084)
```

---

## Implementation Strategy

### MVP First (Essential Animations)

1. Complete Phase 1: Setup
2. Complete Phase 2: Animation Foundation
3. Complete Phase 3: Button, Input, Card, Dialog (core components)
4. **STOP**: Validate core animated components work correctly
5. Deploy MVP with basic animations

### Incremental Delivery

1. MVP (Phases 1-3) → Basic animated UI components
2. +Phase 4 → Page transitions and task interactions
3. +Phase 5 → Premium Aceternity components
4. +Phase 6 → Micro-interactions and polish
5. +Phase 7 → Accessibility compliance
6. +Phase 8 → Performance optimization and testing

---

## Task Summary

| Phase | Task Count | Focus |
|-------|------------|-------|
| Phase 1: Setup | 9 | Dependencies & CLI commands |
| Phase 2: Animation Foundation | 8 | Animation library & GSAP |
| Phase 3: Core Components | 20 | Button, Input, Card, Dialog, etc. |
| Phase 4: Page Animations | 20 | Transitions, dashboard, GSAP scroll, interactions |
| Phase 5: Premium Components | 15 | Aceternity UI components |
| Phase 6: Micro-interactions | 12 | Button effects, icons, loading, empty states |
| Phase 7: Accessibility | 9 | Reduced motion, keyboard, responsive |
| Phase 8: Performance | 12 | Optimization & testing |
| **Total** | **105** | |

---

## Notes

- **[P] tasks**: Can run in parallel (different files, no dependencies)
- All component paths follow the structure defined in plan.md
- Animation durations should match the specifications in spec.md
- Test accessibility using axe-core after each phase
- Consider visual regression testing with Percy for key pages
