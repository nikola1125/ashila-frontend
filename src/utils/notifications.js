class NotificationManager {
  constructor() {
    this.audioContext = null;
    this.hasPermission = false;
    this.isEnabled = true;
    this.selectedSound = 'chime'; // Default sound
    this.audioInitialized = false;
    // Don't initialize audio immediately - wait for user interaction
    this.requestPermission();
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
    
    // Initialize audio context if not already done (lazy initialization)
    if (!this.audioInitialized) {
      await this.initAudio();
    }
    
    if (!this.audioContext) return;

    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Play the selected sound type
      this.playSoundPattern(oscillator, gainNode, this.selectedSound);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      // Silently fail - audio is optional
    }
  }

  playSoundPattern(oscillator, gainNode, soundType) {
    const currentTime = this.audioContext.currentTime;

    switch (soundType) {
      case 'chime':
        // Pleasant chime sound
        oscillator.frequency.setValueAtTime(800, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
        break;
        
      case 'bell':
        // Bell-like sound
        oscillator.frequency.setValueAtTime(1000, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1500, currentTime + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.2);
        break;
        
      case 'ding':
        // Simple ding sound
        oscillator.frequency.setValueAtTime(1200, currentTime);
        oscillator.frequency.setValueAtTime(1200, currentTime + 0.15);
        break;
        
      case 'notification':
        // Classic notification sound
        oscillator.frequency.setValueAtTime(600, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.05);
        oscillator.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
        break;
        
      case 'alert':
        // Alert sound - more urgent
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.05);
        oscillator.frequency.setValueAtTime(600, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.15);
        break;
        
      case 'subtle':
        // Subtle notification
        oscillator.frequency.setValueAtTime(500, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(700, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(500, currentTime + 0.2);
        break;
        
      case 'digital':
        // Digital beep
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(1000, currentTime);
        oscillator.frequency.setValueAtTime(1000, currentTime + 0.1);
        break;
        
      case 'soft':
        // Soft gentle sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.15);
        oscillator.frequency.exponentialRampToValueAtTime(400, currentTime + 0.3);
        break;
        
      default:
        // Default to chime
        oscillator.frequency.setValueAtTime(800, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.2);
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
