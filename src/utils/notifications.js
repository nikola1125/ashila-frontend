class NotificationManager {
  constructor() {
    this.audioContext = null;
    this.hasPermission = false;
    this.isEnabled = true;
    this.selectedSound = 'chime'; // Default sound
    this.audioInitialized = false;
    this.lastPlayTime = 0;
    this.minPlayInterval = 100; // Minimum 100ms between sounds
    // Don't initialize audio immediately - wait for user interaction
    this.requestPermission();
    
    // Handle page visibility changes
    this.setupVisibilityHandler();
  }

  setupVisibilityHandler() {
    // Re-initialize audio when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isEnabled) {
        this.initAudio();
      }
    });

    // Handle window focus
    window.addEventListener('focus', () => {
      if (this.isEnabled) {
        this.initAudio();
      }
    });
  }

  async initAudio() {
    if (this.audioInitialized && this.audioContext) return;
    
    try {
      // Create audio context lazily - only when needed and after user interaction
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioInitialized = true;
      
      // Resume if suspended (required by browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      // Silently fail - audio is optional
      this.audioContext = null;
    }
  }

  async requestPermission() {
    // Request notification permission
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      // Initialize audio after user interaction (permission request)
      if (permission !== 'default') {
        await this.initAudio();
      }
    }
  }

  async playNotificationSound(type = 'order') {
    if (!this.isEnabled) return;
    
    // Rate limiting to prevent audio spam
    const now = Date.now();
    if (now - this.lastPlayTime < this.minPlayInterval) {
      return;
    }
    this.lastPlayTime = now;
    
    // Initialize audio context if not already done (lazy initialization)
    if (!this.audioInitialized) {
      await this.initAudio();
    }
    
    if (!this.audioContext) {
      // Fallback to HTML5 Audio if Web Audio API fails
      this.playFallbackSound(type);
      return;
    }

    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create a more robust sound with multiple oscillators
      await this.playEnhancedSound(type);
    } catch (error) {
      // Fallback to HTML5 Audio if Web Audio API fails
      this.playFallbackSound(type);
    }
  }

  async playEnhancedSound(type) {
    const currentTime = this.audioContext.currentTime;
    
    // Create multiple oscillators for richer sound
    const primaryOsc = this.audioContext.createOscillator();
    const secondaryOsc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();

    // Connect nodes
    primaryOsc.connect(filterNode);
    secondaryOsc.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Configure filter for better sound quality
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(2000, currentTime);
    filterNode.Q.setValueAtTime(1, currentTime);

    // Set oscillator types
    primaryOsc.type = 'sine';
    secondaryOsc.type = 'triangle';

    // Configure gain envelope
    gainNode.gain.setValueAtTime(0, currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.8);

    // Play the selected sound pattern
    this.playSoundPattern(primaryOsc, secondaryOsc, currentTime, this.selectedSound);

    // Start and stop oscillators
    primaryOsc.start(currentTime);
    secondaryOsc.start(currentTime);
    primaryOsc.stop(currentTime + 0.8);
    secondaryOsc.stop(currentTime + 0.8);
  }

  playFallbackSound(type) {
    try {
      // Create a simple HTML5 Audio element as fallback
      const audio = new Audio();
      
      // Generate a data URI for a simple beep sound
      const beepData = this.generateBeepData(type);
      audio.src = beepData;
      audio.volume = 0.3;
      
      // Play the sound
      const playPromise = audio.play();
      
      // Handle autoplay restrictions
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently fail if autoplay is blocked
        });
      }
    } catch (error) {
      // Silently fail - audio is optional
    }
  }

  generateBeepData(type) {
    // Generate a simple beep sound as data URI
    const frequency = this.getFrequencyForType(type);
    const duration = 0.3;
    const sampleRate = 44100;
    const numSamples = Math.floor(sampleRate * duration);
    
    // Generate PCM data
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);
    
    // Generate sine wave data
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const envelope = Math.exp(-i / (sampleRate * 0.1)); // Exponential decay
      view.setInt16(offset, sample * envelope * 32767, true);
      offset += 2;
    }
    
    return 'data:audio/wav;base64,' + btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  getFrequencyForType(type) {
    const frequencies = {
      'order': 800,
      'chime': 1000,
      'bell': 1200,
      'ding': 900,
      'notification': 600,
      'alert': 400,
      'subtle': 500,
      'digital': 1000,
      'soft': 400
    };
    return frequencies[type] || 800;
  }

  playSoundPattern(primaryOsc, secondaryOsc, currentTime, soundType) {
    switch (soundType) {
      case 'chime':
        // Pleasant chime sound
        primaryOsc.frequency.setValueAtTime(800, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
        secondaryOsc.frequency.setValueAtTime(1600, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(2400, currentTime + 0.1);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.2);
        break;
        
      case 'bell':
        // Bell-like sound
        primaryOsc.frequency.setValueAtTime(1000, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(1500, currentTime + 0.05);
        primaryOsc.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.2);
        secondaryOsc.frequency.setValueAtTime(2000, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(3000, currentTime + 0.05);
        secondaryOsc.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.1);
        break;
        
      case 'ding':
        // Simple ding sound
        primaryOsc.frequency.setValueAtTime(1200, currentTime);
        primaryOsc.frequency.setValueAtTime(1200, currentTime + 0.15);
        secondaryOsc.frequency.setValueAtTime(2400, currentTime);
        secondaryOsc.frequency.setValueAtTime(2400, currentTime + 0.15);
        break;
        
      case 'notification':
        // Classic notification sound
        primaryOsc.frequency.setValueAtTime(600, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.05);
        primaryOsc.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.15);
        primaryOsc.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
        secondaryOsc.frequency.setValueAtTime(1200, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1600, currentTime + 0.05);
        secondaryOsc.frequency.exponentialRampToValueAtTime(2000, currentTime + 0.1);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1600, currentTime + 0.15);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.2);
        break;
        
      case 'alert':
        // Alert sound - more urgent
        primaryOsc.frequency.setValueAtTime(400, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(600, currentTime + 0.05);
        primaryOsc.frequency.setValueAtTime(600, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(400, currentTime + 0.15);
        secondaryOsc.frequency.setValueAtTime(800, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.05);
        secondaryOsc.frequency.setValueAtTime(1200, currentTime + 0.1);
        secondaryOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.15);
        break;
        
      case 'subtle':
        // Subtle notification
        primaryOsc.frequency.setValueAtTime(500, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(700, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(500, currentTime + 0.2);
        secondaryOsc.frequency.setValueAtTime(1000, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1400, currentTime + 0.1);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.2);
        break;
        
      case 'digital':
        // Digital beep
        primaryOsc.type = 'square';
        secondaryOsc.type = 'square';
        primaryOsc.frequency.setValueAtTime(1000, currentTime);
        primaryOsc.frequency.setValueAtTime(1000, currentTime + 0.1);
        secondaryOsc.frequency.setValueAtTime(2000, currentTime);
        secondaryOsc.frequency.setValueAtTime(2000, currentTime + 0.1);
        break;
        
      case 'soft':
        // Soft gentle sound
        primaryOsc.type = 'sine';
        secondaryOsc.type = 'sine';
        primaryOsc.frequency.setValueAtTime(400, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(600, currentTime + 0.15);
        primaryOsc.frequency.exponentialRampToValueAtTime(400, currentTime + 0.3);
        secondaryOsc.frequency.setValueAtTime(800, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.15);
        secondaryOsc.frequency.exponentialRampToValueAtTime(800, currentTime + 0.3);
        break;
        
      default:
        // Default to chime
        primaryOsc.frequency.setValueAtTime(800, currentTime);
        primaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1);
        primaryOsc.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
        secondaryOsc.frequency.setValueAtTime(1600, currentTime);
        secondaryOsc.frequency.exponentialRampToValueAtTime(2400, currentTime + 0.1);
        secondaryOsc.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.2);
    }
  }

  getAvailableSounds() {
    return [
      { id: 'chime', name: 'Chime', description: 'Pleasant chiming sound' },
      { id: 'bell', name: 'Bell', description: 'Classic bell ring' },
      { id: 'ding', name: 'Ding', description: 'Simple ding sound' },
      { id: 'notification', name: 'Notification', description: 'Classic notification' },
      { id: 'alert', name: 'Alert', description: 'Urgent alert sound' },
      { id: 'subtle', name: 'Subtle', description: 'Gentle reminder' },
      { id: 'digital', name: 'Digital', description: 'Digital beep' },
      { id: 'soft', name: 'Soft', description: 'Soft gentle sound' }
    ];
  }

  setSelectedSound(soundId) {
    this.selectedSound = soundId;
  }

  getSelectedSound() {
    return this.selectedSound;
  }

  showNotification(title, options = {}) {
    if (!this.hasPermission) return;

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'medi-mart-admin',
      renotify: true,
      requireInteraction: false,
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Click to focus window
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  notify(title, message, type = 'info', sound = 'order') {
    // Play sound
    this.playNotificationSound(sound);

    // Show browser notification
    this.showNotification(title, {
      body: message,
      icon: type === 'success' ? '/success-icon.png' : 
            type === 'error' ? '/error-icon.png' : '/favicon.ico'
    });
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    return this.isEnabled;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

export default notificationManager;
