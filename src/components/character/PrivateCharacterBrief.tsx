import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';

export const PrivateCharacterBrief: React.FC = () => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [revealedSecrets, setRevealedSecrets] = useState<Set<number>>(
    new Set()
  );

  const { currentPlayer } = useGameStore();

  if (!currentPlayer?.character) {
    return (
      <Card title="Character Brief" subtitle="No character assigned">
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">🎭</span>
          <p className="text-gray-400 mb-4">
            You haven't been assigned a character yet.
          </p>
          <p className="text-gray-500 text-sm">
            Wait for the host to assign characters before the game begins.
          </p>
        </div>
      </Card>
    );
  }

  const character = currentPlayer.character;

  const handleRevealSecret = (index: number) => {
    setRevealedSecrets((prev) => new Set([...prev, index]));
  };

  const getPersonalityTraits = () => {
    // Extract personality traits from private info (this could be enhanced with structured data)
    const traits = [];
    if (character.privateInfo.toLowerCase().includes('ambitious'))
      traits.push('Ambitious');
    if (character.privateInfo.toLowerCase().includes('secretive'))
      traits.push('Secretive');
    if (character.privateInfo.toLowerCase().includes('loyal'))
      traits.push('Loyal');
    if (character.privateInfo.toLowerCase().includes('suspicious'))
      traits.push('Suspicious');
    if (character.privateInfo.toLowerCase().includes('wealthy'))
      traits.push('Wealthy');
    if (character.privateInfo.toLowerCase().includes('desperate'))
      traits.push('Desperate');
    return traits.length > 0 ? traits : ['Mysterious'];
  };

  const getObjectives = () => {
    // This could be enhanced with structured objectives data
    return [
      'Protect your secrets from being discovered',
      'Gather information about other characters',
      'Maintain your public reputation',
      'Survive the investigation without suspicion',
    ];
  };

  return (
    <div className="space-y-6">
      {/* Character Identity */}
      <Card
        title={`${character.name} - Your Character`}
        subtitle="Private Character Brief"
      >
        <div className="space-y-6">
          {/* Character Avatar */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-mystery-gold bg-opacity-20 border-2 border-mystery-gold rounded-full flex items-center justify-center text-5xl mb-4">
              🎭
            </div>
            <div className="inline-block px-4 py-2 bg-mystery-gold text-mystery-dark rounded-full font-semibold">
              Your Character
            </div>
          </div>

          {/* Public Description */}
          <div>
            <h4 className="font-semibold text-mystery-light mb-2">
              Public Description
            </h4>
            <div className="bg-mystery-dark rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {character.description}
              </p>
            </div>
          </div>

          {/* Public Information */}
          <div>
            <h4 className="font-semibold text-mystery-light mb-2">
              What Others Know About You
            </h4>
            <div className="bg-mystery-dark rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {character.publicInfo}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Private Background */}
      <Card
        title="🔒 Your Private Background"
        subtitle="Information only you know"
      >
        <div className="space-y-4">
          <div className="bg-mystery-gold bg-opacity-10 border border-mystery-gold rounded-lg p-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {character.privateInfo}
            </p>
          </div>

          {/* Personality Traits */}
          <div>
            <h5 className="font-medium text-mystery-light mb-2">
              Your Personality Traits
            </h5>
            <div className="flex flex-wrap gap-2">
              {getPersonalityTraits().map((trait, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-mystery-purple text-mystery-light text-sm rounded-full"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>

          {/* Objectives */}
          <div>
            <h5 className="font-medium text-mystery-light mb-2">
              Your Objectives
            </h5>
            <div className="space-y-2">
              {getObjectives().map((objective, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-mystery-gold mt-1">•</span>
                  <p className="text-gray-300 text-sm">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Relationships */}
      {Object.keys(character.relationships).length > 0 && (
        <Card
          title="🔗 Your Relationships"
          subtitle="How you relate to other characters"
        >
          <div className="space-y-3">
            {Object.entries(character.relationships).map(
              ([characterId, relationship]) => (
                <div
                  key={characterId}
                  className="bg-mystery-dark rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-mystery-light">
                        {characterId
                          .replace('char_', '')
                          .replace('_', ' ')
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                      <p className="text-mystery-gold text-sm capitalize">
                        {relationship}
                      </p>
                    </div>
                    <span className="text-2xl">
                      {relationship === 'family'
                        ? '👨‍👩‍👧‍👦'
                        : relationship === 'friend'
                          ? '🤝'
                          : relationship === 'enemy'
                            ? '⚔️'
                            : relationship === 'romantic'
                              ? '💕'
                              : relationship === 'business'
                                ? '💼'
                                : '🔗'}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* Secrets Management */}
      <Card
        title="🤫 Your Secrets"
        subtitle="Sensitive information you must protect"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-sm">
              You have {character.secrets.length} secret
              {character.secrets.length !== 1 ? 's' : ''}
            </p>
            <Button
              onClick={() => setShowSecrets(!showSecrets)}
              variant="ghost"
              size="sm"
            >
              {showSecrets ? 'Hide Secrets' : 'View Secrets'}
            </Button>
          </div>

          {showSecrets && (
            <div className="space-y-3">
              {character.secrets.map((secret, index) => (
                <div
                  key={index}
                  className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-lg mt-0.5">🔐</span>
                      <div className="flex-1">
                        <p className="text-red-300 text-sm leading-relaxed">
                          {secret}
                        </p>
                        {revealedSecrets.has(index) && (
                          <div className="mt-2 p-2 bg-red-800 bg-opacity-30 rounded text-xs text-red-200">
                            ⚠️ This secret has been revealed to other players
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRevealSecret(index)}
                      disabled={revealedSecrets.has(index)}
                      variant="danger"
                      size="sm"
                    >
                      {revealedSecrets.has(index) ? 'Revealed' : 'Reveal'}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-3">
                <p className="text-yellow-400 text-xs">
                  ⚠️ <strong>Warning:</strong> Once you reveal a secret, all
                  other players will be able to see it. Choose carefully when
                  and if to share this information during the investigation.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Playing Tips */}
      <Card
        title="💡 Playing Tips"
        subtitle="How to roleplay your character effectively"
      >
        <div className="space-y-3">
          <div className="bg-mystery-dark rounded-lg p-4">
            <h5 className="font-medium text-mystery-light mb-2">
              Stay In Character
            </h5>
            <p className="text-gray-300 text-sm">
              Respond to questions and interact with others as {character.name}{' '}
              would. Use your personality traits and background to guide your
              responses.
            </p>
          </div>

          <div className="bg-mystery-dark rounded-lg p-4">
            <h5 className="font-medium text-mystery-light mb-2">
              Protect Your Secrets
            </h5>
            <p className="text-gray-300 text-sm">
              Your secrets are valuable information. Revealing them at the right
              time can help or hurt your position. Consider what you gain by
              sharing versus keeping them hidden.
            </p>
          </div>

          <div className="bg-mystery-dark rounded-lg p-4">
            <h5 className="font-medium text-mystery-light mb-2">
              Use Your Relationships
            </h5>
            <p className="text-gray-300 text-sm">
              Your relationships with other characters can provide alibis,
              motives, or information. Think about how these connections might
              be relevant to the mystery.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
