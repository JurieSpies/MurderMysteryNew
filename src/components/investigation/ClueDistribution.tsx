import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';

export const ClueDistribution: React.FC = () => {
  const [selectedClues, setSelectedClues] = useState<Set<string>>(new Set());
  const [distributionMode, setDistributionMode] = useState<'manual' | 'timed'>(
    'manual'
  );
  const [timerInterval, setTimerInterval] = useState(5); // minutes
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [nextClueTime, setNextClueTime] = useState<Date | null>(null);

  const { currentGame, isHost, setError } = useGameStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && nextClueTime) {
      interval = setInterval(() => {
        const now = new Date();
        if (now >= nextClueTime) {
          handleTimedClueRelease();
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, nextClueTime, handleTimedClueRelease]);

  const handleTimedClueRelease = useCallback(async () => {
    if (!currentGame) return;

    const allClues = currentGame.scenario.clues;
    const revealedClueIds = new Set(
      (currentGame.revealedClues || []).map((c) => c.id)
    );
    const availableClues = allClues.filter(
      (clue) => !revealedClueIds.has(clue.id)
    );

    if (availableClues.length === 0) {
      setIsTimerActive(false);
      return;
    }

    try {
      // Release the next highest priority clue
      const nextClue = availableClues.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (
          (priorityOrder[b.importance as keyof typeof priorityOrder] || 0) -
          (priorityOrder[a.importance as keyof typeof priorityOrder] || 0)
        );
      })[0];

      await socketService.releaseClues([nextClue.id]);

      // Set next timer
      const nextTime = new Date();
      nextTime.setMinutes(nextTime.getMinutes() + timerInterval);
      setNextClueTime(nextTime);
    } catch (error) {
      console.error('Failed to release timed clue:', error);
      setError('Failed to release timed clue');
      setIsTimerActive(false);
    }
  }, [currentGame, timerInterval, setError]);

  if (!currentGame || !isHost) {
    return (
      <Card title="Clue Distribution" subtitle="Host access required">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🔒</span>
          <p className="text-gray-400">
            Only the game host can distribute clues.
          </p>
        </div>
      </Card>
    );
  }

  const allClues = currentGame.scenario.clues;
  const revealedClueIds = new Set(
    (currentGame.revealedClues || []).map((c) => c.id)
  );
  const availableClues = allClues.filter(
    (clue) => !revealedClueIds.has(clue.id)
  );

  const handleClueToggle = (clueId: string) => {
    setSelectedClues((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(clueId)) {
        newSet.delete(clueId);
      } else {
        newSet.add(clueId);
      }
      return newSet;
    });
  };

  const handleReleaseSelectedClues = async () => {
    if (selectedClues.size === 0) {
      setError('Please select at least one clue to release');
      return;
    }

    try {
      const cluesToRelease = Array.from(selectedClues);
      await socketService.releaseClues(cluesToRelease);
      setSelectedClues(new Set());
    } catch (error) {
      console.error('Failed to release clues:', error);
      setError('Failed to release clues. Please try again.');
    }
  };

  const startTimedDistribution = () => {
    const nextTime = new Date();
    nextTime.setMinutes(nextTime.getMinutes() + timerInterval);
    setNextClueTime(nextTime);
    setIsTimerActive(true);
  };

  const stopTimedDistribution = () => {
    setIsTimerActive(false);
    setNextClueTime(null);
  };

  const getTimeUntilNext = (): string => {
    if (!nextClueTime) return '';
    const now = new Date();
    const diff = nextClueTime.getTime() - now.getTime();
    if (diff <= 0) return 'Now';

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'physical':
        return '🔍';
      case 'document':
        return '📄';
      case 'testimony':
        return '💬';
      case 'financial':
        return '💰';
      case 'personal':
        return '👤';
      case 'location':
        return '📍';
      case 'timeline':
        return '⏰';
      default:
        return '🔎';
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'high':
        return 'text-red-400 bg-red-900';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900';
      case 'low':
        return 'text-green-400 bg-green-900';
      default:
        return 'text-gray-400 bg-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="🎯 Clue Distribution Control"
        subtitle="Manage clue releases during investigation"
      >
        {/* Distribution Mode */}
        <div className="space-y-4 mb-6">
          <div>
            <h4 className="font-semibold text-mystery-light mb-3">
              Distribution Mode
            </h4>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="distributionMode"
                  value="manual"
                  checked={distributionMode === 'manual'}
                  onChange={(e) =>
                    setDistributionMode(e.target.value as 'manual' | 'timed')
                  }
                  className="text-mystery-gold"
                />
                <span className="text-gray-300">Manual Release</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="distributionMode"
                  value="timed"
                  checked={distributionMode === 'timed'}
                  onChange={(e) =>
                    setDistributionMode(e.target.value as 'manual' | 'timed')
                  }
                  className="text-mystery-gold"
                />
                <span className="text-gray-300">Timed Release</span>
              </label>
            </div>
          </div>

          {/* Timed Distribution Controls */}
          {distributionMode === 'timed' && (
            <div className="bg-mystery-dark rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-mystery-light mb-2">
                    Interval (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={timerInterval}
                    onChange={(e) =>
                      setTimerInterval(parseInt(e.target.value) || 5)
                    }
                    className="w-full bg-mystery-purple border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
                    disabled={isTimerActive}
                  />
                </div>

                <div className="text-center">
                  {isTimerActive && nextClueTime && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">
                        Next clue in:
                      </p>
                      <p className="text-lg font-mono text-mystery-gold">
                        {getTimeUntilNext()}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  {isTimerActive ? (
                    <Button
                      onClick={stopTimedDistribution}
                      variant="danger"
                      className="w-full"
                    >
                      Stop Timer
                    </Button>
                  ) : (
                    <Button
                      onClick={startTimedDistribution}
                      disabled={availableClues.length === 0}
                      className="w-full"
                    >
                      Start Timer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-mystery-light">
              {allClues.length}
            </p>
            <p className="text-gray-400 text-sm">Total Clues</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {revealedClueIds.size}
            </p>
            <p className="text-gray-400 text-sm">Released</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {availableClues.length}
            </p>
            <p className="text-gray-400 text-sm">Available</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-mystery-gold">
              {selectedClues.size}
            </p>
            <p className="text-gray-400 text-sm">Selected</p>
          </div>
        </div>

        {/* Available Clues */}
        {availableClues.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-mystery-light">
                Available Clues
              </h4>
              {distributionMode === 'manual' && (
                <div className="space-x-2">
                  <Button
                    onClick={() =>
                      setSelectedClues(new Set(availableClues.map((c) => c.id)))
                    }
                    variant="ghost"
                    size="sm"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={() => setSelectedClues(new Set())}
                    variant="ghost"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableClues.map((clue) => (
                <div
                  key={clue.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedClues.has(clue.id)
                      ? 'border-mystery-gold bg-mystery-gold bg-opacity-10'
                      : 'border-gray-600 bg-mystery-dark hover:border-gray-500'
                  }`}
                  onClick={() =>
                    distributionMode === 'manual' && handleClueToggle(clue.id)
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {getCategoryIcon(clue.category)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(clue.importance)} bg-opacity-20`}
                      >
                        {clue.importance.toUpperCase()}
                      </span>
                    </div>
                    {distributionMode === 'manual' && (
                      <input
                        type="checkbox"
                        checked={selectedClues.has(clue.id)}
                        onChange={() => handleClueToggle(clue.id)}
                        className="text-mystery-gold"
                      />
                    )}
                  </div>

                  <h5 className="font-semibold text-mystery-light mb-2">
                    {clue.title}
                  </h5>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                    {clue.description}
                  </p>
                  <p className="text-gray-400 text-xs capitalize">
                    {clue.category}
                  </p>
                </div>
              ))}
            </div>

            {distributionMode === 'manual' && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleReleaseSelectedClues}
                  disabled={selectedClues.size === 0}
                  className="px-8"
                >
                  Release {selectedClues.size} Selected Clue
                  {selectedClues.size !== 1 ? 's' : ''}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <span className="text-6xl mb-4 block">✅</span>
            <p className="text-gray-400 mb-2">All clues have been released</p>
            <p className="text-gray-500 text-sm">
              The investigation phase is complete. Players can now make their
              accusations.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};
