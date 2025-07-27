import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import type { Clue } from '../../types/index';

interface CluePresentationProps {
  clue: Clue;
  onClose?: () => void;
  showFullscreen?: boolean;
}

export const CluePresentation: React.FC<CluePresentationProps> = ({
  clue,
  onClose,
  showFullscreen = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'physical':
        return '🔍';
      case 'document':
        return '📄';
      case 'testimony':
        return '💬';
      case 'financial':
        return '💰';
      case 'personal':
        return '👤';
      case 'location':
        return '📍';
      case 'timeline':
        return '⏰';
      default:
        return '🔎';
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
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

  const formatContent = (content: string): JSX.Element[] => {
    // Split content by paragraphs and format
    const paragraphs = content.split('\n\n');
    return paragraphs.map((paragraph, index) => (
      <p
        key={index}
        className="text-gray-300 text-sm leading-relaxed mb-3 last:mb-0"
      >
        {paragraph}
      </p>
    ));
  };

  const ClueContent = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getCategoryIcon(clue.category)}</span>
          <div>
            <h3 className="text-xl font-semibold text-mystery-light">
              {clue.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(clue.importance)} bg-opacity-20`}
              >
                {clue.importance.toUpperCase()} PRIORITY
              </span>
              <span className="text-gray-400 text-sm capitalize">
                {clue.category}
              </span>
            </div>
          </div>
        </div>

        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        )}
      </div>

      {/* Description */}
      <div>
        <h4 className="font-semibold text-mystery-light mb-2">Description</h4>
        <div className="bg-mystery-dark rounded-lg p-4">
          <p className="text-gray-300 text-sm leading-relaxed">
            {clue.description}
          </p>
        </div>
      </div>

      {/* Image (if available) */}
      {clue.imageUrl && (
        <div>
          <h4 className="font-semibold text-mystery-light mb-2">
            Evidence Photo
          </h4>
          <div className="bg-mystery-dark rounded-lg p-4">
            {!imageError ? (
              <div className="relative">
                <img
                  src={clue.imageUrl}
                  alt={clue.title}
                  className={`w-full max-w-md mx-auto rounded-lg transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-mystery-purple rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin text-2xl mb-2">⏳</div>
                      <p className="text-gray-400 text-sm">Loading image...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">🖼️</span>
                <p className="text-gray-400 text-sm">
                  Image could not be loaded
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        <h4 className="font-semibold text-mystery-light mb-2">
          Evidence Details
        </h4>
        <div className="bg-mystery-purple rounded-lg p-4">
          {isExpanded || clue.content.length <= 200 ? (
            <div>{formatContent(clue.content)}</div>
          ) : (
            <div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {clue.content.substring(0, 200)}...
              </p>
              <Button
                onClick={() => setIsExpanded(true)}
                variant="ghost"
                size="sm"
              >
                Read More
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Elements */}
      {clue.interactiveElements && clue.interactiveElements.length > 0 && (
        <div>
          <h4 className="font-semibold text-mystery-light mb-2">
            Interactive Elements
          </h4>
          <div className="space-y-2">
            {clue.interactiveElements.map((element, index) => (
              <div key={index} className="bg-mystery-dark rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-mystery-light text-sm">
                    {element.label}
                  </span>
                  <Button variant="ghost" size="sm">
                    {element.type === 'link' ? '🔗' : '🔍'} Examine
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Category:</span>
            <span className="ml-2 text-mystery-light capitalize">
              {clue.category}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Priority:</span>
            <span className="ml-2 text-mystery-light capitalize">
              {clue.importance}
            </span>
          </div>
          {clue.revealedAt && (
            <>
              <div>
                <span className="text-gray-400">Discovered:</span>
                <span className="ml-2 text-mystery-light">
                  {new Date(clue.revealedAt).toLocaleTimeString()}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Date:</span>
                <span className="ml-2 text-mystery-light">
                  {new Date(clue.revealedAt).toLocaleDateString()}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700">
        <Button variant="ghost" size="sm">
          📋 Take Notes
        </Button>
        <Button variant="ghost" size="sm">
          🔗 Connect to Other Clues
        </Button>
        <Button variant="ghost" size="sm">
          💬 Discuss with Players
        </Button>
        {clue.imageUrl && (
          <Button variant="ghost" size="sm">
            🔍 Zoom Image
          </Button>
        )}
      </div>
    </div>
  );

  if (showFullscreen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
        <div className="bg-mystery-dark rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <div className="p-6">
            <ClueContent />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <ClueContent />
    </Card>
  );
};

// Compact clue card for lists
export const ClueCard: React.FC<{ clue: Clue; onClick?: () => void }> = ({
  clue,
  onClick,
}) => {
  const getCategoryIcon = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'physical':
        return '🔍';
      case 'document':
        return '📄';
      case 'testimony':
        return '💬';
      case 'financial':
        return '💰';
      case 'personal':
        return '👤';
      case 'location':
        return '📍';
      case 'timeline':
        return '⏰';
      default:
        return '🔎';
    }
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
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
    <div
      onClick={onClick}
      className="bg-mystery-dark border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-mystery-gold transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getCategoryIcon(clue.category)}</span>
          <span
            className={`px-2 py-1 text-xs rounded-full ${getImportanceColor(clue.importance)} bg-opacity-20`}
          >
            {clue.importance.toUpperCase()}
          </span>
        </div>
        {clue.revealedAt && (
          <span className="text-xs text-gray-500">
            {new Date(clue.revealedAt).toLocaleTimeString()}
          </span>
        )}
      </div>

      <h4 className="font-semibold text-mystery-light mb-2">{clue.title}</h4>
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
        {clue.description}
      </p>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400 capitalize">{clue.category}</span>
        <span className="text-mystery-gold">Click to examine</span>
      </div>
    </div>
  );
};
