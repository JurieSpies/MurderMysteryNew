import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';

interface IntroStep {
  id: string;
  title: string;
  content: string;
  image?: string;
  duration?: number;
  autoAdvance?: boolean;
}

export const GameIntroduction: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const { currentGame, currentPlayer, isHost } = useGameStore();

  const introSteps: IntroStep[] = useMemo(
    () => [
      {
        id: 'welcome',
        title: 'Welcome to the Mystery',
        content: `Welcome to "${currentGame?.scenario.title}". You are about to embark on a thrilling murder mystery where every clue matters and every character has secrets.`,
        duration: 4000,
        autoAdvance: true,
      },
      {
        id: 'setting',
        title: 'The Setting',
        content:
          currentGame?.scenario.description ||
          'A mysterious location where dark secrets lurk in every shadow...',
        duration: 5000,
        autoAdvance: true,
      },
      {
        id: 'crime',
        title: 'The Crime',
        content:
          currentGame?.scenario.description ||
          "A terrible crime has been committed, and it's up to you to uncover the truth.",
        duration: 5000,
        autoAdvance: true,
      },
      {
        id: 'character',
        title: 'Your Character',
        content: currentPlayer?.character
          ? `You are playing ${currentPlayer.character.name}. ${currentPlayer.character.description}`
          : 'You will be assigned a character with their own secrets and motivations.',
        duration: 6000,
        autoAdvance: false,
      },
      {
        id: 'objective',
        title: 'Your Mission',
        content:
          'Work together to examine clues, question suspects, and uncover the truth. But remember - everyone has secrets, and not everyone can be trusted.',
        duration: 5000,
        autoAdvance: false,
      },
    ],
    [
      currentGame?.scenario.description,
      currentGame?.scenario.title,
      currentPlayer?.character,
    ]
  );

  useEffect(() => {
    if (isPlaying && currentStep < introSteps.length) {
      const step = introSteps[currentStep];
      if (step.autoAdvance && step.duration) {
        const timer = setTimeout(() => {
          if (currentStep < introSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, step.duration);

        return () => clearTimeout(timer);
      }
    }
  }, [isPlaying, currentStep, introSteps]);

  const handleStart = () => {
    setHasStarted(true);
    setIsPlaying(true);
    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < introSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsPlaying(false);
    setCurrentStep(introSteps.length - 1);
  };

  if (!currentGame) return null;

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-mystery-dark flex items-center justify-center">
        <Card title="🎭 Ready to Begin?" subtitle="The mystery awaits...">
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🔍</div>

            <div>
              <h2 className="text-2xl font-bold text-mystery-light mb-2">
                {currentGame.scenario.title}
              </h2>
              <p className="text-gray-400 mb-4">
                A murder mystery for {currentGame.players.length} players
              </p>
            </div>

            <div className="bg-mystery-dark rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                You're about to enter a world of intrigue, deception, and
                mystery. Pay attention to every detail, trust no one completely,
                and remember - the truth is often stranger than fiction.
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleStart} className="w-full" size="lg">
                🎬 Begin the Mystery
              </Button>

              {isHost && (
                <p className="text-xs text-gray-500">
                  As the host, you can skip the introduction if needed
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (isPlaying && currentStep < introSteps.length) {
    const step = introSteps[currentStep];

    return (
      <div className="min-h-screen bg-mystery-dark flex items-center justify-center">
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <div className="text-center space-y-6">
              {/* Progress Indicator */}
              <div className="flex justify-center space-x-2 mb-6">
                {introSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-mystery-gold'
                        : index < currentStep
                          ? 'bg-green-500'
                          : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Step Content */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-mystery-light">
                  {step.title}
                </h2>

                {step.image && (
                  <div className="flex justify-center">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="max-w-md rounded-lg shadow-lg"
                    />
                  </div>
                )}

                <div className="bg-mystery-purple bg-opacity-30 rounded-lg p-6">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {step.content}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center pt-6">
                <Button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  variant="ghost"
                >
                  ← Previous
                </Button>

                <div className="flex space-x-3">
                  {isHost && (
                    <Button onClick={handleSkip} variant="ghost" size="sm">
                      Skip Intro
                    </Button>
                  )}

                  {!step.autoAdvance && (
                    <Button onClick={handleNext}>
                      {currentStep === introSteps.length - 1
                        ? 'Start Investigation'
                        : 'Next →'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Auto-advance indicator */}
              {step.autoAdvance && step.duration && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <div className="flex space-x-1">
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
                  <span>Auto-advancing...</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Introduction complete - show summary
  return (
    <div className="min-h-screen bg-mystery-dark flex items-center justify-center">
      <Card
        title="🎭 The Mystery Begins"
        subtitle="You're ready to investigate"
      >
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">🔍</div>

          <div>
            <h2 className="text-2xl font-bold text-mystery-light mb-4">
              Introduction Complete
            </h2>
            <p className="text-gray-400 mb-6">
              The stage is set, the characters are in place, and the mystery
              awaits your investigation.
            </p>
          </div>

          {/* Character Summary */}
          {currentPlayer?.character && (
            <div className="bg-mystery-dark rounded-lg p-4">
              <h3 className="font-semibold text-mystery-light mb-2">
                Your Character
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎭</span>
                <div className="text-left">
                  <p className="font-medium text-mystery-light">
                    {currentPlayer.character.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {currentPlayer.character.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-mystery-dark rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-mystery-light">
                {currentGame.players.length}
              </p>
              <p className="text-gray-400 text-sm">Players</p>
            </div>
            <div className="bg-mystery-dark rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-mystery-light">
                {currentGame.scenario.characters.length}
              </p>
              <p className="text-gray-400 text-sm">Characters</p>
            </div>
            <div className="bg-mystery-dark rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-mystery-light">
                {currentGame.scenario.clues.length}
              </p>
              <p className="text-gray-400 text-sm">Clues to Find</p>
            </div>
          </div>

          {/* Ready to proceed */}
          <div className="pt-6">
            {isHost ? (
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  🔍 Start Investigation Phase
                </Button>
                <p className="text-xs text-gray-500">
                  As the host, you control when the investigation begins
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-400">
                  Waiting for the host to start the investigation phase...
                </p>
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
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
