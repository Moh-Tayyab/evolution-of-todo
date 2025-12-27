# Constitution Reader Examples

## Table of Contents
- [Reading Constitution](#reading-constitution)
- [Checking Principles](#checking-principles)
- [Validating Tech Stack](#validating-tech-stack)
- [Applying Layer Rules](#applying-layer-rules)
- [Quality Verification](#quality-verification)

## Reading Constitution

### Load Constitution
```typescript
import { readConstitution } from './lib/constitution'

const constitution = readConstitution('.specify/memory/constitution.md')
console.log('Principles loaded:', constitution.principles)
```

### Access Specific Section
```typescript
const techStack = constitution.getSection('Strict Technical Stack')
console.log('Allowed frameworks:', techStack.frameworks)
```

## Checking Principles

### Validate Against Principles
```typescript
import { validateAgainstConstitution } from './lib/constitution'

const result = validateAgainstConstitution({
  techStack: ['Next.js', 'React', 'TypeScript'],
  codePattern: 'App Router with Server Components',
})

if (!result.isValid) {
  console.error('Violations:', result.violations)
}
```

### Check Tech Stack Compliance
```typescript
function checkTechStack(stack: string[]) {
  const allowedFrameworks = constitution.techStack.frameworks
  const violations = stack.filter(fw => !allowedFrameworks.includes(fw))

  if (violations.length > 0) {
    throw new Error(`Unauthorized frameworks: ${violations.join(', ')}`)
  }

  return true
}
```

## Validating Tech Stack

### TypeScript Version Check
```typescript
const constitution = readConstitution()
const requiredVersion = constitution.techStack.typescriptVersion

if (!checkTypeScriptVersion(requiredVersion)) {
  console.error(`TypeScript ${requiredVersion}+ required`)
  process.exit(1)
}
```

### Python Version Check
```typescript
const pythonRequirement = constitution.techStack.pythonVersion

if (pythonRequirement) {
  const currentVersion = await getPythonVersion()
  if (!semver.satisfies(currentVersion, pythonRequirement)) {
    throw new Error(`Python ${pythonRequirement} required, got ${currentVersion}`)
  }
}
```

## Applying Layer Rules

### Determine Current Layer
```typescript
function determineLayer(agentTask: string): Layer {
  const constitution = readConstitution()
  const layers = constitution.layers

  if (agentTask.includes('spec') || agentTask.includes('plan')) {
    return layers['L4: Spec-Driven']
  } else if (agentTask.includes('template') || agentTask.includes('agent')) {
    return layers['L3: Intelligence']
  } else if (agentTask.includes('explain')) {
    return layers['L2: Collaboration']
  } else {
    return layers['L1: Manual']
  }
}
```

### Apply Layer Constraints
```typescript
const layer = determineLayer(currentTask)

if (layer.name === 'L1: Manual') {
  // AI should not generate code, only explain
  if (isGeneratingCode()) {
    throw new Error('L1: Manual layer requires human code creation')
  }
} else if (layer.name === 'L4: Spec-Driven') {
  // Can generate full implementations from specs
  await generateFromSpec(spec)
}
```

## Quality Verification

### Check Code Quality Standards
```typescript
import { verifyCodeQuality } from './lib/constitution'

const qualityCheck = verifyCodeQuality({
  code: generatedCode,
  requirements: constitution.quality.standards,
})

if (!qualityCheck.passes) {
  console.error('Quality issues:', qualityCheck.issues)
  return false
}
```

### Verify Testing Requirements
```typescript
function verifyTestCoverage(files: string[]) {
  const testPolicy = constitution.quality.testing

  for (const file of files) {
    if (!hasTestFile(file) && testPolicy.requireTests) {
      console.warn(`Missing test for: ${file}`)
    }
  }
}
```

### Check Error Handling
```typescript
const errorHandlingRule = constitution.quality.errorHandling

function validateErrorHandling(code: string) {
  if (!code.includes('try') && !code.includes('async/await')) {
    if (errorHandlingRule.requireTryCatch) {
      console.warn('Missing error handling')
    }
  }
}
```
