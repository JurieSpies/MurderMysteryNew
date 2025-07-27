import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import type { Accusation } from '../../types/index';

export const AccusationSummary: React.FC = () => {
  const [selectedAccusation, setSelectedAccusation] =
    useState<Accusation | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const { currentGame, currentPlayer, isHost } = useGameStore();

  if (!currentGame) return null;

  const accusations = currentGame.accusations || [];
  const totalPlayers = currentGame.players.length;
  const submittedCount = accusations.length;

  const getAccusationStats = () => {
    const murdererCounts: Record<string, number> = {};
    const weaponCounts: Record<string, number> = {};
    const locationCounts: Record<string, number> = {};

    accusations.forEach((acc) => {
      murdererCounts[acc.murderer] = (murdererCounts[acc.murderer] || 0) + 1;
      weaponCounts[acc.weapon] = (weaponCounts[acc.weapon] || 0) + 1;
      locationCounts[acc.location] = (locationCounts[acc.location] || 0) + 1;
    });

    return { murdererCounts, weaponCounts, locationCounts };
  };

  const { murdererCounts, weaponCounts, locationCounts } = getAccusationStats();

  const getMostPopular = (counts: Record<string, number>) => {
    const entries = Object.entries(counts);
    if (entries.length === 0) return null;
    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );
  };

  const handleViewAccusation = (accusation: Accusation) => {
    setSelectedAccusation(accusation);
  };

  const handleCloseDetail = () => {
    setSelectedAccusation(null);
  };

  return (
    <div className="space-y-6">
      <Card
        title="📊 Accusation Summary"
        subtitle="All player theories collected"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Submissions Progress</span>
            <span className="text-sm text-mystery-light">
              {submittedCount}/{totalPlayers} players
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-mystery-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${(submittedCount / totalPlayers) * 100}%` }}
            />
          </div>
        </div>

        {/* Statistics */}
        {accusations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-mystery-dark rounded-lg p-4">
              <h4 className="font-semibold text-mystery-light mb-2">
                Most Accused
              </h4>
              {getMostPopular(murdererCounts) ? (
                <div>
                  <p className="text-mystery-gold font-medium">
                    {getMostPopular(murdererCounts)![0]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {getMostPopular(murdererCounts)![1]} vote
                    {getMostPopular(murdererCounts)![1] !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>

            <div className="bg-mystery-dark rounded-lg p-4">
              <h4 className="font-semibold text-mystery-light mb-2">
                Popular Weapon
              </h4>
              {getMostPopular(weaponCounts) ? (
                <div>
                  <p className="text-mystery-gold font-medium">
                    {getMostPopular(weaponCounts)![0]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {getMostPopular(weaponCounts)![1]} vote
                    {getMostPopular(weaponCounts)![1] !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>

            <div className="bg-mystery-dark rounded-lg p-4">
              <h4 className="font-semibold text-mystery-light mb-2">
                Popular Location
              </h4>
              {getMostPopular(locationCounts) ? (
                <div>
                  <p className="text-mystery-gold font-medium">
                    {getMostPopular(locationCounts)![0]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {getMostPopular(locationCounts)![1]} vote
                    {getMostPopular(locationCounts)![1] !== 1 ? 's' : ''}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No data yet</p>
              )}
            </div>
          </div>
        )}

        {/* Toggle Details */}
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-mystery-light">
            Player Accusations
          </h4>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="sm"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </Button>
        </div>

        {/* Accusations List */}
        <div className="space-y-3">
          {accusations.map((accusation) => (
            <div
              key={accusation.playerId}
              className="bg-mystery-dark border border-gray-600 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">⚖️</span>
                  <div>
                    <p className="font-medium text-mystery-light">
                      {accusation.playerName}
                      {accusation.playerId === currentPlayer?.id && (
                        <span className="ml-2 text-mystery-gold text-sm">
                          (You)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-400">
                      Submitted{' '}
                      {new Date(accusation.submittedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                    Submitted
                  </span>
                  <Button
                    onClick={() => handleViewAccusation(accusation)}
                    variant="ghost"
                    size="sm"
                  >
                    View
                  </Button>
                </div>
              </div>

              {showDetails && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Murderer:</span>
                      <p className="text-mystery-light font-medium">
                        {accusation.murderer}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Weapon:</span>
                      <p className="text-mystery-light font-medium">
                        {accusation.weapon}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Location:</span>
                      <p className="text-mystery-light font-medium">
                        {accusation.location}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-gray-400 text-sm">Motive:</span>
                    <p className="text-mystery-light text-sm mt-1">
                      {accusation.motive}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pending Players */}
          {currentGame.players
            .filter(
              (player) => !accusations.find((acc) => acc.playerId === player.id)
            )
            .map((player) => (
              <div
                key={player.id}
                className="bg-mystery-purple bg-opacity-30 border border-gray-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg opacity-50">⏳</span>
                    <div>
                      <p className="font-medium text-mystery-light">
                        {player.name}
                        {player.id === currentPlayer?.id && (
                          <span className="ml-2 text-mystery-gold text-sm">
                            (You)
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">
                        Accusation pending...
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-1 bg-yellow-900 text-yellow-300 text-xs rounded-full">
                    Pending
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Host Controls */}
        {isHost && submittedCount === totalPlayers && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-mystery-light mb-4">
                All accusations have been submitted!
              </p>
              <Button size="lg" className="px-8">
                🎭 Reveal the Truth
              </Button>
            </div>
          </div>
        )}

        {/* Waiting Message */}
        {submittedCount < totalPlayers && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <p className="text-gray-400 mb-2">
                Waiting for {totalPlayers - submittedCount} more player
                {totalPlayers - submittedCount !== 1 ? 's' : ''} to submit their
                accusations...
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
          </div>
        )}
      </Card>

      {/* Accusation Detail Modal */}
      {selectedAccusation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-mystery-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card
              title={`${selectedAccusation.playerName}'s Accusation`}
              subtitle="Detailed theory"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-mystery-purple rounded-lg p-3">
                    <h5 className="font-medium text-mystery-light mb-1">
                      Murderer
                    </h5>
                    <p className="text-mystery-gold">
                      {selectedAccusation.murderer}
                    </p>
                  </div>
                  <div className="bg-mystery-purple rounded-lg p-3">
                    <h5 className="font-medium text-mystery-light mb-1">
                      Weapon
                    </h5>
                    <p className="text-mystery-gold">
                      {selectedAccusation.weapon}
                    </p>
                  </div>
                  <div className="bg-mystery-purple rounded-lg p-3">
                    <h5 className="font-medium text-mystery-light mb-1">
                      Location
                    </h5>
                    <p className="text-mystery-gold">
                      {selectedAccusation.location}
                    </p>
                  </div>
                  <div className="bg-mystery-purple rounded-lg p-3">
                    <h5 className="font-medium text-mystery-light mb-1">
                      Motive
                    </h5>
                    <p className="text-mystery-gold">
                      {selectedAccusation.motive}
                    </p>
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-mystery-light mb-2">
                    Theory Explanation
                  </h5>
                  <div className="bg-mystery-dark rounded-lg p-4">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedAccusation.explanation}
                    </p>
                  </div>
                </div>

                <div className="text-center text-sm text-gray-400">
                  Submitted on{' '}
                  {new Date(selectedAccusation.submittedAt).toLocaleString()}
                </div>

                <div className="flex justify-center">
                  <Button onClick={handleCloseDetail} variant="ghost">
                    Close
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
