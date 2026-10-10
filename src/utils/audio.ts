import { AlarmSoundType } from '../types/reminder';

class AudioManager {
  private audioCtx: AudioContext | null = null;
  private isRinging = false;
  private ringIntervalId: number | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Play a single ringtone sequence based on sound type
  public playTone(soundType: AlarmSoundType = 'classic') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      switch (soundType) {
        case 'classic': {
          // Classic dual-tone ringing alarm (beep-beep-beep)
          const freqs = [880, 1174.66, 880, 1174.66];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.2, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, now + (idx + 1) * 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + (idx + 1) * 0.12);
          });
          break;
        }

        case 'melodic': {
          // Melodic marimba chime chord (C5, E5, G5, C6)
          const notes = [523.25, 659.25, 783.99, 1046.5];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.15);
            gain.gain.setValueAtTime(0.25, now + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.15);
            osc.stop(now + idx * 0.15 + 0.6);
          });
          break;
        }

        case 'gentle': {
          // Soft sine wave harp-like ripple
          const freqs = [440, 554.37, 659.25, 880];
          freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.2);
            gain.gain.setValueAtTime(0.2, now + idx * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.2 + 0.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.2);
            osc.stop(now + idx * 0.2 + 0.9);
          });
          break;
        }

        case 'temple': {
          // Temple bell / ghanta deep resonance with overtones
          const baseFreq = 432;
          const harmonics = [1, 2.01, 3.02, 4.2];
          harmonics.forEach((mult, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq * mult, now);
            const initialGain = 0.3 / (idx + 1);
            gain.gain.setValueAtTime(initialGain, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 2.0);
          });
          break;
        }
      }
    } catch (e) {
      console.warn('Audio playback not permitted or supported:', e);
    }
  }

  // Continuous alarm ringing until dismissed or snoozed
  public startAlarmRinging(soundType: AlarmSoundType = 'classic') {
    if (this.isRinging) return;
    this.isRinging = true;

    // Trigger initial tone
    this.playTone(soundType);

    // Trigger Android device vibration
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 250, 500, 250, 500]);
      } catch {
        // Ignore if vibration disallowed
      }
    }

    // Loop every 2 seconds
    this.ringIntervalId = window.setInterval(() => {
      if (!this.isRinging) return;
      this.playTone(soundType);

      if ('vibrate' in navigator) {
        try {
          navigator.vibrate([400, 200, 400]);
        } catch {
          // Ignore
        }
      }
    }, 2200);
  }

  public stopAlarmRinging() {
    this.isRinging = false;
    if (this.ringIntervalId !== null) {
      clearInterval(this.ringIntervalId);
      this.ringIntervalId = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0); // Stop vibration
      } catch {
        // Ignore
      }
    }
  }

  public speakAnnouncement(title: string, categoryName: string) {
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const text = `तिरमल रिमाइंडर: ${title}. ${categoryName} ची वेळ झाली आहे.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'mr-IN'; // Marathi language tag
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Try finding Marathi or Indian voice if available
      const voices = window.speechSynthesis.getVoices();
      const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
      if (mrVoice) {
        utterance.voice = mrVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
}

export const audioManager = new AudioManager();
