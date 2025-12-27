# Acternity UI Skill

## Overview
Expertise for Acternity UI, a modern React component library with glassmorphism and futuristic design.

## Usage
Use for implementing Acternity UI components, custom glass effects, gradients, and animations.

## Core Concepts
- Glassmorphism: Frosted glass effect with blur
- Gradients: Mesh gradients and color transitions
- Animations: Smooth transitions and hover effects
- Dark mode: Built-in dark theme support

## Examples
```tsx
import { Button, Card, GlassPanel } from '@acternity/ui'

export function MyComponent() {
  return (
    <GlassPanel>
      <Card title="Welcome">
        <Button variant="gradient">Get Started</Button>
      </Card>
    </GlassPanel>
  )
}
```

## Best Practices
1. Use consistent spacing and colors
2. Ensure contrast ratios for accessibility
3. Add loading states for async operations
4. Test in both light and dark modes

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
