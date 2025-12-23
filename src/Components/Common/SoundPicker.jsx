import React, { useState } from 'react';
import { Volume2, X, Play } from 'lucide-react';
import notificationManager from '../../utils/notifications';

const SoundPicker = ({ isOpen, onClose, currentSound, onSoundChange }) => {
  const [selectedSound, setSelectedSound] = useState(currentSound || 'chime');
  const availableSounds = notificationManager.getAvailableSounds();

  const handlePreviewSound = (soundId) => {
    // Temporarily change sound for preview
    const originalSound = notificationManager.getSelectedSound();
    notificationManager.setSelectedSound(soundId);
    notificationManager.playNotificationSound();
    // Restore original sound after preview
    setTimeout(() => {
      notificationManager.setSelectedSound(originalSound);
    }, 600);
  };

  const handleSelectSound = (soundId) => {
    setSelectedSound(soundId);
    notificationManager.setSelectedSound(soundId);
    onSoundChange(soundId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h3 className="text-xl font-bold text-amber-900 flex items-center gap-2">
              <Volume2 size={20} className="text-amber-600" />
              Notification Sounds
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Choose your preferred notification sound
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Sound Options */}
        <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
          {availableSounds.map((sound) => (
            <div
              key={sound.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-amber-300 ${
                selectedSound === sound.id
                  ? 'border-amber-400 bg-amber-50'
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => handleSelectSound(sound.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedSound === sound.id
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedSound === sound.id && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{sound.name}</h4>
                      <p className="text-sm text-gray-500">{sound.description}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewSound(sound.id);
                  }}
                  className="p-2 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 transition-colors"
                  title="Preview sound"
                >
                  <Play size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <strong>Tip:</strong> Click the play button to preview sounds
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundPicker;
