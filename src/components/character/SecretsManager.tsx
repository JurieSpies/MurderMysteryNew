import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';

interface RevealedSecret {
  secretIndex: number;
  revealedAt: Date;
  revealedTo: 'all' | 'specific';
  targetPlayers?: string[];
}

export const SecretsManager: React.FC = () => {
  const [revealedSecrets, setRevealedSecrets] = useState<RevealedSecret[]>([]);
  const [selectedSecret, setSelectedSecret] = useState<number | null>(null);
  const [revealTarget, setRevealTarget] = useState<'all' | 'specific'>('all');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isRevealing, setIsRevealing] = useState(false);

  const { currentPlayer, currentGame, setError } = useGameStore();

  if (!currentPlayer?.character || !currentGame) {
    return (
      <Card title="Secrets Manager" subtitle="No character assigned">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🤫</span>
          <p className="text-gray-400">
            You need a character to manage secrets.
          </p>
        </div>
      </Card>
    );
  }

  const character = currentPlayer.character;
  const otherPlayers = currentGame.players.filter(
    (p) => p.id !== currentPlayer.id
  );

  const isSecretRevealed = (secretIndex: number): boolean => {
    return revealedSecrets.some((rs) => rs.secretIndex === secretIndex);
  };

  const getRevealedSecretInfo = (
    secretIndex: number
  ): RevealedSecret | undefined => {
    return revealedSecrets.find((rs) => rs.secretIndex === secretIndex);
  };

  const handleRevealSecret = async (secretIndex: number) => {
    if (isSecretRevealed(secretIndex)) return;

    setIsRevealing(true);
    try {
      // Send secret revelation to server
      const secretText = character.secrets[secretIndex];
      const targetPlayerIds = revealTarget === 'all' ? [] : selectedPlayers;

      await socketService.revealSecret({
        playerId: currentPlayer.id,
        secretIndex,
        secretText,
        revealTarget,
        targetPlayerIds,
      });

      // Update local state
      const newReveal: RevealedSecret = {
        secretIndex,
        revealedAt: new Date(),
        revealedTo: revealTarget,
        targetPlayers:
          revealTarget === 'specific' ? [...selectedPlayers] : undefined,
      };

      setRevealedSecrets((prev) => [...prev, newReveal]);
      setSelectedSecret(null);
      setSelectedPlayers([]);
    } catch (error) {
      console.error('Failed to reveal secret:', error);
      setError('Failed to reveal secret. Please try again.');
    } finally {
      setIsRevealing(false);
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  const getSecretImpact = (secretIndex: number): string => {
    const secret = character.secrets[secretIndex].toLowerCase();
    if (secret.includes('murder') || secret.includes('kill')) return 'high';
    if (
      secret.includes('money') ||
      secret.includes('debt') ||
      secret.includes('steal')
    )
      return 'medium';
    if (secret.includes('affair') || secret.includes('relationship'))
      return 'medium';
    return 'low';
  };

  const getImpactColor = (impact: string): string => {
    switch (impact) {
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
        title="🤫 Secrets Manager"
        subtitle="Manage your character's secrets strategically"
      >
        <div className="space-y-6">
          {/* Secrets Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-mystery-dark rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-mystery-light">
                {character.secrets.length}
              </p>
              <p className="text-gray-400 text-sm">Total Secrets</p>
            </div>
            <div className="bg-mystery-dark rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-400">
                {revealedSecrets.length}
              </p>
              <p className="text-gray-400 text-sm">Revealed</p>
            </div>
            <div className="bg-mystery-dark rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {character.secrets.length - revealedSecrets.length}
              </p>
              <p className="text-gray-400 text-sm">Hidden</p>
            </div>
          </div>

          {/* Secrets List */}
          <div className="space-y-4">
            <h4 className="font-semibold text-mystery-light">Your Secrets</h4>
            {character.secrets.map((secret, index) => {
              const isRevealed = isSecretRevealed(index);
              const revealInfo = getRevealedSecretInfo(index);
              const impact = getSecretImpact(index);

              return (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    isRevealed
                      ? 'border-red-500 bg-red-900 bg-opacity-20'
                      : 'border-gray-600 bg-mystery-dark'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">🔐</span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getImpactColor(impact)} bg-opacity-20`}
                        >
                          {impact.toUpperCase()} IMPACT
                        </span>
                        {isRevealed && (
                          <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            REVEALED
                          </span>
                        )}
                      </div>

                      <p className="text-gray-300 text-sm leading-relaxed mb-3">
                        {secret}
                      </p>

                      {isRevealed && revealInfo && (
                        <div className="bg-red-800 bg-opacity-30 rounded p-3 text-xs">
                          <p className="text-red-200">
                            <strong>Revealed:</strong>{' '}
                            {revealInfo.revealedAt.toLocaleTimeString()}
                          </p>
                          <p className="text-red-200">
                            <strong>To:</strong>{' '}
                            {revealInfo.revealedTo === 'all'
                              ? 'All players'
                              : `${revealInfo.targetPlayers?.length} selected players`}
                          </p>
                        </div>
                      )}
                    </div>

                    {!isRevealed && (
                      <Button
                        onClick={() =>
                          setSelectedSecret(
                            selectedSecret === index ? null : index
                          )
                        }
                        variant="danger"
                        size="sm"
                      >
                        Reveal
                      </Button>
                    )}
                  </div>

                  {/* Reveal Options */}
                  {selectedSecret === index && !isRevealed && (
                    <div className="mt-4 pt-4 border-t border-gray-600">
                      <h5 className="font-medium text-mystery-light mb-3">
                        Reveal Options
                      </h5>

                      {/* Reveal Target */}
                      <div className="space-y-3">
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="revealTarget"
                              value="all"
                              checked={revealTarget === 'all'}
                              onChange={(e) =>
                                setRevealTarget(
                                  e.target.value as 'all' | 'specific'
                                )
                              }
                              className="text-mystery-gold"
                            />
                            <span className="text-gray-300 text-sm">
                              Reveal to all players
                            </span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="revealTarget"
                              value="specific"
                              checked={revealTarget === 'specific'}
                              onChange={(e) =>
                                setRevealTarget(
                                  e.target.value as 'all' | 'specific'
                                )
                              }
                              className="text-mystery-gold"
                            />
                            <span className="text-gray-300 text-sm">
                              Reveal to specific players
                            </span>
                          </label>
                        </div>

                        {/* Player Selection */}
                        {revealTarget === 'specific' && (
                          <div className="space-y-2">
                            <p className="text-gray-400 text-sm">
                              Select players to reveal to:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {otherPlayers.map((player) => (
                                <label
                                  key={player.id}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPlayers.includes(
                                      player.id
                                    )}
                                    onChange={() =>
                                      handlePlayerToggle(player.id)
                                    }
                                    className="text-mystery-gold"
                                  />
                                  <span className="text-gray-300 text-sm">
                                    {player.name}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Confirm Button */}
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleRevealSecret(index)}
                            disabled={
                              isRevealing ||
                              (revealTarget === 'specific' &&
                                selectedPlayers.length === 0)
                            }
                            isLoading={isRevealing}
                            variant="danger"
                            size="sm"
                          >
                            Confirm Reveal
                          </Button>
                          <Button
                            onClick={() => setSelectedSecret(null)}
                            variant="ghost"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Strategy Tips */}
          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
            <h5 className="font-medium text-yellow-400 mb-2">
              💡 Strategic Tips
            </h5>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• Revealing secrets can provide alibis or shift suspicion</li>
              <li>• High-impact secrets should be revealed carefully</li>
              <li>• Consider timing - early reveals vs. late game reveals</li>
              <li>• Selective reveals can build trust with specific players</li>
              <li>• Some secrets might be better kept hidden entirely</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
