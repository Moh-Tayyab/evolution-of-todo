# Tailwind CSS Skill

## Overview
Expertise for Tailwind CSS, utility-first CSS framework.

## Usage
Use for styling, responsive design, and theming.

## Core Concepts
- Utility classes: Compose predefined classes
- Responsive breakpoints: sm, md, lg, xl, 2xl
- Dark mode: Use dark: prefix for theme switching
- Custom values: Use brackets like w-[200px]

## Examples

### Flexbox
```html
<div class="flex items-center justify-between">
  <h1>Title</h1>
  <button>Button</button>
</div>
```

### Grid
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</div>
```

### Dark Mode
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h2>Title</h2>
  <p>Content</p>
</div>
```

## Best Practices
1. Mobile-first: Design for mobile, add md: and lg: breakpoints
2. Consistent spacing: Use 4px grid system
3. Dark mode first: Design with dark mode, add light mode classes
4. Arbitrary values: Use brackets for custom values
5. Avoid inline styles: Use Tailwind classes when possible
6. Use @apply: For repetitive patterns in CSS files
7. Respect reduced motion: Check prefers-reduced-motion
8. Contrast ratios: Ensure WCAG AA compliance
9. Semantic HTML: Use proper elements with Tailwind classes
10. JIT optimization: Let Tailwind remove unused classes

## Common Pitfalls
- Magic numbers (use spacing scale or arbitrary values)
- Over-specifying (conflicting sizes)
- Missing dark mode (always include dark: variants)
- Hardcoded values (use CSS variables instead)
- Ignoring accessibility (missing ARIA labels)

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
