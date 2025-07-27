import React from 'react';
import type { ChatMessage as ChatMessageType } from '../../types/index';

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  isPrivate?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  showTimestamp = true,
  isPrivate = false,
}) => {
  const formatTimestamp = (timestamp: Date): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMessageTypeIcon = (): string => {
    switch (message.type) {
      case 'system':
        return '🤖';
      case 'clue':
        return '🔍';
      case 'secret':
        return '🤫';
      case 'accusation':
        return '⚖️';
      default:
        return '';
    }
  };

  const getMessageTypeColor = (): string => {
    switch (message.type) {
      case 'system':
        return 'text-blue-400';
      case 'clue':
        return 'text-yellow-400';
      case 'secret':
        return 'text-red-400';
      case 'accusation':
        return 'text-purple-400';
      default:
        return 'text-gray-300';
    }
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-mystery-purple bg-opacity-30 rounded-lg px-4 py-2 max-w-xs">
          <div className="flex items-center space-x-2">
            <span>{getMessageTypeIcon()}</span>
            <p className={`text-sm ${getMessageTypeColor()}`}>
              {message.content}
            </p>
          </div>
          {showTimestamp && (
            <p className="text-xs text-gray-500 text-center mt-1">
              {formatTimestamp(message.timestamp)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}
      >
        {/* Sender name and timestamp */}
        <div
          className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
          <span className="text-sm font-medium text-mystery-light">
            {isOwnMessage ? 'You' : message.senderName}
          </span>
          {message.type !== 'chat' && (
            <span className="text-sm">{getMessageTypeIcon()}</span>
          )}
          {isPrivate && (
            <span className="text-xs bg-red-900 text-red-300 px-2 py-1 rounded-full">
              Private
            </span>
          )}
          {showTimestamp && (
            <span className="text-xs text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          )}
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwnMessage
              ? 'bg-mystery-gold text-mystery-dark'
              : message.type === 'system'
                ? 'bg-mystery-purple bg-opacity-30 text-blue-400'
                : isPrivate
                  ? 'bg-red-900 bg-opacity-30 border border-red-500 text-red-300'
                  : 'bg-mystery-dark text-gray-300'
          }`}
        >
          {/* Special message type header */}
          {message.type !== 'chat' && message.type !== 'system' && (
            <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-opacity-30">
              <span>{getMessageTypeIcon()}</span>
              <span
                className={`text-xs font-medium uppercase ${getMessageTypeColor()}`}
              >
                {message.type}
              </span>
            </div>
          )}

          {/* Message content */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Message metadata */}
          {message.metadata && (
            <div className="mt-2 pt-2 border-t border-opacity-30">
              {message.metadata.clueId && (
                <p className="text-xs opacity-75">
                  Related to clue:{' '}
                  {message.metadata.clueTitle || message.metadata.clueId}
                </p>
              )}
              {message.metadata.secretIndex !== undefined && (
                <p className="text-xs opacity-75">
                  Secret revealed by {message.senderName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Delivery status */}
        {isOwnMessage && (
          <div
            className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
              isOwnMessage ? 'text-mystery-gold' : 'text-gray-500'
            }`}
          >
            {message.delivered ? (
              <>
                <span>✓</span>
                <span>Delivered</span>
              </>
            ) : (
              <>
                <span>⏳</span>
                <span>Sending...</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Avatar placeholder */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isOwnMessage
            ? 'order-1 mr-2 bg-mystery-gold text-mystery-dark'
            : 'order-2 ml-2 bg-mystery-purple text-mystery-light'
        }`}
      >
        {isOwnMessage ? '👤' : message.senderName.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};
