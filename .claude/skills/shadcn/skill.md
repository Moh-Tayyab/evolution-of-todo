# shadcn/ui Skill

## Overview
Expertise for shadcn/ui, accessible and customizable React UI components.

## Usage
Use for component integration, customization, and UI development.

## Core Concepts
- Installation: npx shadcn@latest add component
- Customization: Extend via className prop
- Composition: Build complex UI from simple components
- Theming: Use CSS variables for dark mode

## Examples

### Basic Usage
```typescript
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return <Button>Click me!</Button>
}
```

### Custom Styles
```typescript
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CustomButton() {
  return (
    <Button className={cn('px-4 py-2 bg-blue-600 text-white')}>
      Custom Button
    </Button>
  )
}
```

## Best Practices
1. Use cn utility for combining Tailwind classes
2. Respect built-in variants
3. Customize via className, not modification
4. Include ARIA labels for accessibility
5. Use TypeScript for full type safety
6. Support dark mode with CSS variables
7. Use semantic HTML elements
8. Test keyboard navigation
9. Keep components composable
10. Follow shadcn/ui patterns

## Common Pitfalls
- Direct style override (use className)
- Missing variants (use built-in options)
- Forgetting dark mode (CSS variables)
- Not accessible (missing ARIA)
- Ignoring responsiveness (mobile-first)

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
