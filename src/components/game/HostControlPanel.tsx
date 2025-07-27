import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
export const HostControlPanel: React.FC = () => {
  // Placeholder phaseActions array
  const phaseActions: Array<{
    action: () => void;
    label: string;
    icon?: React.ReactNode;
    variant?: 'ghost' | 'primary' | 'secondary' | 'danger';
  }> = [];

  const [isLoading] = useState(false);
  const { currentGame } = useGameStore();

  // TODO: Define phaseActions, handleEndGame, handleKickPlayer, etc. if not already present

  if (!currentGame) {
    return <div>Loading game data...</div>;
  }
  return (
    <div className="space-y-6">
      {/* Host Control Panel */}
      <Card
        title="👑 Host Control Panel"
        subtitle="Manage game progression and players"
      >
        {/* Game Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-mystery-dark rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-mystery-light capitalize">
              {currentGame.currentPhase}
            </p>
            <p className="text-gray-400 text-sm">Current Phase</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-mystery-light">
              {currentGame.players.length}
            </p>
            <p className="text-gray-400 text-sm">Active Players</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-mystery-light">
              {currentGame.revealedClues?.length || 0}
            </p>
            <p className="text-gray-400 text-sm">Clues Revealed</p>
          </div>
        </div>

        {/* Phase Controls */}
        <div className="space-y-4">
          <h4 className="font-semibold text-mystery-light">Phase Management</h4>
          {phaseActions.length > 0 ? (
            <div className="space-y-3">
              {phaseActions.map((action, index) => (
                <Button
                  key={index}
                  onClick={action.action}
                  variant={action.variant}
                  disabled={isLoading}
                  isLoading={isLoading}
                  className="w-full"
                >
                  {action.icon} {action.label}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">No phase actions available</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
