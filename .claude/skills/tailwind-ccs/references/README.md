# Tailwind CSS References

Official documentation and resources for Tailwind CSS, a utility-first CSS framework.

## Official Resources

### Tailwind CSS Documentation
- **Official Website**: https://tailwindcss.com/
- **GitHub**: https://github.com/tailwindlabs/tailwindcss
- **Documentation**: https://tailwindcss.com/docs
- **Components**: https://tailwindui.com/

## Installation

### Using npm
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### CSS Imports
```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Core Concepts

### Utility Classes
```html
<!-- Layout -->
<div class="flex items-center justify-center">
  <div class="p-4 m-2">
    Content
  </div>
</div>
```

### Responsive Design
```html
<!-- Mobile first, then md, lg, xl -->
<div class="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive content
</div>
```

### Hover and Focus States
```html
<button class="bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2">
  Click me
</button>
```

## Common Patterns

### Container
```html
<div class="container mx-auto px-4">
  Centered content with padding
</div>
```

### Flexbox
```html
<!-- Center content -->
<div class="flex items-center justify-center">
  Centered
</div>

<!-- Space between -->
<div class="flex justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Column layout -->
<div class="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Grid
```html
<!-- Simple grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Responsive grid
</div>
```

### Card Component
```html
<div class="bg-white rounded-lg shadow-md p-6">
  <h2 class="text-xl font-bold mb-4">Card Title</h2>
  <p class="text-gray-700">Card content goes here</p>
</div>
```

### Button Component
```html
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click me
</button>

<button class="bg-transparent hover:bg-blue-500 text-blue-700 hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
  Outline
</button>
```

### Form Elements
```html
<!-- Input -->
<input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="text" placeholder="Username">

<!-- Select -->
<select class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

## Typography

### Text Styles
```html
<h1 class="text-4xl font-bold">Heading 1</h1>
<h2 class="text-3xl font-semibold">Heading 2</h2>
<p class="text-base text-gray-700">Body text</p>
<small class="text-sm text-gray-500">Small text</small>
```

### Text Alignment
```html
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
```

### Text Decoration
```html
<p class="underline">Underlined text</p>
<p class="line-through">Strikethrough text</p>
<p class="uppercase">UPPERCASE TEXT</p>
```

## Colors

### Text Colors
```html
<p class="text-gray-900">Dark gray text</p>
<p class="text-blue-600">Blue text</p>
<p class="text-red-500">Red text</p>
```

### Background Colors
```html
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray background</div>
<div class="bg-blue-500">Blue background</div>
```

### Opacity
```html
<div class="bg-blue-500 bg-opacity-50">50% opacity blue</div>
<div class="text-red-500 text-opacity-75">75% opacity red text</div>
```

## Spacing

### Padding
```html
<div class="p-4">Padding: 1rem</div>
<div class="px-4 py-2">Horizontal: 1rem, Vertical: 0.5rem</div>
<div class="pt-4 pr-2 pb-4 pl-2">Individual padding</div>
```

### Margin
```html
<div class="m-4">Margin: 1rem</div>
<div class="mx-auto">Horizontal auto (center)</div>
<div class="-mt-4">Negative margin</div>
```

### Space Between
```html
<div class="flex flex-col space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<div class="flex space-x-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Borders

### Basic Borders
```html
<div class="border">Default border</div>
<div class="border-2">Thicker border</div>
<div class="border-t">Top border only</div>
<div class="border-r border-b border-l">Right, bottom, left borders</div>
```

### Border Radius
```html
<div class="rounded">Rounded corners</div>
<div class="rounded-lg">Large rounded corners</div>
<div class="rounded-full">Fully rounded</div>
<div class="rounded-t-lg">Rounded top only</div>
```

### Border Colors
```html
<div class="border border-gray-300">Gray border</div>
<div class="border border-blue-500">Blue border</div>
```

## Effects

### Shadow
```html
<div class="shadow">Default shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-none">No shadow</div>
```

### Opacity
```html
<div class="opacity-100">Full opacity</div>
<div class="opacity-50">50% opacity</div>
<div class="opacity-25">25% opacity</div>
```

### Transitions
```html
<button class="transition-colors duration-300 ease-in-out hover:bg-blue-700">
  Smooth color transition
</button>
```

## Transforms

### Scale
```html
<div class="scale-100">Normal size</div>
<div class="scale-150">150% size</div>
<div class="hover:scale-110">Scale on hover</div>
```

### Rotation
```html
<div class="rotate-0">Normal</div>
<div class="rotate-45">Rotated 45deg</div>
<div class="rotate-90">Rotated 90deg</div>
```

### Translation
```html
<div class="translate-x-4">Move right 1rem</div>
<div class="-translate-y-2">Move up 0.5rem</div>
```

## Layout

### Display
```html
<div class="block">Block</div>
<div class="inline-block">Inline block</div>
<div class="hidden">Hidden</div>
```

### Position
```html
<div class="relative">Relative</div>
<div class="absolute">Absolute</div>
<div class="fixed">Fixed</div>
<div class="sticky top-0">Sticky</div>
```

### Z-Index
```html
<div class="z-0">z-index: 0</div>
<div class="z-10">z-index: 10</div>
<div class="z-50">z-index: 50</div>
<div class="z-auto">z-index: auto</div>
```

## Responsive Design

### Breakpoints
```html
<!-- Mobile (default) -->
<div class="text-sm">Small text on mobile</div>

<!-- md (768px+) -->
<div class="md:text-base">Base text on tablet+</div>

<!-- lg (1024px+) -->
<div class="lg:text-lg">Large text on desktop+</div>

<!-- xl (1280px+) -->
<div class="xl:text-xl">Extra large text on xl+</div>
```

## Dark Mode

```html
<div class="bg-white dark:bg-gray-900">
  <h1 class="text-gray-900 dark:text-white">Dark mode text</h1>
</div>
```

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  // ...
}
```

## Customization

### Extending Theme
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
      },
      spacing: {
        '128': '32rem',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### Custom Utilities
```css
/* index.css */
@layer utilities {
  .text-shadow {
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}
```

## Best Practices

- Use responsive classes (mobile-first)
- Group related classes
- Use @apply for repeated patterns
- Extract components
- Use PurgeCSS to remove unused styles
- Consider performance with large lists of classes
- Use semantic HTML with utility classes
- Document custom configurations
- Keep configuration minimal
- Use component libraries for consistency

## Resources

- **Tailwind Docs**: https://tailwindcss.com/docs
- **Tailwind UI**: https://tailwindui.com/
- **Heroicons**: https://heroicons.com/
- **Headless UI**: https://headlessui.com/
