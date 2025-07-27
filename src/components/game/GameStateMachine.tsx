import React, { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GamePhase } from '../../types/index';

// Import phase components
import { GameLobby } from '../lobby/GameLobby';
import { CharacterDashboard } from '../character/CharacterDashboard';
import { EvidenceLocker } from '../investigation/EvidenceLocker';
import { InvestigationTimer } from '../investigation/InvestigationTimer';
import { ClueDistribution } from '../investigation/ClueDistribution';
import { PublicChat } from '../chat/PublicChat';

export const GameStateMachine: React.FC = () => {
  const { currentGame, currentPlayer } = useGameStore();

  useEffect(() => {
    if (!currentGame) return;

    // No direct socket listeners; rely on store updates
    // Any additional side effects on game state change can be handled here
    return undefined;
  }, [currentGame]);

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-mystery-dark flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🎭</span>
          <h2 className="text-2xl font-semibold text-mystery-light mb-2">
            No Active Game
          </h2>
          <p className="text-gray-400">
            Join or create a game to start playing.
          </p>
        </div>
      </div>
    );
  }

  const renderPhaseContent = () => {
    switch (currentGame.currentPhase) {
      case GamePhase.LOBBY:
        return <GameLobby />;

      case GamePhase.INTRODUCTION:
        return <GameIntroduction />;

      case GamePhase.INVESTIGATION:
        return <InvestigationPhase />;

      case GamePhase.ACCUSATION:
        return <AccusationPhase />;

      case GamePhase.REVEAL:
        return <RevealPhase />;

      case GamePhase.FINISHED:
        return <GameFinished />;

      default:
        return (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">❓</span>
            <p className="text-gray-400">
              Unknown game phase: {currentGame.currentPhase}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-mystery-dark">
      {/* Game Header */}
      <header className="bg-mystery-purple border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-mystery font-bold text-mystery-light">
                🔍 {currentGame.scenario.title}
              </h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-400">
                  Phase:{' '}
                  <span className="text-mystery-gold capitalize">
                    {currentGame.currentPhase}
                  </span>
                </span>
                <span className="text-sm text-gray-400">
                  Players: {currentGame.players.length}/
                  {currentGame.scenario.maxPlayers}
                </span>
                {currentPlayer?.character && (
                  <span className="text-sm text-gray-400">
                    Playing:{' '}
                    <span className="text-mystery-light">
                      {currentPlayer.character.name}
                    </span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <PhaseIndicator currentPhase={currentGame.currentPhase} />
            </div>
          </div>
        </div>
      </header>

      {/* Phase Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {renderPhaseContent()}
      </main>

      {/* Chat Overlay (for investigation and accusation phases) */}
      {(currentGame.currentPhase === GamePhase.INVESTIGATION ||
        currentGame.currentPhase === GamePhase.ACCUSATION) && <PublicChat />}
    </div>
  );
};

// Phase Indicator Component
const PhaseIndicator: React.FC<{ currentPhase: GamePhase }> = ({
  currentPhase,
}) => {
  const phases = [
    { phase: GamePhase.LOBBY, icon: '👥', label: 'Lobby' },
    { phase: GamePhase.INTRODUCTION, icon: '📖', label: 'Intro' },
    { phase: GamePhase.INVESTIGATION, icon: '🔍', label: 'Investigation' },
    { phase: GamePhase.ACCUSATION, icon: '⚖️', label: 'Accusation' },
    { phase: GamePhase.REVEAL, icon: '🎭', label: 'Reveal' },
    { phase: GamePhase.FINISHED, icon: '🏁', label: 'Finished' },
  ];

  const currentIndex = phases.findIndex((p) => p.phase === currentPhase);

  return (
    <div className="flex items-center space-x-2">
      {phases.map((phase, index) => (
        <div
          key={phase.phase}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
            index === currentIndex
              ? 'bg-mystery-gold text-mystery-dark'
              : index < currentIndex
                ? 'bg-green-900 text-green-300'
                : 'bg-gray-700 text-gray-400'
          }`}
        >
          <span>{phase.icon}</span>
          <span className="hidden md:inline">{phase.label}</span>
        </div>
      ))}
    </div>
  );
};

// Phase Components
const GameIntroduction: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">📖</span>
        <h2 className="text-2xl font-semibold text-mystery-light mb-4">
          Game Introduction
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          The game is about to begin. Players will receive their character
          assignments and the mystery will be revealed.
        </p>
      </div>
    </div>
  );
};

const InvestigationPhase: React.FC = () => {
  const { isHost } = useGameStore();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Investigation Area */}
        <div className="lg:col-span-2 space-y-6">
          <EvidenceLocker />
          <CharacterDashboard />
        </div>

        {/* Host Controls & Timer */}
        <div className="space-y-6">
          <InvestigationTimer />
          {isHost && <ClueDistribution />}
        </div>
      </div>
    </div>
  );
};

const AccusationPhase: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">⚖️</span>
        <h2 className="text-2xl font-semibold text-mystery-light mb-4">
          Accusation Phase
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Time to make your accusations! Review the evidence and submit your
          final theory about who committed the crime, how, and why.
        </p>
      </div>
    </div>
  );
};

const RevealPhase: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">🎭</span>
        <h2 className="text-2xl font-semibold text-mystery-light mb-4">
          The Reveal
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          The truth is about to be revealed! See how your accusations compare to
          the actual solution of the mystery.
        </p>
      </div>
    </div>
  );
};

const GameFinished: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <span className="text-6xl mb-4 block">🏁</span>
        <h2 className="text-2xl font-semibold text-mystery-light mb-4">
          Game Complete
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Thank you for playing! The mystery has been solved and all secrets
          revealed.
        </p>
      </div>
    </div>
  );
};
