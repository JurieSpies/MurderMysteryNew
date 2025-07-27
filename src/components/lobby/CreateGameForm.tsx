import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';
import { scenarioService } from '../../services/scenarioService';
import { getFromStorage, setToStorage } from '../../utils/helpers';
import { STORAGE_KEYS } from '../../utils/constants';

export const CreateGameForm: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const [errors, setErrors] = useState<{ playerName?: string }>({});

  const { isLoading, error, setLoading, setError, setHostStatus } =
    useGameStore();
  const scenarios = scenarioService.getAllScenarioPreviews();

  useEffect(() => {
    // Load saved player name
    const savedName = getFromStorage(STORAGE_KEYS.PLAYER_NAME, '');
    if (savedName) {
      setPlayerName(savedName);
    }

    // Set default scenario
    if (scenarios.length > 0 && !selectedScenario) {
      setSelectedScenario(scenarios[0].id);
    }
  }, [scenarios, selectedScenario]);

  const validateForm = (): boolean => {
    const newErrors: { playerName?: string } = {};

    if (!playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (playerName.trim().length < 2) {
      newErrors.playerName = 'Player name must be at least 2 characters';
    } else if (playerName.trim().length > 20) {
      newErrors.playerName = 'Player name must be less than 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateGame = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      // Save player name for future use
      setToStorage(STORAGE_KEYS.PLAYER_NAME, playerName.trim());

      // Connect to server if not already connected
      if (!socketService.isConnected()) {
        await socketService.connect();
      }

      // Set host status
      setHostStatus(true);

      // Create the game
      const response = await socketService.createGame(
        playerName.trim(),
        selectedScenario || undefined
      );
      console.log('Game created successfully:', response);

      // The store will be updated automatically via socket events
      // Just stop loading state
      setLoading(false);
      console.log(
        '✅ Game creation completed, store should update automatically'
      );
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card
      title="Create New Game"
      subtitle="Start a new murder mystery game for your friends"
    >
      <div className="space-y-6">
        <Input
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          error={errors.playerName}
          maxLength={20}
        />

        <div>
          <label className="block text-sm font-medium text-mystery-light mb-2">
            Choose Scenario
          </label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full px-4 py-3 bg-mystery-purple border border-gray-600 rounded-lg text-mystery-light focus:outline-none focus:ring-2 focus:ring-mystery-gold focus:border-transparent transition-all duration-200"
          >
            {scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.title} ({scenario.minPlayers}-{scenario.maxPlayers}{' '}
                players, {scenario.estimatedDuration}min)
              </option>
            ))}
          </select>
        </div>

        {selectedScenario && (
          <div className="bg-mystery-dark rounded-lg p-4">
            <h4 className="font-mystery font-semibold text-mystery-light mb-2">
              {scenarios.find((s) => s.id === selectedScenario)?.title}
            </h4>
            <p className="text-gray-400 text-sm mb-3">
              {scenarios.find((s) => s.id === selectedScenario)?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {scenarios
                .find((s) => s.id === selectedScenario)
                ?.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-mystery-gold bg-opacity-20 text-mystery-gold text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleCreateGame}
          isLoading={isLoading}
          disabled={!playerName.trim() || !selectedScenario}
          className="w-full"
        >
          Create Game
        </Button>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            As the host, you'll be able to manage the game and assign characters
            to players.
          </p>
        </div>
      </div>
    </Card>
  );
};
