# Voice Task Examples

## Table of Contents
- [Basic Voice Input](#basic-voice-input)
- [Voice Command Parser](#voice-command-parser)
- [Voice Feedback](#voice-feedback)
- [Error Handling](#error-handling)
- [Multi-Language Support](#multi-language-support)

## Basic Voice Input

### Simple Voice Input Component
```tsx
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
```

## Voice Command Parser

### Command Pattern Matching
```typescript
import { parseVoiceCommand } from './lib/voiceCommands'

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
```

### Usage Example
```typescript
const result = parseVoiceCommand('add todo Buy groceries')
// { action: 'Add', args: ['Buy groceries'] }

const result2 = parseVoiceCommand('complete task 3')
// { action: 'Complete', args: ['3'] }
```

## Voice Feedback

### Audio Confirmation
```typescript
function speak(text: string) {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1.0
  utterance.pitch = 1.0
  window.speechSynthesis.speak(utterance)
}

// Usage
speak('Task added successfully')
speak('All completed tasks cleared')
```

### Status Feedback
```tsx
function VoiceFeedback({ isListening, lastCommand }) {
  return (
    <div className={`status ${isListening ? 'listening' : ''}`}>
      {isListening && <div className="pulse" />}
      {lastCommand && <p>Last command: {lastCommand}</p>}
    </div>
  )
}
```

## Error Handling

### Recognition Error Handler
```typescript
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
```

### Retry Logic
```typescript
async function retryRecognition(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const result = await startListening()
      return result
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}
```

## Multi-Language Support

### Language Detection
```typescript
function detectLanguage() {
  const browserLang = navigator.language || 'en-US'
  const supportedLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE']
  return supportedLanguages.includes(browserLang) ? browserLang : 'en-US'
}

recognition.lang = detectLanguage()
```

### Localized Commands
```typescript
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
```
