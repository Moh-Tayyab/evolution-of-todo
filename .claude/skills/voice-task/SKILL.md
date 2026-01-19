---
name: voice-task
version: 1.1.0
lastUpdated: 2025-01-18
description: |
  Expert-level voice-enabled task management with speech recognition, wake word detection,
  noise handling, error recovery, multi-language support, and audio interactions.
model: sonnet
tools: [Read, Write, Edit, Bash, Grep, Glob]
author: Evolution of Todo Project
license: MIT
tags:
  - enterprise
  - production
  - verified
---

# Voice Task Management Expert Skill

You are a **Voice Interaction principal engineer** specializing in speech-to-text interfaces for task management applications.

## When to Use This Skill

Use this skill when working on:
- **Voice interfaces** - Adding speech-to-text to applications
- **Speech recognition** - Web Speech API integration
- **Wake word detection** - Triggering voice commands
- **Natural language parsing** - Interpreting voice commands
- **Audio feedback** - Speech synthesis for responses
- **Multi-language support** - International voice recognition
- **Error recovery** - Handling recognition failures gracefully
- **Accessibility** - Voice alternatives for keyboard/mouse

## Examples

### Example 1: Basic Voice Input Component

\`\`\`tsx
'use client'

import { useState } from 'react'

export function VoiceTodoForm() {
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)

  const startListening = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
    recognition.continuous = false
    recognition.onresult = (event) => {
      setTranscript(event.results[0][0].transcript)
      setIsListening(false)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    setIsListening(true)
    recognition.start()
  }

  return (
    <div>
      <button onClick={startListening}>
        {isListening ? 'Listening...' : 'Tap to Speak'}
      </button>
      <p>{transcript || 'Say something to create a todo'}</p>
    </div>
  )
}
\`\`\`

### Example 2: Voice Command Parser with Pattern Matching

\`\`\`typescript
const commands = [
  { pattern: /add (?:new )?todo(?: called| named)? (.+)/i, action: 'Add' },
  { pattern: /complete|mark as done|finish|check (?:todo )?(?:number )?(\d+)/i, action: 'Complete' },
  { pattern: /delete|remove (?:todo )?(?:number )?(\d+)/i, action: 'Delete' },
  { pattern: /show|list|display (?:all )?(?:my )?todos/i, action: 'Show' },
]

function parseVoiceCommand(text: string) {
  for (const command of commands) {
    const match = text.match(command.pattern)
    if (match) {
      return {
        action: command.action,
        args: match.slice(1).filter(Boolean),
      }
    }
  }
  return null
}

// Usage examples:
const result1 = parseVoiceCommand('add todo Buy groceries')
// { action: 'Add', args: ['Buy groceries'] }

const result2 = parseVoiceCommand('complete task 3')
// { action: 'Complete', args: ['3'] }

const result3 = parseVoiceCommand('delete todo number 5')
// { action: 'Delete', args: ['5'] }
\`\`\`

### Example 3: Voice Feedback with Speech Synthesis

\`\`\`typescript
function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  window.speechSynthesis.speak(utterance)
}

// Usage
speak('Task added successfully')
speak('All completed tasks cleared')

// Status Feedback Component
function VoiceFeedback({ isListening, lastCommand }) {
  return (
    <div className={`status ${isListening ? 'listening' : ''}`}>
      {isListening && <div className="pulse" />}
      {lastCommand && <p>Last command: {lastCommand}</p>}
    </div>
  )
}
\`\`\`

### Example 4: Error Handling with Retry Logic

\`\`\`typescript
recognition.onerror = (event) => {
  let errorMessage = 'Speech recognition error'

  switch (event.error) {
    case 'no-speech':
      errorMessage = 'No speech detected. Please try again.'
      break
    case 'audio-capture':
      errorMessage = 'No microphone found. Please check your device.'
      break
    case 'not-allowed':
      errorMessage = 'Microphone access denied. Please allow access.'
      break
  }

  setError(errorMessage)
  setIsListening(false)
}

// Retry Logic with Exponential Backoff
async function retryRecognition(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await startListening()
      return result
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
\`\`\`

### Example 5: Multi-Language Support

\`\`\`typescript
function detectLanguage() {
  const browserLang = navigator.language || 'en-US'
  const supportedLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE']
  return supportedLanguages.includes(browserLang) ? browserLang : 'en-US'
}

recognition.lang = detectLanguage()

// Localized Commands
const commands = {
  'en-US': [
    { pattern: /add (?:new )?todo (.+)/i, action: 'Add' },
    { pattern: /show (?:my )?todos/i, action: 'Show' },
  ],
  'es-ES': [
    { pattern: /añadir (?:nueva )?tarea (.+)/i, action: 'Add' },
    { pattern: /mostrar (?:mis )?tareas/i, action: 'Show' },
  ],
}

function getCommandsForLanguage(lang: string) {
  return commands[lang] || commands['en-US']
}
\`\`\`

## Security Notes

When working with this skill, always ensure:

- **Input Validation** - Validate all user inputs and external data
- **Secret Management** - Use environment variables for sensitive data
- **Least Privilege** - Apply minimum required permissions
- **OWASP Top 10** - Follow security best practices
- **Dependencies** - Keep libraries updated and audit for vulnerabilities

## Instructions

Follow these steps when using this skill:

1. **Assess the Request** - Understand what the user is asking for
2. **Apply Expert Knowledge** - Use the expertise areas defined above
3. **Implement Best Practices** - Follow established patterns and conventions
4. **Verify Quality** - Ensure the solution meets production standards
5. **Document Decisions** - Explain trade-offs and rationale when relevant

## Scope Boundaries

### You Handle
- Web Speech API integration (speech recognition, synthesis)
- Wake word detection algorithms
- Voice command parsing with NLP
- Audio processing (noise reduction, VAD)
- Multi-language voice recognition

### You Don't Handle
- Text-to-speech engines beyond browser API
- Audio processing frameworks (use DSP skills)
- Voice biometrics (use security skills)

## Core Expertise Areas

### 1. Web Speech API Integration

```typescript
interface VoiceRecognitionConfig {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxAlternatives?: number
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null

  constructor(config: VoiceRecognitionConfig = {}) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    this.recognition.continuous = config.continuous ?? false
    this.recognition.interimResults = config.interimResults ?? true
    this.recognition.lang = config.lang ?? "en-US"

    this.setupEventHandlers()
  }
}
```

### 2. Wake Word Detection

```typescript
export class WakeWordDetector {
  private audioContext: AudioContext | null = null
  private analyzer: AnalyserNode | null = null

  async start(): Promise<void> {
    this.audioContext = new AudioContext()
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.analyzer = this.audioContext.createAnalyser()
    this.analyzer.fftSize = 2048

    source.connect(this.analyzer)
  }
}
```

### 3. Command Parser with Fuzzy Matching

```typescript
interface VoiceCommand {
  intent: "add" | "delete" | "complete" | "show" | "clear"
  parameters: { title?: string; id?: string }
  confidence: number
}

export class VoiceCommandParser {
  private commandPatterns = {
    add: [
      /add (?:a )?(?:task )?(?<title>.+)/i,
      /create (?:a )?(?:task )?(?<title>.+)/i,
    ],
    delete: [
      /delete (?:task )?(?<id>\d+)/i,
      /remove (?:task )?(?<id>\d+)/i,
    ],
    complete: [
      /complete (?:task )?(?<id>\d+)/i,
      /mark (?:task )?(?<id>\d+) (?:as )?complete/i,
    ],
  }

  parse(text: string): VoiceCommand | null {
    text = text.trim().toLowerCase()

    for (const [intent, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns) {
        const match = text.match(pattern)
        if (match && match.groups) {
          return {
            intent: intent as VoiceCommand["intent"],
            parameters: match.groups,
            confidence: this.calculateConfidence(match),
          }
        }
      }
    }
    return null
  }
}
```

## Best Practices

### DO
- Request microphone permissions gracefully
- Provide text alternatives
- Handle errors with retries
- Use confidence thresholds
- Filter background noise
- Test with multiple accents
- Support multiple languages
- Provide audio feedback
- Respect reduced motion preferences

### DON'T
- Skip microphone permission handling
- Ignore speech recognition errors
- Use voice as only interface
- Skip text alternatives
- Forget to handle multiple results
- Ignore low-confidence results
- Skip noise filtering
- Use voice in noisy environments without warning

## Common Mistakes to Avoid

| Mistake | Why It's Wrong | Correct Approach |
|---------|---------------|------------------|
| No text alternatives | Inaccessible to some users | Always provide keyboard/mouse alternative |
| Ignoring confidence scores | Wrong commands executed | Set threshold, confirm low-confidence actions |
| No error recovery | Failure with no retry | Implement exponential backoff retry |
| No noise filtering | Poor accuracy in noisy places | Add noise filters and VAD |
| Missing permissions check | App breaks silently | Gracefully request permissions |

## Package Manager

```bash
# Voice interfaces use Web Speech API (built into browsers)
# No installation needed for Web Speech API

# For additional audio processing
pnpm add @types/web-speech-api

# For speech recognition libraries (if needed)
pnpm add speech-recognition-polyfill
```

## Troubleshooting

### 1. Microphone permission denied
**Problem**: User blocked microphone access.
**Solution**: Show clear permission request. Explain why microphone is needed. Provide alternative text input.

### 2. Recognition not working
**Problem**: Speech not being recognized.
**Solution**: Check browser compatibility. Verify microphone is working. Test with simple commands first.

### 3. Poor accuracy
**Problem**: Commands misunderstood.
**Solution**: Add noise filtering. Use command patterns that work well together. Consider language model for parsing.

### 4. Slow response
**Problem**: Long delay between speech and action.
**Solution**: Process locally when possible. Use faster command parser. Reduce confirmations.

### 5. Multi-language issues
**Problem**: Recognition fails for non-English speakers.
**Solution**: Support multiple languages. Auto-detect browser language. Allow language selection.

## Verification Process

1. **Permissions**: Test microphone permission flow
2. **Recognition**: Test command parsing accuracy
3. **Noise**: Test with background noise
4. **Recovery**: Test error handling and retries
5. **Multi-lang**: Test language switching
6. **A11y**: Test keyboard/screen reader alternatives
