import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';

interface TimerState {
  totalTime: number; // in seconds
  remainingTime: number;
  isActive: boolean;
  isPaused: boolean;
  currentRound: number;
  totalRounds: number;
}

export const InvestigationTimer: React.FC = () => {
  const [timerState, setTimerState] = useState<TimerState>({
    totalTime: 1800, // 30 minutes default
    remainingTime: 1800,
    isActive: false,
    isPaused: false,
    currentRound: 1,
    totalRounds: 3,
  });

  const [customTime, setCustomTime] = useState(30); // minutes
  const [roundDuration, setRoundDuration] = useState(10); // minutes per round

  const { isHost, setError } = useGameStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      timerState.isActive &&
      !timerState.isPaused &&
      timerState.remainingTime > 0
    ) {
      interval = setInterval(() => {
        setTimerState((prev) => {
          const newRemainingTime = prev.remainingTime - 1;

          if (newRemainingTime <= 0) {
            // Timer finished
            handleTimerComplete();
            return { ...prev, remainingTime: 0, isActive: false };
          }

          return { ...prev, remainingTime: newRemainingTime };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [
    timerState.isActive,
    timerState.isPaused,
    timerState.remainingTime,
    handleTimerComplete,
  ]);

  const handleTimerComplete = useCallback(async () => {
    try {
      if (timerState.currentRound < timerState.totalRounds) {
        // Move to next round
        await socketService.nextInvestigationRound();
      } else {
        // Investigation complete, move to accusation phase
        await socketService.endInvestigationPhase();
      }
    } catch (error) {
      console.error('Failed to handle timer completion:', error);
      setError('Failed to progress to next phase');
    }
  }, [timerState.currentRound, timerState.totalRounds, setError]);

  const startTimer = async (duration?: number) => {
    const timeInSeconds = duration ? duration * 60 : customTime * 60;

    try {
      await socketService.startInvestigationTimer(timeInSeconds);
      setTimerState((prev) => ({
        ...prev,
        totalTime: timeInSeconds,
        remainingTime: timeInSeconds,
        isActive: true,
        isPaused: false,
      }));
    } catch (error) {
      console.error('Failed to start timer:', error);
      setError('Failed to start investigation timer');
    }
  };

  const pauseTimer = async () => {
    try {
      await socketService.pauseInvestigationTimer();
      setTimerState((prev) => ({ ...prev, isPaused: true }));
    } catch (error) {
      console.error('Failed to pause timer:', error);
      setError('Failed to pause timer');
    }
  };

  const resumeTimer = async () => {
    try {
      await socketService.resumeInvestigationTimer();
      setTimerState((prev) => ({ ...prev, isPaused: false }));
    } catch (error) {
      console.error('Failed to resume timer:', error);
      setError('Failed to resume timer');
    }
  };

  const stopTimer = async () => {
    try {
      await socketService.stopInvestigationTimer();
      setTimerState((prev) => ({
        ...prev,
        isActive: false,
        isPaused: false,
        remainingTime: prev.totalTime,
      }));
    } catch (error) {
      console.error('Failed to stop timer:', error);
      setError('Failed to stop timer');
    }
  };

  const addTime = async (minutes: number) => {
    const additionalSeconds = minutes * 60;
    try {
      await socketService.addInvestigationTime(additionalSeconds);
      setTimerState((prev) => ({
        ...prev,
        remainingTime: prev.remainingTime + additionalSeconds,
        totalTime: prev.totalTime + additionalSeconds,
      }));
    } catch (error) {
      console.error('Failed to add time:', error);
      setError('Failed to add time');
    }
  };

  const nextRound = async () => {
    try {
      await socketService.nextInvestigationRound();
      setTimerState((prev) => ({
        ...prev,
        currentRound: Math.min(prev.currentRound + 1, prev.totalRounds),
        remainingTime: roundDuration * 60,
        totalTime: roundDuration * 60,
        isActive: true,
        isPaused: false,
      }));
    } catch (error) {
      console.error('Failed to start next round:', error);
      setError('Failed to start next round');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (): string => {
    const percentage = (timerState.remainingTime / timerState.totalTime) * 100;
    if (percentage <= 10) return 'text-red-400';
    if (percentage <= 25) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressPercentage = (): number => {
    return (
      ((timerState.totalTime - timerState.remainingTime) /
        timerState.totalTime) *
      100
    );
  };

  return (
    <div className="space-y-6">
      <Card
        title="⏰ Investigation Timer"
        subtitle="Manage investigation rounds and timing"
      >
        {/* Timer Display */}
        <div className="text-center mb-6">
          <div
            className={`text-6xl font-mono font-bold mb-2 ${getTimeColor()}`}
          >
            {formatTime(timerState.remainingTime)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                timerState.remainingTime <= timerState.totalTime * 0.1
                  ? 'bg-red-500'
                  : timerState.remainingTime <= timerState.totalTime * 0.25
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${100 - getProgressPercentage()}%` }}
            />
          </div>

          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <span>
              Round {timerState.currentRound} of {timerState.totalRounds}
            </span>
            <span>•</span>
            <span>
              {timerState.isActive
                ? timerState.isPaused
                  ? 'Paused'
                  : 'Active'
                : 'Stopped'}
            </span>
          </div>
        </div>

        {/* Host Controls */}
        {isHost ? (
          <div className="space-y-4">
            {/* Timer Controls */}
            {!timerState.isActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-mystery-light mb-2">
                      Custom Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={customTime}
                      onChange={(e) =>
                        setCustomTime(parseInt(e.target.value) || 30)
                      }
                      className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={() => startTimer()} className="w-full">
                      Start Custom Timer
                    </Button>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => startTimer(roundDuration)}
                      variant="secondary"
                      className="w-full"
                    >
                      Start Round ({roundDuration}m)
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => startTimer(15)}
                    variant="ghost"
                    size="sm"
                  >
                    15 min
                  </Button>
                  <Button
                    onClick={() => startTimer(30)}
                    variant="ghost"
                    size="sm"
                  >
                    30 min
                  </Button>
                  <Button
                    onClick={() => startTimer(45)}
                    variant="ghost"
                    size="sm"
                  >
                    45 min
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Active Timer Controls */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {timerState.isPaused ? (
                    <Button onClick={resumeTimer} variant="secondary">
                      ▶️ Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseTimer} variant="secondary">
                      ⏸️ Pause
                    </Button>
                  )}
                  <Button onClick={stopTimer} variant="danger">
                    ⏹️ Stop
                  </Button>
                  <Button onClick={() => addTime(5)} variant="ghost">
                    +5 min
                  </Button>
                  <Button onClick={() => addTime(10)} variant="ghost">
                    +10 min
                  </Button>
                </div>

                {/* Round Controls */}
                {timerState.currentRound < timerState.totalRounds && (
                  <div className="text-center">
                    <Button onClick={nextRound} variant="secondary">
                      Next Round ({timerState.currentRound + 1}/
                      {timerState.totalRounds})
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Round Settings */}
            <div className="bg-mystery-dark rounded-lg p-4">
              <h4 className="font-semibold text-mystery-light mb-3">
                Round Settings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-mystery-light mb-2">
                    Round Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    value={roundDuration}
                    onChange={(e) =>
                      setRoundDuration(parseInt(e.target.value) || 10)
                    }
                    className="w-full bg-mystery-purple border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
                    disabled={timerState.isActive}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mystery-light mb-2">
                    Total Rounds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={timerState.totalRounds}
                    onChange={(e) =>
                      setTimerState((prev) => ({
                        ...prev,
                        totalRounds: parseInt(e.target.value) || 3,
                      }))
                    }
                    className="w-full bg-mystery-purple border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
                    disabled={timerState.isActive}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-400">
              The host controls the investigation timer and rounds.
            </p>
          </div>
        )}

        {/* Phase Information */}
        <div className="bg-mystery-purple rounded-lg p-4">
          <h4 className="font-semibold text-mystery-light mb-2">
            Investigation Phase
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            Use this time to examine clues, discuss with other players, and
            gather information. The host can release new clues during the
            investigation or set up timed releases.
          </p>
          {timerState.remainingTime <= 300 && timerState.isActive && (
            <div className="mt-3 p-3 bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded">
              <p className="text-yellow-400 text-sm">
                ⚠️ Less than 5 minutes remaining! Prepare your final thoughts.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
