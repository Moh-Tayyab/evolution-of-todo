# Voice Task References

Documentation and resources for voice-enabled task management with speech recognition and synthesis.

## Official Resources

### Web Speech API
- **MDN Documentation**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **SpeechRecognition**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- **SpeechSynthesis**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis

## Speech Recognition

### Basic Recognition
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;

recognition.onstart = () => {
  console.log('Speech recognition started');
};

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log('Transcript:', transcript);
};

recognition.onerror = (event) => {
  console.error('Speech recognition error:', event.error);
};

recognition.onend = () => {
  console.log('Speech recognition ended');
};

// Start recognition
recognition.start();
```

### Continuous Recognition
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

recognition.continuous = true;
recognition.interimResults = true;

let finalTranscript = '';

recognition.onresult = (event) => {
  let interimTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;

    if (event.results[i].isFinal) {
      finalTranscript += transcript + ' ';
    } else {
      interimTranscript += transcript;
    }
  }

  console.log('Final:', finalTranscript);
  console.log('Interim:', interimTranscript);
};
```

## Speech Synthesis

### Basic Synthesis
```javascript
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

speak('Hello, world!');
```

### Voice Selection
```javascript
function getVoices() {
  return window.speechSynthesis.getVoices();
}

function speakWithVoice(text, lang = 'en-US') {
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = getVoices();

  const voice = voices.find(v => v.lang.startsWith(lang));
  if (voice) {
    utterance.voice = voice;
  }

  window.speechSynthesis.speak(utterance);
}
```

### Custom Speech
```javascript
function speakCustom(text, options = {}) {
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = options.rate || 1;        // 0.1 to 10
  utterance.pitch = options.pitch || 1;      // 0 to 2
  utterance.volume = options.volume || 1;    // 0 to 1
  utterance.lang = options.lang || 'en-US';

  if (options.voice) {
    utterance.voice = options.voice;
  }

  utterance.onstart = () => console.log('Speaking started');
  utterance.onend = () => console.log('Speaking ended');
  utterance.onerror = (e) => console.error('Speech error:', e);

  window.speechSynthesis.speak(utterance);
}
```

## Voice Commands

### Command Parser
```javascript
const commands = [
  { pattern: /add (?:new )?todo(?: called| named)? (.+)/i, action: 'add' },
  { pattern: /complete|mark as done|finish (?:todo )?(?:number )?(\d+)/i, action: 'complete' },
  { pattern: /delete|remove (?:todo )?(?:number )?(\d+)/i, action: 'delete' },
  { pattern: /show|list (?:all )?(?:my )?todos/i, action: 'show' },
];

function parseCommand(text) {
  for (const command of commands) {
    const match = text.match(command.pattern);
    if (match) {
      return {
        action: command.action,
        args: match.slice(1).filter(Boolean),
      };
    }
  }
  return null;
}

// Usage
const result = parseCommand('add todo Buy groceries');
// { action: 'add', args: ['Buy groceries'] }
```

### Command Handler
```javascript
class VoiceCommandHandler {
  constructor() {
    this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    this.setupRecognition();
  }

  setupRecognition() {
    this.recognition.continuous = false;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.handleCommand(transcript);
    };
  }

  handleCommand(text) {
    const command = parseCommand(text);
    if (command) {
      this.executeCommand(command);
      this.speak(`Executing: ${command.action}`);
    } else {
      this.speak("I didn't understand that command");
    }
  }

  executeCommand(command) {
    switch (command.action) {
      case 'add':
        addTodo(command.args[0]);
        break;
      case 'complete':
        completeTodo(command.args[0]);
        break;
      // ... other commands
    }
  }

  speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }

  start() {
    this.recognition.start();
  }
}
```

## Accessibility

### Reduced Motion
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable voice recognition
  // Show text input alternative
}
```

### Visual Feedback
```javascript
function showListeningIndicator() {
  const indicator = document.getElementById('voice-indicator');
  indicator.classList.add('listening');
}

function hideListeningIndicator() {
  const indicator = document.getElementById('voice-indicator');
  indicator.classList.remove('listening');
}

recognition.onstart = showListeningIndicator;
recognition.onend = hideListeningIndicator;
```

### Keyboard Alternative
```javascript
document.addEventListener('keydown', (e) => {
  // Spacebar to start/stop listening
  if (e.code === 'Space' && e.ctrlKey) {
    e.preventDefault();
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  }
});
```

## Error Handling

### Error Types
```javascript
recognition.onerror = (event) => {
  switch (event.error) {
    case 'no-speech':
      showError('No speech detected. Please try again.');
      break;
    case 'audio-capture':
      showError('No microphone found. Please check your device.');
      break;
    case 'not-allowed':
      showError('Microphone access denied. Please allow access.');
      break;
    case 'network':
      showError('Network error. Please check your connection.');
      break;
    case 'aborted':
      showError('Speech recognition was aborted.');
      break;
    default:
      showError('Speech recognition error: ' + event.error);
  }
};
```

### Retry Logic
```javascript
async function retryRecognition(maxAttempts = 3) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await startRecognition();
      return;
    } catch (error) {
      if (i === maxAttempts - 1) {
        throw error;
      }
      await delay(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## Multi-Language Support

### Language Detection
```javascript
function detectLanguage() {
  const browserLang = navigator.language || 'en-US';
  const supportedLanguages = ['en-US', 'es-ES', 'fr-FR', 'de-DE'];
  return supportedLanguages.includes(browserLang) ? browserLang : 'en-US';
}

recognition.lang = detectLanguage();
```

### Localized Commands
```javascript
const localizedCommands = {
  'en-US': [
    { pattern: /add (?:new )?todo (.+)/i, action: 'add' },
    { pattern: /show (?:my )?todos/i, action: 'show' },
  ],
  'es-ES': [
    { pattern: /añadir (?:nueva )?tarea (.+)/i, action: 'add' },
    { pattern: /mostrar (?:mis )?tareas/i, action: 'show' },
  ],
};

function getCommandsForLanguage(lang) {
  return localizedCommands[lang] || localizedCommands['en-US'];
}
```

## Browser Compatibility

### Support Detection
```javascript
function isSpeechRecognitionSupported() {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}

function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window;
}

if (!isSpeechRecognitionSupported()) {
  console.warn('Speech recognition not supported in this browser');
}
```

### Browser Support
- **Chrome**: Full support
- **Edge**: Full support
- **Safari**: Full support
- **Firefox**: No support (use alternative)
- **Mobile**: iOS Safari, Chrome for Android

## Best Practices

### User Experience
- Provide visual feedback when listening
- Show transcribed text in real-time
- Allow manual correction of recognized text
- Provide clear error messages
- Offer text input as fallback

### Performance
- Stop recognition when not needed
- Limit continuous recognition duration
- Use Web Workers for processing
- Cache voice selection results

### Security
- Don't record or store speech data
- Inform users about voice data usage
- Allow users to opt-out of voice features
- Use HTTPS for production deployments

### Accessibility
- Provide keyboard alternatives
- Support reduced motion preferences
- Ensure visual indicators are visible
- Support screen readers
- Provide clear feedback

## Resources

- **MDN Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Web Speech API Spec**: https://w3c.github.io/speech-api/
- **Speech Recognition Guide**: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
