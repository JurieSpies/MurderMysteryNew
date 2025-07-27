import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useGameStore } from '../../stores/gameStore';
import { useSocketStore } from '../../stores/socketStore';
import type { ChatMessage as ChatMessageType, Player } from '../../types/index';

interface PrivateChatProps {
  recipientId: string;
  recipientName: string;
  onClose: () => void;
}

export const PrivateChat: React.FC<PrivateChatProps> = ({
  recipientId,
  recipientName,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentPlayer } = useGameStore();
  const { socket } = useSocketStore();

  useEffect(() => {
    if (!socket) return;

    // Listen for private messages
    const handlePrivateMessage = (message: ChatMessageType) => {
      // Only show messages between current player and recipient
      if (
        (message.senderId === currentPlayer?.id &&
          message.recipientId === recipientId) ||
        (message.senderId === recipientId &&
          message.recipientId === currentPlayer?.id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    // Listen for typing indicators in private chat
    const handlePrivateTyping = (data: {
      playerId: string;
      isTyping: boolean;
      recipientId: string;
    }) => {
      if (
        data.playerId === recipientId &&
        data.recipientId === currentPlayer?.id
      ) {
        setIsTyping(data.isTyping);
      }
    };

    // Request private message history
    const requestPrivateHistory = () => {
      socket.emit('get_private_history', { recipientId });
    };

    // Listen for private message history
    const handlePrivateHistory = (data: {
      recipientId: string;
      messages: ChatMessageType[];
    }) => {
      if (data.recipientId === recipientId) {
        setMessages(data.messages);
      }
    };

    socket.on('private_message', handlePrivateMessage);
    socket.on('private_typing', handlePrivateTyping);
    socket.on('private_history', handlePrivateHistory);

    // Request history when component mounts
    requestPrivateHistory();

    return () => {
      socket.off('private_message', handlePrivateMessage);
      socket.off('private_typing', handlePrivateTyping);
      socket.off('private_history', handlePrivateHistory);
    };
  }, [socket, currentPlayer?.id, recipientId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  const handleMessageSent = () => {
    // Scroll to bottom after sending a message
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-mystery-dark rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🔒</span>
            <div>
              <h3 className="font-semibold text-mystery-light">Private Chat</h3>
              <p className="text-sm text-gray-400">with {recipientName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setIsMinimized(!isMinimized)}
              variant="ghost"
              size="sm"
            >
              {isMinimized ? '⬆️' : '⬇️'}
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-2 block">🔒</span>
                  <p className="text-gray-400 text-sm">
                    No private messages yet
                  </p>
                  <p className="text-gray-500 text-xs">
                    This is a secure conversation between you and{' '}
                    {recipientName}
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentPlayer?.id}
                    showTimestamp={true}
                    isPrivate={true}
                  />
                ))
              )}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center space-x-2 text-sm text-gray-400 italic">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-red-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span>{recipientName} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <ChatInput
              isPrivate={true}
              recipientId={recipientId}
              recipientName={recipientName}
              onMessageSent={handleMessageSent}
            />
          </>
        )}

        {/* Minimized State */}
        {isMinimized && (
          <div className="p-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🔒</span>
              <span className="text-mystery-light">
                Private chat with {recipientName}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {messages.length} message{messages.length !== 1 ? 's' : ''}
            </p>
            {isTyping && (
              <p className="text-xs text-red-400 mt-1">
                {recipientName} is typing...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Player List for starting private chats
export const PlayerList: React.FC<{
  onSelectPlayer: (player: Player) => void;
}> = ({ onSelectPlayer }) => {
  const { currentGame, currentPlayer } = useGameStore();

  if (!currentGame) return null;

  const otherPlayers = currentGame.players.filter(
    (p) => p.id !== currentPlayer?.id
  );

  return (
    <Card title="🔒 Private Messages" subtitle="Start a private conversation">
      <div className="space-y-3">
        {otherPlayers.map((player) => (
          <div
            key={player.id}
            onClick={() => onSelectPlayer(player)}
            className="flex items-center justify-between p-3 bg-mystery-dark rounded-lg cursor-pointer hover:bg-mystery-purple transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  player.isConnected ? 'bg-green-500' : 'bg-gray-500'
                }`}
              ></div>
              <div>
                <p className="font-medium text-mystery-light">{player.name}</p>
                <p className="text-sm text-gray-400">
                  {player.character
                    ? `Playing ${player.character.name}`
                    : 'No character assigned'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {player.isHost && (
                <span className="px-2 py-1 bg-mystery-gold text-mystery-dark text-xs rounded-full">
                  Host
                </span>
              )}
              <Button variant="ghost" size="sm">
                💬 Chat
              </Button>
            </div>
          </div>
        ))}

        {otherPlayers.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">👥</span>
            <p className="text-gray-400 text-sm">No other players available</p>
          </div>
        )}
      </div>
    </Card>
  );
};
