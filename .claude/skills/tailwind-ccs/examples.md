# Tailwind CSS Examples

## Table of Contents
- [Utility Classes](#utility-classes)
- [Components](#components)
- [Responsive Design](#responsive-design)
- [Dark Mode](#dark-mode)

## Utility Classes

### Typography
```html
<h1 class="text-4xl font-bold text-gray-900">Heading 1</h1>
<p class="text-lg text-gray-600">Paragraph text</p>
<span class="text-sm text-gray-500">Small text</span>
```

### Spacing
```html
<div class="p-4 m-2">Padding and margin</div>
<div class="mt-4 mb-8">Vertical margins</div>
<div class="px-6 py-3">Horizontal padding</div>
```

### Colors
```html
<div class="bg-blue-500 text-white">Blue background</div>
<div class="bg-red-600 hover:bg-red-700">Red with hover</div>
<div class="text-green-600">Green text</div>
```

### Flexbox
```html
<div class="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

<div class="flex flex-col items-center gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Components

### Button
```html
<button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
  Click Me
</button>

<button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
  Cancel
</button>
```

### Card
```html
<div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 class="text-xl font-bold mb-2">Card Title</h3>
  <p class="text-gray-600">Card content goes here</p>
</div>
```

### Input
```html
<input
  type="text"
  placeholder="Enter text..."
  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
/>
```

## Responsive Design

### Breakpoints
```html
<!-- Mobile first, scales up -->
<div class="p-4 md:p-8 lg:p-12">
  Responsive padding
</div>

<!-- Hidden on mobile, visible on desktop -->
<div class="hidden md:block">
  Desktop only content
</div>

<!-- Grid responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Dark Mode

### Using Dark Mode
```html
<!-- Light mode by default, applies dark: prefix -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  <h1 class="text-2xl font-bold">Dark Mode Compatible</h1>
</div>

<!-- With dark mode toggle -->
<script>
  function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }
</script>
<button onclick="toggleDarkMode()" class="px-4 py-2 bg-gray-800 text-white">
  Toggle Dark Mode
</button>
```
