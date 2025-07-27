import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CharacterProfile } from './CharacterProfile';
import { useGameStore } from '../../stores/gameStore';
import type { Character } from '../../types/index';

export const CharacterOverview: React.FC = () => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const { currentGame, currentPlayer } = useGameStore();

  if (!currentGame) return null;

  const characters = currentGame.scenario.characters;
  const players = currentGame.players;

  // Get player assigned to a character
  const getPlayerForCharacter = (characterId: string) => {
    return players.find((player) => player.character?.id === characterId);
  };

  // Check if character is assigned to current player
  const isOwnCharacter = (characterId: string) => {
    return currentPlayer?.character?.id === characterId;
  };

  const handleCharacterClick = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleCloseProfile = () => {
    setSelectedCharacter(null);
  };

  return (
    <div className="space-y-6">
      <Card title="Characters" subtitle="All characters in this mystery">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => {
            const assignedPlayer = getPlayerForCharacter(character.id);
            const isOwn = isOwnCharacter(character.id);

            return (
              <div
                key={character.id}
                className={`bg-mystery-dark rounded-lg p-4 border cursor-pointer transition-all hover:bg-mystery-purple ${
                  isOwn
                    ? 'border-mystery-gold bg-mystery-gold bg-opacity-10'
                    : assignedPlayer
                      ? 'border-gray-600'
                      : 'border-gray-700 opacity-75'
                }`}
                onClick={() => handleCharacterClick(character)}
              >
                {/* Character Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🎭</span>
                    <div>
                      <h4 className="font-semibold text-mystery-light text-sm">
                        {character.name}
                      </h4>
                      {assignedPlayer && (
                        <p className="text-xs text-gray-400">
                          Played by {assignedPlayer.name}
                          {isOwn && (
                            <span className="text-mystery-gold"> (You)</span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {isOwn && (
                    <span className="px-2 py-1 bg-mystery-gold text-mystery-dark text-xs rounded-full font-medium">
                      You
                    </span>
                  )}
                </div>

                {/* Character Description */}
                <p className="text-gray-300 text-xs leading-relaxed mb-3 line-clamp-3">
                  {character.description}
                </p>

                {/* Character Stats */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span>🔗</span>
                      <span className="text-gray-400">
                        {Object.keys(character.relationships).length} relations
                      </span>
                    </div>
                    {isOwn && (
                      <div className="flex items-center space-x-1">
                        <span>🤫</span>
                        <span className="text-gray-400">
                          {character.secrets.length} secrets
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        assignedPlayer ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    ></span>
                    <span className="text-gray-400">
                      {assignedPlayer ? 'Assigned' : 'Available'}
                    </span>
                  </div>
                </div>

                {/* Click indicator */}
                <div className="mt-3 text-center">
                  <span className="text-xs text-gray-500">
                    Click to view details
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-mystery-light font-semibold">
                {characters.length}
              </p>
              <p className="text-gray-400 text-xs">Total Characters</p>
            </div>
            <div>
              <p className="text-mystery-light font-semibold">
                {
                  characters.filter((char) => getPlayerForCharacter(char.id))
                    .length
                }
              </p>
              <p className="text-gray-400 text-xs">Assigned</p>
            </div>
            <div>
              <p className="text-mystery-light font-semibold">
                {characters.reduce(
                  (total, char) =>
                    total + Object.keys(char.relationships).length,
                  0
                )}
              </p>
              <p className="text-gray-400 text-xs">Total Relationships</p>
            </div>
            <div>
              <p className="text-mystery-light font-semibold">
                {currentPlayer?.character
                  ? currentPlayer.character.secrets.length
                  : 0}
              </p>
              <p className="text-gray-400 text-xs">Your Secrets</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Character Detail Modal */}
      {selectedCharacter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-mystery-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-mystery-light">
                  Character Details
                </h3>
                <Button onClick={handleCloseProfile} variant="ghost" size="sm">
                  ✕
                </Button>
              </div>

              <CharacterProfile
                character={selectedCharacter}
                isOwnCharacter={isOwnCharacter(selectedCharacter.id)}
                showPrivateInfo={isOwnCharacter(selectedCharacter.id)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
