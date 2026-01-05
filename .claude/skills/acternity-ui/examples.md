# Acternity UI Examples

## Table of Contents
- [Button Components](#button-components)
- [Glass Panels](#glass-panels)
- [Cards](#cards)
- [Inputs and Forms](#inputs-and-forms)
- [Animations](#animations)

## Button Components

### Gradient Button
```tsx
import { GradientButton } from '@acternity/ui'

<GradientButton variant="primary">
  Click Me
</GradientButton>

<GradientButton variant="secondary" size="large">
  Large Button
</GradientButton>
```

### Glass Button
```tsx
import { GlassButton } from '@acternity/ui'

<GlassButton>
  Glass Effect
</GlassButton>

<GlassButton variant="outline">
  Outline Style
</GlassButton>
```

## Glass Panels

### Basic Glass Panel
```tsx
import { GlassPanel } from '@acternity/ui'

<GlassPanel>
  <h2>Content Here</h2>
  <p>Some text inside the glass panel</p>
</GlassPanel>
```

### Gradient Background Glass Panel
```tsx
<GlassPanel gradient="purple-blue" intensity="medium">
  <div>
    <h3>Gradient Background</h3>
  </div>
</GlassPanel>
```

## Cards

### Info Card
```tsx
import { InfoCard } from '@acternity/ui'

<InfoCard
  title="Feature One"
  description="Description of the feature"
  icon={<StarIcon />}
/>
```

### Interactive Card
```tsx
<InteractiveCard
  title="Click Me"
  onClick={() => console.log('Clicked')}
  hoverEffect="lift"
>
  <CardContent />
</InteractiveCard>
```

## Inputs and Forms

### Glass Input
```tsx
import { GlassInput } from '@acternity/ui'

<GlassInput
  placeholder="Enter text..."
  label="Username"
  error={error}
/>
```

### Form with Glass Elements
```tsx
<GlassPanel>
  <form onSubmit={handleSubmit}>
    <GlassInput
      name="email"
      label="Email"
      type="email"
      required
    />
    <GradientButton type="submit">
      Submit
    </GradientButton>
  </form>
</GlassPanel>
```

## Animations

### Fade In Animation
```tsx
import { FadeIn } from '@acternity/ui'

<FadeIn duration={500}>
  <div>Content fades in</div>
</FadeIn>
```

### Slide Up Animation
```tsx
<SlideUp>
  <Card title="Animated Card">
    Content
  </Card>
</SlideUp>
```

### Hover Effects
```tsx
<GlassPanel hoverEffect="glow">
  Glows on hover
</GlassPanel>

<GlassPanel hoverEffect="scale">
  Scales on hover
</GlassPanel>
```
