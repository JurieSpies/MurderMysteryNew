import React, { useState, useEffect } from 'react';
import { GamePhase } from '../../types/index';

interface PhaseTransitionProps {
  fromPhase: GamePhase;
  toPhase: GamePhase;
  onComplete: () => void;
  duration?: number; // in milliseconds
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({
  fromPhase,
  toPhase,
  onComplete,
  duration = 3000,
}) => {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (duration / 100);
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete();
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  const getPhaseInfo = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.LOBBY:
        return { icon: '👥', title: 'Lobby', description: 'Gathering players' };
      case GamePhase.INTRODUCTION:
        return {
          icon: '📖',
          title: 'Introduction',
          description: 'Setting the scene',
        };
      case GamePhase.INVESTIGATION:
        return {
          icon: '🔍',
          title: 'Investigation',
          description: 'Searching for clues',
        };
      case GamePhase.ACCUSATION:
        return {
          icon: '⚖️',
          title: 'Accusation',
          description: 'Making final accusations',
        };
      case GamePhase.REVEAL:
        return {
          icon: '🎭',
          title: 'Reveal',
          description: 'Unveiling the truth',
        };
      case GamePhase.FINISHED:
        return { icon: '🏁', title: 'Finished', description: 'Game complete' };
      default:
        return { icon: '❓', title: 'Unknown', description: 'Unknown phase' };
    }
  };

  const fromInfo = getPhaseInfo(fromPhase);
  const toInfo = getPhaseInfo(toPhase);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="text-center max-w-md mx-auto p-8">
        {/* Phase Icons */}
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="text-center">
            <div className="text-6xl mb-2 opacity-50">{fromInfo.icon}</div>
            <p className="text-gray-400 text-sm">{fromInfo.title}</p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-0.5 bg-mystery-gold"></div>
            <span className="text-mystery-gold text-2xl">→</span>
            <div className="w-8 h-0.5 bg-mystery-gold"></div>
          </div>

          <div className="text-center">
            <div className="text-6xl mb-2">{toInfo.icon}</div>
            <p className="text-mystery-light text-sm font-semibold">
              {toInfo.title}
            </p>
          </div>
        </div>

        {/* Transition Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-mystery-light mb-2">
            Transitioning to {toInfo.title}
          </h2>
          <p className="text-gray-400">{toInfo.description}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
          <div
            className="bg-mystery-gold h-2 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading Animation */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"
            style={{ animationDelay: '0.1s' }}
          ></div>
          <div
            className="w-2 h-2 bg-mystery-gold rounded-full animate-bounce"
            style={{ animationDelay: '0.2s' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

// Phase notification component for smaller transitions
export const PhaseNotification: React.FC<{
  phase: GamePhase;
  message: string;
  onDismiss: () => void;
  autoHide?: boolean;
  duration?: number;
}> = ({ phase, message, onDismiss, autoHide = true, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  const getPhaseInfo = (phase: GamePhase) => {
    switch (phase) {
      case GamePhase.LOBBY:
        return { icon: '👥', color: 'bg-blue-900 border-blue-500' };
      case GamePhase.INTRODUCTION:
        return { icon: '📖', color: 'bg-purple-900 border-purple-500' };
      case GamePhase.INVESTIGATION:
        return { icon: '🔍', color: 'bg-yellow-900 border-yellow-500' };
      case GamePhase.ACCUSATION:
        return { icon: '⚖️', color: 'bg-red-900 border-red-500' };
      case GamePhase.REVEAL:
        return { icon: '🎭', color: 'bg-green-900 border-green-500' };
      case GamePhase.FINISHED:
        return { icon: '🏁', color: 'bg-gray-900 border-gray-500' };
      default:
        return { icon: '❓', color: 'bg-gray-900 border-gray-500' };
    }
  };

  const phaseInfo = getPhaseInfo(phase);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-40 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div
        className={`${phaseInfo.color} bg-opacity-20 border rounded-lg p-4 max-w-sm`}
      >
        <div className="flex items-start space-x-3">
          <span className="text-2xl">{phaseInfo.icon}</span>
          <div className="flex-1">
            <p className="text-mystery-light text-sm font-medium mb-1">
              Phase Update
            </p>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className="text-gray-400 hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
