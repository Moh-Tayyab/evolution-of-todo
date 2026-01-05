---
name: voice-task-expert
description: >
  Expert-level voice-enabled task management with speech recognition, wake word detection,
  noise handling, error recovery, multi-language support, and audio interactions.
---

# Voice Task Management Expert Skill

You are a **Voice Interaction principal engineer** specializing in speech-to-text interfaces for task management applications.

## Core Responsibilities

### 1.1 Web Speech API Integration

```typescript
// Speech recognition setup
interface VoiceRecognitionConfig {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  maxAlternatives?: number
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  constructor(config: VoiceRecognitionConfig = {}) {
    if (!this.isSupported()) {
      throw new Error("Speech recognition not supported")
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    this.recognition = new SpeechRecognition()

    // Configuration
    this.recognition.continuous = config.continuous ?? false
    this.recognition.interimResults = config.interimResults ?? true
    this.recognition.lang = config.lang ?? "en-US"
    this.recognition.maxAlternatives = config.maxAlternatives ?? 3

    // Event handlers
    this.setupEventHandlers()
  }

  isSupported(): boolean {
    return "SpeechRecognition" in window || "webkitSpeechRecognition" in window
  }

  start(): void {
    if (this.isListening) return
    this.recognition?.start()
    this.isListening = true
  }

  stop(): void {
    this.recognition?.stop()
    this.isListening = false
  }

  private setupEventHandlers(): void {
    if (!this.recognition) return

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const { transcript, confidence } = this.getBestResult(event)

      // Handle recognized text
      this.handleRecognition(transcript, confidence)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.handleError(event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.onEnd?.()
    }

    this.recognition.onstart = () => {
      this.isListening = true
      this.onStart?.()
    }
  }

  private getBestResult(event: SpeechRecognitionEvent): {
    transcript: string
    confidence: number
  } {
    let bestResult = { transcript: "", confidence: 0 }

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      if (result.isFinal) {
        bestResult.transcript = result[0].transcript
        bestResult.confidence = result[0].confidence || 0
      }
    }

    return bestResult
  }
}
```

### 1.2 Wake Word Detection

```typescript
// Wake word detection using Web Audio API
export class WakeWordDetector {
  private audioContext: AudioContext | null = null
  private analyzer: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null
  private isListening = false

  constructor(private wakeWords: string[] = ["hey todo"]) {}

  async start(): Promise<void> {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const source = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.analyzer = this.audioContext.createAnalyser()
    this.analyzer.fftSize = 2048

    source.connect(this.analyzer)

    this.listenForWakeWord()
  }

  private listenForWakeWord(): void {
    const dataArray = new Uint8Array(this.analyzer.frequencyBinCount)
    const sampleRate = this.audioContext!.sampleRate

    const detectFrame = () => {
      if (!this.isListening) {
        this.analyzer!.getByteFrequencyData(dataArray)

        // Check for audio activity
        const avgVolume = this.calculateAverageVolume(dataArray)
        if (avgVolume > 10) {
          // Audio detected, trigger speech recognition
          this.onWakeWordDetected?.()
          return
        }

        requestAnimationFrame(detectFrame)
      }
    }

    detectFrame()
  }

  private calculateAverageVolume(dataArray: Uint8Array): number {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i]
    }
    return sum / dataArray.length
  }

  stop(): void {
    this.isListening = false
    this.mediaStream?.getTracks().forEach((track) => track.stop())
    this.audioContext?.close()
  }
}
```

### 1.3 Noise Reduction & Filtering

```typescript
// Noise detection and filtering
export class NoiseFilter {
  private audioContext: AudioContext | null = null

  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }

  createNoiseFilter(source: MediaStreamAudioSourceNode): AudioNode {
    // High-pass filter to remove low-frequency noise
    const highPass = this.audioContext!.createBiquadFilter()
    highPass.type = "highpass"
    highPass.frequency.value = 80  // Remove frequencies below 80Hz
    highPass.Q.value = 0.5

    // Low-pass filter to remove high-frequency noise
    const lowPass = this.audioContext!.createBiquadFilter()
    lowPass.type = "lowpass"
    lowPass.frequency.value = 8000  // Keep frequencies below 8kHz
    lowPass.Q.value = 0.5

    // Connect filters
    source.connect(highPass)
    highPass.connect(lowPass)

    return lowPass
  }

  // VAD (Voice Activity Detection) using energy threshold
  detectVoiceActivity(audioBuffer: AudioBuffer): boolean {
    const channelData = audioBuffer.getChannelData(0)
    let energy = 0

    for (let i = 0; i < channelData.length; i++) {
      energy += channelData[i] * channelData[i]
    }

    const averageEnergy = energy / channelData.length
    const threshold = 0.01  // Adjust based on environment

    return averageEnergy > threshold
  }
}
```

### 1.4 Error Recovery & Retries

```typescript
// Error handling with exponential backoff
export class VoiceRecognitionManager {
  private maxRetries = 3
  private baseDelay = 1000  // 1 second
  private retryCount = 0
  private recognition: VoiceRecognition | null = null

  async recognizeWithRetry(
    prompt: string
  ): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.recognizeOnce(prompt)
        this.retryCount = 0
        return result
      } catch (error) {
        lastError = error
        console.warn(`Recognition attempt ${attempt} failed:`, error)

        if (this.shouldRetry(error) && attempt < this.maxRetries) {
          const delay = this.calculateBackoff(attempt)
          await this.sleep(delay)
        }
      }
    }

    throw lastError
  }

  private shouldRetry(error: Error): boolean {
    // Retry on transient errors
    const retryableErrors = ["network", "not-allowed", "aborted"]
    return retryableErrors.some((err) => error.message.includes(err))
  }

  private calculateBackoff(attempt: number): number {
    // Exponential backoff with jitter
    const backoff = this.baseDelay * Math.pow(2, attempt - 1)
    const jitter = Math.random() * 0.3 * backoff
    return backoff + jitter
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
```

### 1.5 Natural Language Processing for Commands

```typescript
// Command parser with fuzzy matching
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
      /new (?:task )?(?<title>.+)/i,
    ],
    delete: [
      /delete (?:task )?(?<id>\d+)/i,
      /remove (?:task )?(?<id>\d+)/i,
    ],
    complete: [
      /complete (?:task )?(?<id>\d+)/i,
      /mark (?:task )?(?<id>\d+) (?:as )?complete/i,
      /finish (?:task )?(?<id>\d+)/i,
    ],
    show: [
      /show (?:my )?(?:tasks?)/i,
      /list (?:tasks?)/i,
      /what (?:are )?(?:my )?(?:tasks?)/i,
    ],
    clear: [
      /clear (?:completed )?(?:tasks?)/i,
      /remove (?:all )?(?:completed )?(?:tasks?)/i,
    ],
  }

  parse(text: string): VoiceCommand | null {
    text = text.trim().toLowerCase()

    for (const [intent, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns as RegExp[]) {
        const match = text.match(pattern)
        if (match && match.groups) {
          return {
            intent: intent as VoiceCommand["intent"],
            parameters: match.groups as VoiceCommand["parameters"],
            confidence: this.calculateConfidence(match),
          }
        }
      }
    }

    return null
  }

  private calculateConfidence(match: RegExpMatchArray): number {
    // Higher confidence for exact matches, lower for partial
    const matchedText = match[0]
    const fullText = match.input || ""
    return matchedText.length / fullText.length
  }
}
```

### 1.6 Multi-Language Support

```typescript
// Language detection and switching
export class MultiLanguageVoice {
  private availableLanguages = [
    { code: "en-US", name: "English (US)" },
    { code: "en-GB", name: "English (UK)" },
    { code: "es-ES", name: "Spanish" },
    { code: "fr-FR", name: "French" },
    { code: "de-DE", name: "German" },
    { code: "zh-CN", name: "Chinese (Simplified)" },
    { code: "ja-JP", name: "Japanese" },
  ]

  private recognition: VoiceRecognition | null = null
  private currentLanguage = "en-US"

  constructor() {
    this.detectBrowserLanguage()
  }

  detectBrowserLanguage(): void {
    const browserLang = navigator.language || "en-US"

    // Try to match available language
    const matchedLang = this.availableLanguages.find(
      (lang) => lang.code === browserLang || lang.code.startsWith(browserLang.split("-")[0])
    )

    if (matchedLang) {
      this.currentLanguage = matchedLang.code
    }
  }

  setLanguage(langCode: string): void {
    const lang = this.availableLanguages.find((l) => l.code === langCode)
    if (lang) {
      this.currentLanguage = langCode
      this.recognition?.stop()

      // Reinitialize with new language
      this.recognition = new VoiceRecognition({ lang: langCode })
    }
  }

  getAvailableLanguages(): Array<{ code: string; name: string }> {
    return this.availableLanguages
  }
}
```

### 1.7 Feedback & Confirmation

```typescript
// Speech synthesis for voice feedback
export class VoiceFeedback {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []

  constructor() {
    this.synthesis = window.speechSynthesis
    this.loadVoices()
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices()
    // Try to get better voices
    this.synthesis.onvoiceschanged = () => {
      this.voices = this.synthesis.getVoices()
    }
  }

  speak(
    text: string,
    options: {
      rate?: number
      pitch?: number
      voice?: string
    } = {}
  ): void {
    const utterance = new SpeechSynthesisUtterance(text)

    // Voice selection
    const selectedVoice = this.voices.find(
      (v) => v.name === options.voice
    ) || this.getBestVoice()
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Speech properties
    utterance.rate = options.rate ?? 1.0  // 0.1 to 10
    utterance.pitch = options.pitch ?? 1.0  // 0 to 2

    this.synthesis.speak(utterance)
  }

  private getBestVoice(): SpeechSynthesisVoice | null {
    // Prefer English natural voices
    return (
      this.voices.find((v) => v.lang === "en-US" && v.name.includes("Google")) ||
      this.voices.find((v) => v.lang === "en-US") ||
      this.voices[0] ||
      null
    )
  }

  cancel(): void {
    this.synthesis.cancel()
  }
}
```

### 1.8 React Component Integration

```typescript
// Voice-enabled task component
import { useState, useEffect, useRef } from "react"
import { VoiceRecognition, VoiceCommandParser, VoiceFeedback } from "./voice"

export function VoiceTaskManager() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])

  const recognitionRef = useRef<VoiceRecognition | null>(null)
  const parserRef = useRef(new VoiceCommandParser())
  const feedbackRef = useRef(new VoiceFeedback())

  useEffect(() => {
    // Initialize voice recognition
    recognitionRef.current = new VoiceRecognition({
      lang: "en-US",
      continuous: false,
      interimResults: true,
    })

    // Set up result handler
    recognitionRef.current.onresult = (text) => {
      setTranscript(text)

      // Parse command
      const command = parserRef.current.parse(text)
      if (command && command.confidence > 0.7) {
        handleVoiceCommand(command)
        setLastCommand(command)
      }
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const handleVoiceCommand = (command: VoiceCommand) => {
    switch (command.intent) {
      case "add":
        if (command.parameters.title) {
          addTask(command.parameters.title)
          feedbackRef.current.speak(`Task "${command.parameters.title}" added`)
        }
        break

      case "delete":
        if (command.parameters.id) {
          deleteTask(parseInt(command.parameters.id))
          feedbackRef.current.speak(`Task ${command.parameters.id} deleted`)
        }
        break

      case "complete":
        if (command.parameters.id) {
          completeTask(parseInt(command.parameters.id))
          feedbackRef.current.speak(`Task ${command.parameters.id} completed`)
        }
        break

      case "show":
        const count = tasks.length
        feedbackRef.current.speak(`You have ${count} tasks`)
        break

      case "clear":
        clearCompletedTasks()
        feedbackRef.current.speak("Completed tasks cleared")
        break
    }
  }

  const startListening = () => {
    recognitionRef.current?.start()
    setIsListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Voice Task Manager</h2>

      {/* Microphone button */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`p-4 rounded-full transition-colors ${
          isListening
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <MicIcon className="w-8 h-8 text-white" />
      </button>

      {/* Transcript display */}
      {transcript && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-lg">{transcript}</p>
          {lastCommand && (
            <p className="text-sm text-gray-500 mt-2">
              Recognized: {lastCommand.intent} {JSON.stringify(lastCommand.parameters)}
            </p>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-white rounded shadow">
            {task.title}
          </div>
        ))}
      </div>

      {/* Text alternative */}
      <input
        type="text"
        placeholder="Or type your command..."
        className="w-full p-2 border rounded"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            const command = parserRef.current.parse((e.target as HTMLInputElement).value)
            if (command) {
              handleVoiceCommand(command)
            }
          }
        }}
      />
    </div>
  )
}
```

---

## When to Use This Skill

- Adding voice interfaces to applications
- Implementing speech-to-text recognition
- Creating voice command parsers
- Building wake word detection
- Handling audio feedback
- Implementing error recovery
- Supporting multiple languages
- Ensuring accessibility

---

## Anti-Patterns to Avoid

**Never:**
- Skip microphone permission handling
- Ignore speech recognition errors
- Use voice as only interface
- Skip text alternatives
- Forget to handle multiple results
- Ignore low-confidence results
- Skip noise filtering
- Use voice in noisy environments without warning

**Always:**
- Request microphone permissions gracefully
- Provide text alternatives
- Handle errors with retries
- Use confidence thresholds
- Filter background noise
- Test with multiple accents
- Support multiple languages
- Provide audio feedback
- Respect reduced motion preferences

---

## Tools Used

- **Read/Grep:** Examine existing voice implementations
- **Write/Edit:** Create voice components
- **Bash:** Test with microphone access
- **Context7 MCP:** Web Speech API docs

---

## Verification Process

1. **Permissions:** Test microphone permission flow
2. **Recognition:** Test command parsing accuracy
3. **Noise:** Test with background noise
4. **Recovery:** Test error handling and retries
5. **Multi-lang:** Test language switching
6. **A11y:** Test keyboard/screen reader alternatives
