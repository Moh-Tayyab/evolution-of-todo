# Implementation Plan: Phase III - Modern UI/UX with Animation

**Branch**: `003-modern-ui-ux` | **Date**: 2025-12-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-modern-ui-ux/spec.md`

## Summary

Transform the todo application dashboard with professional-grade animations using Framer Motion for component interactions and GSAP ScrollTrigger for scroll-driven effects. The implementation enhances Phase II's functional dashboard with visual polish while maintaining full functional parity. Core components (Button, Input, Card, Dialog) receive animation variants, task list gains stagger/reorder animations, and Aceternity UI premium components add 3D effects and spotlight borders.

## Technical Context

**Language/Version**: TypeScript 5.x, Next.js 16+, React 19
**Primary Dependencies**: Framer Motion ^11.x, GSAP ^3.12.x (ScrollTrigger), shadcn/ui (latest), @aceternity/ui (latest)
**Storage**: N/A (frontend-only UI enhancement)
**Testing**: Jest + React Testing Library (visual validation)
**Target Platform**: Web (desktop 1024px+, mobile 320px+)
**Project Type**: Single web application (Next.js frontend)
**Performance Goals**: 60fps animation frame rate, LCP < 2.5s, bundle <500KB additional
**Constraints**: Respect prefers-reduced-motion, use transform/opacity only, max 3-5 simultaneous animations
**Scale/Scope**: Existing Phase II dashboard with ~100 tasks max, single user view

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | All code generated from spec.md, tasks.md |
| II. AI-Native Architecture | ✅ PASS | Agent context updated via scripts |
| III. Progressive Evolution | ✅ PASS | Phase II complete, Phase III enhancement |
| IV. Cloud-Native Focus | N/A | UI enhancement, no backend changes |
| V. Reusability & Intelligence | ✅ PASS | Animation variants reusable across components |
| VI. Security & User Isolation | ✅ PASS | No auth changes, visual only |
| VII. Automated Compliance | ✅ PASS | @spec comments in all generated files |

**GATE RESULT**: ✅ PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/003-modern-ui-ux/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (if needed)
├── spec.md              # Feature specification
├── tasks.md             # Implementation tasks
└── CLAUDE.md            # Updated with animation patterns
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components (upgraded)
│   │   │   ├── button.tsx         # Animated with Framer Motion
│   │   │   ├── input.tsx          # Focus/shake animations
│   │   │   ├── card.tsx           # Hover lift + entrance
│   │   │   └── dialog.tsx         # Scale + fade
│   │   ├── aceternity/            # Aceternity UI components
│   │   │   ├── bento-grid.tsx     # Dashboard statistics
│   │   │   ├── 3d-card.tsx        # Premium task cards
│   │   │   ├── card-spotlight.tsx # Spotlight borders
│   │   │   └── magnetic-button.tsx
│   │   └── animated/              # Custom animated wrappers
│   │       └── variants.ts        # Reusable animation variants
│   ├── lib/
│   │   ├── animations/            # Animation library
│   │   │   ├── index.ts
│   │   │   ├── variants.ts        # Fade, scale, slide variants
│   │   │   ├── easing.ts          # Spring/custom easings
│   │   │   ├── gsap-provider.tsx  # GSAP context
│   │   │   └── hooks.ts           # useAnimation variants
│   │   └── utils.ts
│   └── app/
│       └── dashboard/
│           └── page.tsx           # Updated with page transitions
└── tests/
    └── components/                # Visual regression tests
```

**Structure Decision**: Web application with Next.js frontend only. Animation enhancements layer on existing Phase II structure. Aceternity UI components added to `components/aceternity/`, animation library in `lib/animations/`, upgraded shadcn/ui components in `components/ui/`.

## Architecture Decisions

### ADR-001: Animation Library Selection

**Decision**: Framer Motion + GSAP (dual animation library)

**Rationale**:
- **Framer Motion**: Primary animation library for component-level interactions
  - Declarative API aligns with React patterns
  - Excellent TypeScript support
  - Gesture handling (drag, hover, tap) built-in
  - Layout animations with `layout` prop for smooth reordering
  - AnimatePresence for exit animations

- **GSAP ScrollTrigger**: Advanced scroll animations
  - Pinning and scrubbing for scroll-driven effects
  - Timeline-based sequencing for complex flows
  - Superior performance for parallax/reveal effects
  - Industry standard for scroll animations

**Alternatives Considered**:
- React Spring: More complex API, steeper learning curve
- CSS Modules: No JavaScript control, limited interactivity
- Single library approach: Would require trade-offs in capability

**Trade-offs**:
- +110KB combined bundle size (acceptable for feature set)
- Clear separation: Framer for interactions, GSAP for scroll

### ADR-002: Component Architecture

**Decision**: Mix of shadcn/ui base + Aceternity UI premium + custom wrapped

**Rationale**:
- shadcn/ui: Copy-paste model, full customization, Radix UI foundations
- Aceternity UI: Premium effects, copy-paste model, 3D/perspective effects
- Custom wrappers: Framer Motion integration, consistent animation variants

### ADR-003: Animation Strategy

**Decision**: Variants-based animation system with accessibility support

**Implementation**:
```typescript
// lib/animations/variants.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Accessibility: Respect reduced motion
export const useAnimationVariant = (variant) => {
  const shouldReduceMotion = useReducedMotion();
  return shouldReduceMotion ? { duration: 0 } : variant;
};
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dual animation libraries | GSAP ScrollTrigger superior for scroll-driven effects | Framer Motion's useScroll insufficient for pinning/scrubbing |
| Aceternity UI copy-paste | Premium 3D effects not available elsewhere | Standard CSS can't achieve perspective/3D tilt effects |

## Phase 0: Research & Discovery

**Status**: ✅ COMPLETE - Specifications already include detailed code examples

### Research Findings (from spec.md)

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Framer Motion variants | Declarative variants pattern | Reusable, composable, TypeScript-friendly |
| GSAP integration | gsap.context() for React | Proper cleanup, React 18/19 compatible |
| Reduced motion | useReducedMotion hook | System preference only (per clarifications) |
| Loading states | Skeleton + Spinner | Per clarifications |
| Empty states | Animated illustration + CTA | Per clarifications |
| Error states | Shake + inline message | Per clarifications |

## Phase 1: Data Model & Contracts

**Status**: ✅ NOT APPLICABLE - This is a frontend UI enhancement, no data model changes

The Phase III enhancement adds visual layer only:
- No new entities
- No API changes
- No schema modifications
- All Phase II functionality preserved

## Phase 2: Implementation Plan

### Task Groups

1. **Setup** (Day 1)
   - Install Framer Motion, GSAP, Aceternity UI dependencies
   - Update CLAUDE.md with animation patterns

2. **Animation Foundation** (Day 2)
   - Create animation library (variants, easings, hooks)
   - Create GSAP provider and use-gsap hook

3. **Core Components** (Days 3-5)
   - Button with scale/magnetic variants
   - Input with focus/shake/error animations
   - Card with hover lift + entrance
   - Dialog with scale/fade/blur

4. **Aceternity Components** (Days 6-7)
   - Bento grid for statistics
   - 3D cards for premium tasks
   - Spotlight borders for feature cards

5. **Dashboard Animations** (Days 8-9)
   - Task list stagger entrance
   - Drag-to-reorder with Reorder.Group
   - Page transitions with template.tsx

6. **Polish & Accessibility** (Day 10)
   - Loading skeletons
   - Empty state animation
   - Reduced motion support
   - Performance optimization

### Estimated Effort: 10 days

## Quickstart

```bash
# Install dependencies
cd frontend
npm install framer-motion gsap @gsap/react
npx shadcn@latest add @aceternity/3d-card
npx shadcn@latest add @aceternity/bento-grid
npx shadcn@latest add @aceternity/card-spotlight

# Run development server
npm run dev
```

## Agent Context Update

Run the following to update agent context:

```bash
.claude/scripts/update-frontend-context.sh
```

This adds animation library patterns and Aceternity UI usage to frontend/CLAUDE.md.

---

*Plan generated by /sp.plan command. See [tasks.md](tasks.md) for implementation breakdown.*
