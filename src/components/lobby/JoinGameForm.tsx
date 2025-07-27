import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';
import {
  getFromStorage,
  setToStorage,
  isValidGameCode,
} from '../../utils/helpers';
import { STORAGE_KEYS } from '../../utils/constants';

export const JoinGameForm: React.FC = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [errors, setErrors] = useState<{
    playerName?: string;
    gameCode?: string;
  }>({});

  const { isLoading, error, setLoading, setError, setHostStatus } =
    useGameStore();

  useEffect(() => {
    // Load saved player name
    const savedName = getFromStorage(STORAGE_KEYS.PLAYER_NAME, '');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

  const validateForm = (): boolean => {
    const newErrors: { playerName?: string; gameCode?: string } = {};

    // Validate player name
    if (!playerName.trim()) {
      newErrors.playerName = 'Player name is required';
    } else if (playerName.trim().length < 2) {
      newErrors.playerName = 'Player name must be at least 2 characters';
    } else if (playerName.trim().length > 20) {
      newErrors.playerName = 'Player name must be less than 20 characters';
    }

    // Validate game code
    if (!gameCode.trim()) {
      newErrors.gameCode = 'Game code is required';
    } else if (!isValidGameCode(gameCode.trim().toUpperCase())) {
      newErrors.gameCode =
        'Game code must be 6 characters (letters and numbers)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinGame = async () => {
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

      // Set host status to false (joining player)
      setHostStatus(false);

      // Join the game
      const response = await socketService.joinGame(
        gameCode.trim().toUpperCase(),
        playerName.trim()
      );
      console.log('Joined game successfully:', response);

      // The store will be updated automatically via socket events
      // Just stop loading state
      setLoading(false);
      console.log('✅ Game join completed, store should update automatically');
    } catch (err) {
      console.error('Failed to join game:', err);
      setError('Failed to connect to server. Please try again.');
      setLoading(false);
    }
  };

  const handleGameCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setGameCode(value);
  };

  return (
    <Card
      title="Join Game"
      subtitle="Enter a game code to join an existing game"
    >
      <div className="space-y-6">
        <Input
          label="Game Code"
          value={gameCode}
          onChange={handleGameCodeChange}
          placeholder="ABC123"
          error={errors.gameCode}
          maxLength={6}
          style={{ textTransform: 'uppercase' }}
          helperText="Enter the 6-character code provided by the game host"
        />

        <Input
          label="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          error={errors.playerName}
          maxLength={20}
        />

        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleJoinGame}
          isLoading={isLoading}
          disabled={!playerName.trim() || !gameCode.trim()}
          className="w-full"
        >
          Join Game
        </Button>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Ask the game host for the 6-character game code to join their
            session.
          </p>
        </div>
      </div>
    </Card>
  );
};
