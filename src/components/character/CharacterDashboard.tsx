import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { CharacterOverview } from './CharacterOverview';
import { PrivateCharacterBrief } from './PrivateCharacterBrief';
import { SecretsManager } from './SecretsManager';
import { useGameStore } from '../../stores/gameStore';

type CharacterView = 'overview' | 'private' | 'secrets';

export const CharacterDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<CharacterView>('overview');
  const { currentPlayer } = useGameStore();

  const hasCharacter = currentPlayer?.character;

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-mystery-purple rounded-lg p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setCurrentView('overview')}
            variant={currentView === 'overview' ? 'primary' : 'ghost'}
            size="sm"
          >
            🎭 All Characters
          </Button>

          {hasCharacter && (
            <>
              <Button
                onClick={() => setCurrentView('private')}
                variant={currentView === 'private' ? 'primary' : 'ghost'}
                size="sm"
              >
                🔒 My Character
              </Button>

              <Button
                onClick={() => setCurrentView('secrets')}
                variant={currentView === 'secrets' ? 'primary' : 'ghost'}
                size="sm"
              >
                🤫 My Secrets
              </Button>
            </>
          )}
        </div>

        {/* View Description */}
        <div className="mt-3 text-sm text-gray-400">
          {currentView === 'overview' &&
            'View all characters and their public information'}
          {currentView === 'private' &&
            "Your character's private background and objectives"}
          {currentView === 'secrets' &&
            "Manage and reveal your character's secrets strategically"}
        </div>
      </div>

      {/* Content */}
      <div>
        {currentView === 'overview' && <CharacterOverview />}
        {currentView === 'private' && hasCharacter && <PrivateCharacterBrief />}
        {currentView === 'secrets' && hasCharacter && <SecretsManager />}

        {/* No Character Message */}
        {(currentView === 'private' || currentView === 'secrets') &&
          !hasCharacter && (
            <div className="bg-mystery-dark rounded-lg p-8 text-center">
              <span className="text-6xl mb-4 block">🎭</span>
              <h3 className="text-xl font-semibold text-mystery-light mb-2">
                No Character Assigned
              </h3>
              <p className="text-gray-400 mb-4">
                You need to be assigned a character to access private
                information and secrets.
              </p>
              <p className="text-gray-500 text-sm">
                Wait for the host to assign characters, or view the character
                overview to see all available characters.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
