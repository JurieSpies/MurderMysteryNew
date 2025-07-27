import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useGameStore } from '../../stores/gameStore';
import type { Clue } from '../../types/index';

interface EvidenceLockerProps {
  onClueSelect?: (clue: Clue) => void;
}

export const EvidenceLocker: React.FC<EvidenceLockerProps> = ({
  onClueSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'category' | 'importance'>(
    'time'
  );
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);

  const { currentGame } = useGameStore();

  // Get all revealed clues
  const revealedClues = useMemo(() => {
    if (!currentGame) return [];
    return currentGame.revealedClues || [];
  }, [currentGame]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(revealedClues.map((clue) => clue.category));
    return Array.from(cats).sort();
  }, [revealedClues]);

  // Filter and sort clues
  const filteredClues = useMemo(() => {
    let filtered = revealedClues;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (clue) =>
          clue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          clue.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((clue) => clue.category === selectedCategory);
    }

    // Define importance order outside switch statement to avoid lexical declaration error
    const importanceOrder = { high: 3, medium: 2, low: 1 };

    // Sort clues
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return (
            new Date(b.revealedAt || 0).getTime() -
            new Date(a.revealedAt || 0).getTime()
          );
        case 'category':
          return a.category.localeCompare(b.category);
        case 'importance':
          return (
            (importanceOrder[b.importance as keyof typeof importanceOrder] ||
              0) -
            (importanceOrder[a.importance as keyof typeof importanceOrder] || 0)
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [revealedClues, searchTerm, selectedCategory, sortBy]);

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

  const handleClueClick = (clue: Clue) => {
    setSelectedClue(clue);
    onClueSelect?.(clue);
  };

  return (
    <div className="space-y-6">
      <Card
        title="🗃️ Evidence Locker"
        subtitle="All discovered clues and evidence"
      >
        {/* Search and Filter Controls */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Search Evidence"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search clues, descriptions..."
            />

            <div>
              <label className="block text-sm font-medium text-mystery-light mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-mystery-light mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as 'time' | 'category' | 'importance'
                  )
                }
                className="w-full bg-mystery-dark border border-gray-600 rounded-lg px-3 py-2 text-mystery-light"
              >
                <option value="time">⏰ Time Discovered</option>
                <option value="category">📂 Category</option>
                <option value="importance">⭐ Importance</option>
              </select>
            </div>
          </div>
        </div>

        {/* Evidence Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-mystery-light">
              {revealedClues.length}
            </p>
            <p className="text-gray-400 text-sm">Total Clues</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-400">
              {revealedClues.filter((c) => c.importance === 'high').length}
            </p>
            <p className="text-gray-400 text-sm">High Priority</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-mystery-gold">
              {categories.length}
            </p>
            <p className="text-gray-400 text-sm">Categories</p>
          </div>
          <div className="bg-mystery-dark rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">
              {filteredClues.length}
            </p>
            <p className="text-gray-400 text-sm">Filtered</p>
          </div>
        </div>

        {/* Clues Grid */}
        {filteredClues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClues.map((clue) => (
              <div
                key={clue.id}
                onClick={() => handleClueClick(clue)}
                className="bg-mystery-dark border border-gray-600 rounded-lg p-4 cursor-pointer hover:border-mystery-gold transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {getCategoryIcon(clue.category)}
                    </span>
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

                <h4 className="font-semibold text-mystery-light mb-2">
                  {clue.title}
                </h4>
                <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                  {clue.description}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 capitalize">
                    {clue.category}
                  </span>
                  <span className="text-mystery-gold">Click to view</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            {revealedClues.length === 0 ? (
              <>
                <span className="text-6xl mb-4 block">🔍</span>
                <p className="text-gray-400 mb-2">No evidence discovered yet</p>
                <p className="text-gray-500 text-sm">
                  Clues will appear here as they are revealed during the
                  investigation
                </p>
              </>
            ) : (
              <>
                <span className="text-6xl mb-4 block">🔎</span>
                <p className="text-gray-400 mb-2">No clues match your search</p>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  variant="ghost"
                  size="sm"
                >
                  Clear Filters
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Clue Detail Modal */}
      {selectedClue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-mystery-dark rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <Card
              title={selectedClue.title}
              subtitle={`${selectedClue.category} Evidence`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getImportanceColor(selectedClue.importance)} bg-opacity-20`}
                  >
                    {selectedClue.importance.toUpperCase()} PRIORITY
                  </span>
                  <Button
                    onClick={() => setSelectedClue(null)}
                    variant="ghost"
                    size="sm"
                  >
                    ✕ Close
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold text-mystery-light mb-2">
                    Description
                  </h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {selectedClue.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-mystery-light mb-2">
                    Evidence Details
                  </h4>
                  <div className="bg-mystery-purple rounded-lg p-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {selectedClue.content}
                    </p>
                  </div>
                </div>

                {selectedClue.revealedAt && (
                  <div className="text-center text-sm text-gray-400 pt-4 border-t border-gray-700">
                    Discovered:{' '}
                    {new Date(selectedClue.revealedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
