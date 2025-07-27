import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { PublicChat } from './PublicChat';
import { PrivateChat, PlayerList } from './PrivateChat';
import { useGameStore } from '../../stores/gameStore';
import type { Player } from '../../types/index';

type ChatView = 'public' | 'private' | 'players';

export const ChatDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<ChatView>('public');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { currentGame } = useGameStore();

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    setCurrentView('private');
    setIsMobileMenuOpen(false);
  };

  const handleClosePrivateChat = () => {
    setSelectedPlayer(null);
    setCurrentView('public');
  };

  if (!currentGame) return null;

  return (
    <div className="space-y-6">
      {/* Mobile Chat Toggle */}
      <div className="md:hidden">
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-full"
        >
          💬 {isMobileMenuOpen ? 'Hide Chat' : 'Show Chat'}
        </Button>
      </div>

      {/* Desktop Navigation / Mobile Menu */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="bg-mystery-purple rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-2">
            <Button
              onClick={() => {
                setCurrentView('public');
                setIsMobileMenuOpen(false);
              }}
              variant={currentView === 'public' ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1"
            >
              💬 Group Chat
            </Button>

            <Button
              onClick={() => {
                setCurrentView('players');
                setIsMobileMenuOpen(false);
              }}
              variant={currentView === 'players' ? 'primary' : 'ghost'}
              size="sm"
              className="flex-1"
            >
              🔒 Private Messages
            </Button>
          </div>

          {/* View Description */}
          <div className="mt-3 text-sm text-gray-400">
            {currentView === 'public' && 'Chat with all players in the game'}
            {currentView === 'players' &&
              'Start private conversations with other players'}
            {currentView === 'private' &&
              selectedPlayer &&
              `Private chat with ${selectedPlayer.name}`}
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden md:block'}`}>
        {currentView === 'public' && (
          <div className="relative">
            {/* Mobile: Full screen chat */}
            <div className="md:hidden fixed inset-0 bg-mystery-dark z-40 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-mystery-light">
                  Group Chat
                </h2>
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <PublicChat />
              </div>
            </div>

            {/* Desktop: Embedded chat */}
            <div className="hidden md:block">
              <PublicChat />
            </div>
          </div>
        )}

        {currentView === 'players' && (
          <PlayerList onSelectPlayer={handleSelectPlayer} />
        )}
      </div>

      {/* Private Chat Modal */}
      {selectedPlayer && currentView === 'private' && (
        <PrivateChat
          recipientId={selectedPlayer.id}
          recipientName={selectedPlayer.name}
          onClose={handleClosePrivateChat}
        />
      )}

      {/* Mobile Chat Floating Action Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <div className="flex flex-col space-y-2">
          {/* Quick Private Chat */}
          <Button
            onClick={() => setCurrentView('players')}
            variant="secondary"
            className="w-12 h-12 rounded-full p-0"
          >
            🔒
          </Button>

          {/* Main Chat Toggle */}
          <Button
            onClick={() => {
              setCurrentView('public');
              setIsMobileMenuOpen(true);
            }}
            className="w-12 h-12 rounded-full p-0"
          >
            💬
          </Button>
        </div>
      </div>

      {/* Chat Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {/* This would show new message notifications */}
      </div>
    </div>
  );
};

// Mobile-optimized chat input
export const MobileChatInput: React.FC<{
  onSend: (message: string) => void;
  placeholder?: string;
}> = ({ onSend, placeholder = 'Type a message...' }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex space-x-2 p-4 bg-mystery-purple"
    >
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-mystery-dark border border-gray-600 rounded-full px-4 py-2 text-mystery-light placeholder-gray-500 focus:outline-none focus:border-mystery-gold"
        maxLength={500}
      />
      <Button
        type="submit"
        disabled={!message.trim()}
        className="rounded-full w-10 h-10 p-0"
      >
        📤
      </Button>
    </form>
  );
};

// Quick chat actions for mobile
export const QuickChatActions: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-mystery-dark">
      <Button variant="ghost" size="sm" className="text-xs">
        👍 Agree
      </Button>
      <Button variant="ghost" size="sm" className="text-xs">
        🤔 Thinking
      </Button>
      <Button variant="ghost" size="sm" className="text-xs">
        ❓ Question
      </Button>
      <Button variant="ghost" size="sm" className="text-xs">
        🔍 Evidence
      </Button>
      <Button variant="ghost" size="sm" className="text-xs">
        🤫 Secret
      </Button>
    </div>
  );
};
