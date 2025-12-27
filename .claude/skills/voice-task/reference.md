# Reference

Documentation links and resources for voice task management.

## Table of Contents

- [Speech Recognition](#speech-recognition)
- [Speech Synthesis](#speech-synthesis)
- [Voice Commands](#voice-commands)
- [Privacy](#privacy)

## Speech Recognition

```typescript
'use client'

import { useSpeechRecognition } from './hooks/useSpeechRecognition'

export function VoiceTodoForm() {
  const { isListening, startListening, transcript } = useSpeechRecognition({
    continuous: false,
    onResult: (text) => {
      setTranscript(text)
      console.log('Heard:', text)
    },
  })

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

## Voice Commands

```typescript
import { parseVoiceCommand } from './lib/voiceCommands'

export function getAvailableCommands() {
  return [
    { pattern: /add (?:new )?todo(?: called| named)? (.+)/i, action: 'Add' },
    { pattern: /complete|mark as done|finish|check (?:todo )?(?:number )?(\d+)/i, action: 'Complete' },
    { pattern: /delete|remove (?:todo )?(?:number )?(\d+)/i, action: 'Delete' },
    { pattern: /show|list|display (?:all )?(?:my )?todos/i, action: 'Show' },
  ]
}
```

## Best Practices

1. **Always provide text alternatives** - Voice should enhance, not replace
2. **Request permissions gracefully** - Explain why you need microphone access
3. **Provide clear feedback** - Confirm voice commands were understood
4. **Handle errors gracefully** - Speech recognition fails often
5. **Support multiple languages** - Use browser language detection
6. **Keep commands simple** - Complex phrases are harder to recognize
7. **Test in different environments** - Noise affects recognition accuracy
8. **Consider accessibility** - Voice helps, but isn't for everyone
10. **Privacy considerations** - Process voice data locally when possible
```
