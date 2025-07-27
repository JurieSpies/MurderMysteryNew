import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CharacterAssignment } from './CharacterAssignment';
import { useGameStore } from '../../stores/gameStore';
import { useSocketStore } from '../../stores/socketStore';
import { socketService } from '../../services/socketService';
import type { Player } from '../../types/index';

export const GameLobby: React.FC = () => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCharacterAssignment, setShowCharacterAssignment] = useState(false);

  const { currentGame, currentPlayer, isHost, setError } = useGameStore();

  console.log('🎮 GameLobby component rendering...', {
    hasGame: !!currentGame,
    hasPlayer: !!currentPlayer,
    gameCode: currentGame?.code,
    playerName: currentPlayer?.name,
  });

  // Helper functions
  const copyGameCode = useCallback(async () => {
    if (!currentGame?.code) return;

    try {
      await navigator.clipboard.writeText(currentGame.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy game code:', err);
      setError('Failed to copy game code to clipboard');
    }
  }, [currentGame?.code, setError]);

  const { isConnected } = useSocketStore();

  useEffect(() => {
    // Auto-copy game code to clipboard when lobby loads
    if (currentGame?.code) {
      copyGameCode();
    }
  }, [currentGame?.code, copyGameCode]);

  const handleLeaveGame = () => {
    socketService.leaveGame();
    useGameStore.getState().resetGame();
  };

  const handleStartGame = () => {
    if (
      !currentGame ||
      currentGame.players.length < currentGame.scenario.minPlayers
    ) {
      setError(
        `Need at least ${currentGame?.scenario.minPlayers} players to start`
      );
      return;
    }

    socketService.startGame();
  };

  const getPlayerStatusIcon = (player: Player) => {
    if (!player.isConnected) return '🔴';
    if (player.isHost) return '👑';
    if (player.character) return '🎭';
    return '🟢';
  };

  const getPlayerStatusText = (player: Player) => {
    if (!player.isConnected) return 'Disconnected';
    if (player.isHost) return 'Host';
    if (player.character) return `Playing ${player.character.name}`;
    return 'Connected';
  };

  if (!currentGame) {
    return (
      <Card title="Error" subtitle="Game session not found">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Unable to load game session.</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      </Card>
    );
  }

  const canStartGame =
    isHost &&
    currentGame.players.length >= currentGame.scenario.minPlayers &&
    currentGame.players.length <= currentGame.scenario.maxPlayers;

  return (
    <div className="space-y-6">
      {/* Game Info Card */}
      <Card title={currentGame.scenario.title} subtitle="Game Lobby">
        <div className="space-y-4">
          {/* Game Code */}
          <div className="bg-mystery-dark rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm mb-2">Game Code</p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl font-mono font-bold text-mystery-gold tracking-wider">
                {currentGame.code}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={copyGameCode}
                className="ml-2"
              >
                {copySuccess ? '✅' : '📋'}
              </Button>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {copySuccess
                ? 'Copied to clipboard!'
                : 'Share this code with other players'}
            </p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Connection Status:</span>
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Game Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Players:</span>
              <span className="ml-2 text-mystery-light">
                {currentGame.players.length}/{currentGame.scenario.maxPlayers}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Duration:</span>
              <span className="ml-2 text-mystery-light">~90 min</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Players List */}
      <Card
        title="Players"
        subtitle={`${currentGame.players.length} of ${currentGame.scenario.maxPlayers} joined`}
      >
        <div className="space-y-3">
          {currentGame.players.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                player.id === currentPlayer?.id
                  ? 'bg-mystery-gold bg-opacity-10 border-mystery-gold'
                  : 'bg-mystery-dark border-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getPlayerStatusIcon(player)}</span>
                <div>
                  <p className="font-medium text-mystery-light">
                    {player.name}
                    {player.id === currentPlayer?.id && (
                      <span className="ml-2 text-xs text-mystery-gold">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getPlayerStatusText(player)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {player.character && (
                  <span className="px-2 py-1 bg-mystery-purple text-mystery-light text-xs rounded">
                    {player.character.name}
                  </span>
                )}
                {player.isHost && (
                  <span className="px-2 py-1 bg-mystery-gold text-mystery-dark text-xs rounded font-medium">
                    Host
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({
            length:
              currentGame.scenario.maxPlayers - currentGame.players.length,
          }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="flex items-center p-3 rounded-lg border border-dashed border-gray-600"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl text-gray-600">👤</span>
                <p className="text-gray-500 italic">Waiting for player...</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Game Controls */}
      <Card title="Game Controls">
        <div className="space-y-4">
          {/* Minimum players warning */}
          {currentGame.players.length < currentGame.scenario.minPlayers && (
            <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                ⚠️ Need at least {currentGame.scenario.minPlayers} players to
                start the game
              </p>
            </div>
          )}

          {/* Host controls */}
          {isHost ? (
            <div className="space-y-3">
              {/* Character Assignment Button */}
              {currentGame.players.length >=
                currentGame.scenario.minPlayers && (
                <Button
                  onClick={() => setShowCharacterAssignment(true)}
                  variant="secondary"
                  className="w-full"
                >
                  🎭 Assign Characters
                </Button>
              )}

              <Button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full"
                size="lg"
              >
                {canStartGame
                  ? 'Start Game'
                  : `Need ${currentGame.scenario.minPlayers - currentGame.players.length} more players`}
              </Button>

              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  As the host, you control when the game starts and manage the
                  investigation.
                </p>
                {currentGame.players.length >=
                  currentGame.scenario.minPlayers && (
                  <p className="text-gray-400 text-xs">
                    💡 Tip: Assign characters before starting the game for the
                    best experience.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Waiting for the host to start the game...
              </p>
            </div>
          )}

          {/* Leave game button */}
          <div className="pt-4 border-t border-gray-700">
            <Button
              onClick={handleLeaveGame}
              variant="danger"
              size="sm"
              className="w-full"
            >
              Leave Game
            </Button>
          </div>
        </div>
      </Card>

      {/* Character Assignment Modal */}
      {showCharacterAssignment && (
        <CharacterAssignment
          onClose={() => setShowCharacterAssignment(false)}
        />
      )}
    </div>
  );
};
