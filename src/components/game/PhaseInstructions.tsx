import React from 'react';
import { GamePhase } from '../../types/index';

// Component for displaying phase-specific instructions
export const PhaseInstructions: React.FC<{ phase: GamePhase }> = ({
  phase,
}) => {
  const getInstructions = (
    phase: GamePhase
  ): { title: string; instructions: string[] } => {
    switch (phase) {
      case GamePhase.LOBBY:
        return {
          title: 'Welcome to the Lobby',
          instructions: [
            'Wait for all players to join the game',
            'Review your character information',
            'The host will start the game when ready',
          ],
        };
      case GamePhase.INTRODUCTION:
        return {
          title: 'Game Introduction',
          instructions: [
            'Listen to the scenario setup',
            'Learn about your character and their background',
            'Understand the mystery you need to solve',
          ],
        };
      case GamePhase.INVESTIGATION:
        return {
          title: 'Investigation Phase',
          instructions: [
            'Examine clues as they are revealed',
            'Question other players about their characters',
            'Take notes on suspicious behavior',
            'Work together to piece together the mystery',
          ],
        };
      case GamePhase.DISCUSSION:
        return {
          title: 'Discussion Phase',
          instructions: [
            'Share your findings with the group',
            'Discuss theories about who the culprit might be',
            "Listen to other players' perspectives",
            'Prepare for the final accusation',
          ],
        };
      case GamePhase.ACCUSATION:
        return {
          title: 'Accusation Phase',
          instructions: [
            'Make your final accusation',
            'Vote for who you think is guilty',
            'Present your evidence',
            'Await the dramatic reveal!',
          ],
        };
      case GamePhase.RESOLUTION:
        return {
          title: 'Resolution',
          instructions: [
            'The truth is revealed!',
            'See how close your guesses were',
            'Discuss the game with other players',
            'Rate your experience',
          ],
        };
      default:
        return {
          title: 'Game Phase',
          instructions: ["Follow the host's instructions"],
        };
    }
  };

  const { title, instructions } = getInstructions(phase);

  return (
    <div className="bg-mystery-dark rounded-lg p-6 border border-mystery-accent/20">
      <h3 className="text-xl font-bold text-mystery-light mb-4">{title}</h3>
      <ul className="space-y-2">
        {instructions.map((instruction, index) => (
          <li key={index} className="flex items-start text-gray-300">
            <span className="text-mystery-accent mr-2 mt-1">•</span>
            {instruction}
          </li>
        ))}
      </ul>
    </div>
  );
};
