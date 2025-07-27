import React from 'react';
import { Card } from '../ui/Card';
import type { Character } from '../../types/index';

interface CharacterProfileProps {
  character: Character;
  isOwnCharacter?: boolean;
  showPrivateInfo?: boolean;
}

export const CharacterProfile: React.FC<CharacterProfileProps> = ({
  character,
  isOwnCharacter = false,
  showPrivateInfo = false,
}) => {
  const getRelationshipIcon = (relationship: string): string => {
    switch (relationship.toLowerCase()) {
      case 'family':
        return '👨‍👩‍👧‍👦';
      case 'friend':
        return '🤝';
      case 'enemy':
        return '⚔️';
      case 'romantic':
        return '💕';
      case 'business':
        return '💼';
      case 'servant':
        return '🏠';
      case 'doctor':
        return '⚕️';
      case 'colleague':
        return '👥';
      default:
        return '🔗';
    }
  };

  const getRelationshipColor = (relationship: string): string => {
    switch (relationship.toLowerCase()) {
      case 'family':
        return 'text-blue-400';
      case 'friend':
        return 'text-green-400';
      case 'enemy':
        return 'text-red-400';
      case 'romantic':
        return 'text-pink-400';
      case 'business':
        return 'text-yellow-400';
      case 'servant':
        return 'text-purple-400';
      case 'doctor':
        return 'text-cyan-400';
      case 'colleague':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card
      title={character.name}
      subtitle={isOwnCharacter ? 'Your Character' : 'Character Profile'}
      className={isOwnCharacter ? 'border-mystery-gold' : ''}
    >
      <div className="space-y-6">
        {/* Character Avatar/Icon */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-mystery-dark rounded-full flex items-center justify-center text-4xl mb-3">
            🎭
          </div>
          {isOwnCharacter && (
            <span className="inline-block px-3 py-1 bg-mystery-gold text-mystery-dark text-sm font-medium rounded-full">
              Your Character
            </span>
          )}
        </div>

        {/* Public Description */}
        <div>
          <h4 className="font-semibold text-mystery-light mb-2">Description</h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {character.description}
          </p>
        </div>

        {/* Public Information */}
        <div>
          <h4 className="font-semibold text-mystery-light mb-3">
            Public Information
          </h4>
          <div className="bg-mystery-dark rounded-lg p-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {character.publicInfo}
            </p>
          </div>
        </div>

        {/* Private Information (only for own character) */}
        {isOwnCharacter && showPrivateInfo && (
          <div>
            <h4 className="font-semibold text-mystery-light mb-3 flex items-center">
              🔒 Private Background
            </h4>
            <div className="bg-mystery-gold bg-opacity-10 border border-mystery-gold rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {character.privateInfo}
              </p>
            </div>
          </div>
        )}

        {/* Relationships */}
        {Object.keys(character.relationships).length > 0 && (
          <div>
            <h4 className="font-semibold text-mystery-light mb-3">
              Relationships
            </h4>
            <div className="space-y-2">
              {Object.entries(character.relationships).map(
                ([characterId, relationship]) => (
                  <div
                    key={characterId}
                    className="flex items-center justify-between bg-mystery-dark rounded-lg p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {getRelationshipIcon(relationship)}
                      </span>
                      <div>
                        <p className="text-mystery-light text-sm font-medium">
                          {characterId
                            .replace('char_', '')
                            .replace('_', ' ')
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </p>
                        <p
                          className={`text-xs ${getRelationshipColor(relationship)}`}
                        >
                          {relationship}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Character Secrets (only for own character) */}
        {isOwnCharacter && character.secrets.length > 0 && (
          <div>
            <h4 className="font-semibold text-mystery-light mb-3 flex items-center">
              🤫 Your Secrets
              <span className="ml-2 text-xs bg-mystery-gold text-mystery-dark px-2 py-1 rounded-full">
                {character.secrets.length}
              </span>
            </h4>
            <div className="space-y-3">
              {character.secrets.map((secret, index) => (
                <div
                  key={index}
                  className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg mt-0.5">🔐</span>
                    <div className="flex-1">
                      <p className="text-red-300 text-sm leading-relaxed">
                        {secret}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-gray-400 text-xs">
                💡 These secrets are known only to you. Decide carefully when
                and if to reveal them.
              </p>
            </div>
          </div>
        )}

        {/* Character Stats/Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Secrets</p>
            <p className="text-mystery-light font-semibold">
              {isOwnCharacter ? character.secrets.length : '?'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Relationships</p>
            <p className="text-mystery-light font-semibold">
              {Object.keys(character.relationships).length}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
