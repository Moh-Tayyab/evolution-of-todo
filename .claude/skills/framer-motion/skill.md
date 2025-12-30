# Framer Motion Skill

## Overview
Expertise for Framer Motion, React animation library.

## Usage
Use for creating animations, transitions, gestures, interactive UI.

## Core Concepts
- Motion component: Base for all animations
- AnimatePresence: Handle enter/exit transitions
- Gestures: drag, tap, hover support
- Layout prop: Automatic layout animations

## Examples
```typescript
import { motion } from 'framer-motion'

export function AnimatedButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      Hover me!
    </motion.button>
  )
}
```

## Best Practices
1. Use layout for list animations
2. Check prefers-reduced-motion
3. GPU accelerate with transform/opacity
4. Provide unique keys for lists
5. Test on mobile

## Tools Used
- **Read/Grep Tools:** Examine components, find patterns, read existing implementations
- **Write/Edit Tools:** Create new components, modify existing code
- **Bash:** Run dev servers, build apps, install dependencies
- **Context7 MCP:** Semantic search in React/TypeScript documentation

## Verification Process
After implementing components:
1. **Visual Check:** Start dev server and verify component renders
2. **Type Checking:** Run TypeScript compiler to verify no type errors
3. **Lint Check:** Run ESLint to catch code quality issues
4. **Build Check:** Execute production build to verify bundling works
5. **Browser Test:** Open component in browser and test interactions

## Error Patterns
Common errors to recognize:
- **Import errors:** Component file not found, incorrect import path
- **Type errors:** Invalid prop types, missing interface definitions
- **Runtime errors:** `Cannot read property`, `undefined is not an object`
- **Build errors:** CSS modules not resolved, missing dependencies
- **Hydration errors:** Server/client HTML mismatch in Next.js
