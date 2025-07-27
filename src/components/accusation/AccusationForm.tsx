import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useGameStore } from '../../stores/gameStore';
import { socketService } from '../../services/socketService';

interface AccusationData {
  murderer: string;
  weapon: string;
  location: string;
  motive: string;
  explanation: string;
}

export const AccusationForm: React.FC = () => {
  const [accusation, setAccusation] = useState<AccusationData>({
    murderer: '',
    weapon: '',
    location: '',
    motive: '',
    explanation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<AccusationData>>({});

  const { currentGame, currentPlayer, setError } = useGameStore();

  if (!currentGame || !currentPlayer) return null;

  const characters = currentGame.scenario.characters;
  const weapons = [
    'Poison',
    'Knife',
    'Gun',
    'Rope',
    'Candlestick',
    'Lead Pipe',
    'Wrench',
  ];
  const locations = [
    'Library',
    'Study',
    'Conservatory',
    'Billiard Room',
    'Lounge',
    'Dining Room',
    'Kitchen',
    'Ballroom',
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<AccusationData> = {};

    if (!accusation.murderer) {
      newErrors.murderer = 'Please select who you think committed the murder';
    }
    if (!accusation.weapon) {
      newErrors.weapon = 'Please select the murder weapon';
    }
    if (!accusation.location) {
      newErrors.location = 'Please select where the murder took place';
    }
    if (!accusation.motive.trim()) {
      newErrors.motive = 'Please provide a motive for the murder';
    }
    if (!accusation.explanation.trim()) {
      newErrors.explanation = 'Please explain your theory';
    } else if (accusation.explanation.trim().length < 50) {
      newErrors.explanation =
        'Please provide a more detailed explanation (at least 50 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await socketService.submitAccusation({
        playerId: currentPlayer.id,
        playerName: currentPlayer.name,
        murderer: accusation.murderer,
        weapon: accusation.weapon,
        location: accusation.location,
        motive: accusation.motive,
        explanation: accusation.explanation,
        submittedAt: new Date(),
      });

      setHasSubmitted(true);
    } catch (error) {
      console.error('Failed to submit accusation:', error);
      setError('Failed to submit accusation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof AccusationData, value: string) => {
    setAccusation((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (hasSubmitted) {
    return (
      <Card
        title="✅ Accusation Submitted"
        subtitle="Your theory has been recorded"
      >
        <div className="text-center space-y-6">
          <div className="text-6xl mb-4">⚖️</div>

          <div>
            <h3 className="text-xl font-semibold text-mystery-light mb-2">
              Thank you for your accusation!
            </h3>
            <p className="text-gray-400 mb-4">
              Your theory has been submitted and will be revealed along with the
              true solution.
            </p>
          </div>

          {/* Accusation Summary */}
          <div className="bg-mystery-dark rounded-lg p-4 text-left">
            <h4 className="font-semibold text-mystery-light mb-3">
              Your Accusation Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Murderer:</span>
                <span className="text-mystery-light">
                  {accusation.murderer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Weapon:</span>
                <span className="text-mystery-light">{accusation.weapon}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-mystery-light">
                  {accusation.location}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-600">
                <span className="text-gray-400">Motive:</span>
                <p className="text-mystery-light mt-1">{accusation.motive}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-3">
            <p className="text-yellow-400 text-sm">
              ⏳ Waiting for other players to submit their accusations...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="⚖️ Final Accusation"
      subtitle="Present your theory about the murder"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Who */}
        <div>
          <label className="block text-sm font-medium text-mystery-light mb-3">
            Who committed the murder?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {characters.map((character) => (
              <label
                key={character.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  accusation.murderer === character.name
                    ? 'border-mystery-gold bg-mystery-gold bg-opacity-10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name="murderer"
                  value={character.name}
                  checked={accusation.murderer === character.name}
                  onChange={(e) =>
                    handleInputChange('murderer', e.target.value)
                  }
                  className="sr-only"
                />
                <div className="flex items-center space-x-3">
                  <span className="text-lg">🎭</span>
                  <div>
                    <p className="font-medium text-mystery-light">
                      {character.name}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {character.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.murderer && (
            <p className="text-red-400 text-sm mt-2">{errors.murderer}</p>
          )}
        </div>

        {/* Weapon */}
        <div>
          <label className="block text-sm font-medium text-mystery-light mb-2">
            What was the murder weapon?
          </label>
          <select
            value={accusation.weapon}
            onChange={(e) => handleInputChange('weapon', e.target.value)}
            className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
          >
            <option value="">Select a weapon...</option>
            {weapons.map((weapon) => (
              <option key={weapon} value={weapon}>
                {weapon}
              </option>
            ))}
          </select>
          {errors.weapon && (
            <p className="text-red-400 text-sm mt-2">{errors.weapon}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-mystery-light mb-2">
            Where did the murder take place?
          </label>
          <select
            value={accusation.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
          >
            <option value="">Select a location...</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="text-red-400 text-sm mt-2">{errors.location}</p>
          )}
        </div>

        {/* Motive */}
        <div>
          <label className="block text-sm font-medium text-mystery-light mb-2">
            What was the motive?
          </label>
          <input
            type="text"
            value={accusation.motive}
            onChange={(e) => handleInputChange('motive', e.target.value)}
            placeholder="e.g., Revenge, Money, Love, Jealousy..."
            className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light placeholder-gray-500"
            maxLength={100}
          />
          {errors.motive && (
            <p className="text-red-400 text-sm mt-2">{errors.motive}</p>
          )}
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-mystery-light mb-2">
            Explain your theory
          </label>
          <textarea
            value={accusation.explanation}
            onChange={(e) => handleInputChange('explanation', e.target.value)}
            placeholder="Provide a detailed explanation of how and why the murder was committed. Include evidence that supports your theory..."
            rows={6}
            className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light placeholder-gray-500 resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.explanation && (
              <p className="text-red-400 text-sm">{errors.explanation}</p>
            )}
            <p className="text-gray-500 text-sm ml-auto">
              {accusation.explanation.length}/1000
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-500 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div>
              <p className="text-yellow-400 text-sm font-medium mb-1">
                Final Submission Warning
              </p>
              <p className="text-yellow-300 text-sm">
                Once you submit your accusation, you cannot change it. Make sure
                you've reviewed all the evidence and are confident in your
                theory.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="flex-1"
            size="lg"
          >
            {isSubmitting ? 'Submitting...' : '⚖️ Submit Final Accusation'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
