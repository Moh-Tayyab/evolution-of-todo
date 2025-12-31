"""
Voice Input Service Contract

Defines the interface for voice-to-text transcription operations.

@spec: specs/001-phase-i-complete/spec.md
User Story 7: Voice Input
"""

from typing import Protocol

class VoiceInputService(Protocol):
    """Contract for voice input transcription operations."""

    def record_and_transcribe(self, timeout: int = 30) -> str:
        """
        Record audio from microphone and transcribe to text.

        Requirements: FR-071, FR-072, FR-073, FR-074, FR-075
        Parameters:
          - timeout: Maximum recording duration in seconds (default 30 per FR-072)
        Implementation:
          - Uses SpeechRecognition + pyaudio (per research.md)
          - Supports offline (Sphinx) and online (Google) engines
        Returns: Transcribed text
        Raises:
          - ValueError: Could not understand audio
          - ConnectionError: Speech service unavailable
        """
        ...

    def is_available(self) -> bool:
        """
        Check if microphone and speech recognition are available.

        Returns: True if system can record audio
        Use Case: Graceful degradation if mic not present
        """
        ...
