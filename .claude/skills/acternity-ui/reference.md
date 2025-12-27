# Acternity UI Reference

Documentation links and resources for Acternity UI components.

## Table of Contents
- [Installation](#installation)
- [Component API](#component-api)
- [Theme Customization](#theme-customization)
- [Utilities](#utilities)

## Installation

```bash
npm install @acternity-ui
# or
pnpm add @acternity-ui
# or
yarn add @acternity-ui
```

## Component API

### Button Props
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  children: ReactNode
  onClick?: () => void
}
```

### GlassPanel Props
```typescript
interface GlassPanelProps {
  gradient?: 'purple-blue' | 'orange-red' | 'green-blue'
  intensity?: 'light' | 'medium' | 'strong'
  rounded?: boolean
  children: ReactNode
  hoverEffect?: 'glow' | 'scale' | 'none'
}
```

### Card Props
```typescript
interface CardProps {
  title?: string
  description?: string
  icon?: ReactNode
  children?: ReactNode
  onClick?: () => void
}
```

## Theme Customization

### CSS Variables
```css
:root {
  --glass-blur: 12px;
  --glass-opacity: 0.1;
  --glass-border: 1px solid rgba(255, 255, 255, 0.2);
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}
```

### Tailwind Configuration
```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.3)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
}
```

## Utilities

### Gradient Classes
```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500" />
<div className="bg-gradient-to-br from-blue-400 to-emerald-400" />
```

### Glass Effect Classes
```tsx
<div className="backdrop-blur-md bg-white/10 border border-white/20" />
<div className="backdrop-blur-lg bg-black/30" />
```

### Animation Classes
```tsx
<div className="animate-fade-in" />
<div className="animate-slide-up" />
<div className="transition-all duration-300 hover:scale-105" />
```
