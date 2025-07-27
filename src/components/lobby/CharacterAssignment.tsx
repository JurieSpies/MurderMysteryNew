import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';
import type { Character } from '../../types/index';

interface CharacterAssignmentProps {
  onClose: () => void;
}

export const CharacterAssignment: React.FC<CharacterAssignmentProps> = ({
  onClose,
}) => {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [isAssigning, setIsAssigning] = useState(false);

  const { currentGame, setError } = useGameStore();

  if (!currentGame) return null;

  const availableCharacters = currentGame.scenario.characters;
  const players = currentGame.players;
  const assignedCharacterIds = Object.values(assignments);

  const handleAssignCharacter = (playerId: string, characterId: string) => {
    setAssignments((prev) => ({
      ...prev,
      [playerId]: characterId,
    }));
  };

  const handleRemoveAssignment = (playerId: string) => {
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[playerId];
      return newAssignments;
    });
  };

  const handleRandomAssignment = () => {
    const shuffledCharacters = [...availableCharacters].sort(
      () => Math.random() - 0.5
    );
    const newAssignments: Record<string, string> = {};

    players.forEach((player, index) => {
      if (index < shuffledCharacters.length) {
        newAssignments[player.id] = shuffledCharacters[index].id;
      }
    });

    setAssignments(newAssignments);
  };

  const handleConfirmAssignments = async () => {
    if (Object.keys(assignments).length !== players.length) {
      setError('All players must be assigned a character');
      return;
    }

    setIsAssigning(true);

    try {
      // Send assignments to server
      for (const [playerId, characterId] of Object.entries(assignments)) {
        socketService.assignCharacter(playerId, characterId);
      }

      onClose();
    } catch (error) {
      console.error('Failed to assign characters:', error);
      setError('Failed to assign characters. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const getCharacterById = (characterId: string): Character | undefined => {
    return availableCharacters.find((char) => char.id === characterId);
  };

  const isCharacterAssigned = (characterId: string): boolean => {
    return assignedCharacterIds.includes(characterId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-mystery-dark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card
          title="Character Assignment"
          subtitle="Assign characters to players"
        >
          <div className="space-y-6">
            {/* Assignment Controls */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRandomAssignment}
                variant="secondary"
                size="sm"
              >
                🎲 Random Assignment
              </Button>
              <Button
                onClick={() => setAssignments({})}
                variant="ghost"
                size="sm"
              >
                🗑️ Clear All
              </Button>
            </div>

            {/* Player Assignments */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-mystery-light">
                Player Assignments
              </h3>
              {players.map((player) => {
                const assignedCharacterId = assignments[player.id];
                const assignedCharacter = assignedCharacterId
                  ? getCharacterById(assignedCharacterId)
                  : null;

                return (
                  <div
                    key={player.id}
                    className="bg-mystery-purple rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {player.isHost ? '👑' : '👤'}
                        </span>
                        <span className="font-medium text-mystery-light">
                          {player.name}
                        </span>
                      </div>
                      {assignedCharacter && (
                        <Button
                          onClick={() => handleRemoveAssignment(player.id)}
                          variant="ghost"
                          size="sm"
                        >
                          ✕
                        </Button>
                      )}
                    </div>

                    {assignedCharacter ? (
                      <div className="bg-mystery-dark rounded p-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">🎭</span>
                          <div>
                            <p className="font-medium text-mystery-light">
                              {assignedCharacter.name}
                            </p>
                            <p className="text-sm text-gray-400">
                              {assignedCharacter.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableCharacters.map((character) => (
                          <Button
                            key={character.id}
                            onClick={() =>
                              handleAssignCharacter(player.id, character.id)
                            }
                            disabled={isCharacterAssigned(character.id)}
                            variant="ghost"
                            size="sm"
                            className={`text-left p-3 h-auto ${
                              isCharacterAssigned(character.id)
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-mystery-gold hover:bg-opacity-20'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">🎭</span>
                              <div>
                                <p className="font-medium text-sm">
                                  {character.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {character.description}
                                </p>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Available Characters Summary */}
            <div className="bg-mystery-purple rounded-lg p-4">
              <h4 className="font-medium text-mystery-light mb-3">
                Available Characters
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableCharacters.map((character) => (
                  <div
                    key={character.id}
                    className={`p-3 rounded border ${
                      isCharacterAssigned(character.id)
                        ? 'bg-mystery-gold bg-opacity-20 border-mystery-gold'
                        : 'bg-mystery-dark border-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🎭</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-mystery-light truncate">
                          {character.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {isCharacterAssigned(character.id)
                            ? 'Assigned'
                            : 'Available'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
              <Button
                onClick={handleConfirmAssignments}
                disabled={
                  Object.keys(assignments).length !== players.length ||
                  isAssigning
                }
                isLoading={isAssigning}
                className="flex-1"
              >
                Confirm Assignments
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                disabled={isAssigning}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            {/* Assignment Status */}
            <div className="text-center text-sm text-gray-400">
              {Object.keys(assignments).length} of {players.length} players
              assigned
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
