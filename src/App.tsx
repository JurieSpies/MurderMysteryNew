import { useEffect, useState } from 'react';
import { CreateGameForm } from './components/lobby/CreateGameForm';
import { GameLobby } from './components/lobby/GameLobby';
import { JoinGameForm } from './components/lobby/JoinGameForm';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { scenarioService } from './services/scenarioService';
import { socketService } from './services/socketService';
import { useGameStore } from './stores/gameStore';
import { useSocketStore } from './stores/socketStore';

function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'create' | 'join' | 'test'
  >('home');

  // Test the stores
  const { currentGame, currentPlayer, error } = useGameStore();
  const { isConnected: socketConnected } = useSocketStore();

  useEffect(() => {
    // Update document title to show React is working
    document.title = `Murder Mystery Game - React Working! (${new Date().getSeconds()}s)`;
  }, []);

  console.log('✅ App component rendered successfully');
  console.log(
    '🎮 Current game state:',
    currentGame ? `HAS GAME (${currentGame.code})` : 'NO GAME'
  );
  console.log(
    '👤 Current player state:',
    currentPlayer ? `HAS PLAYER (${currentPlayer.name})` : 'NO PLAYER'
  );

  // Log when game state changes
  useEffect(() => {
    if (currentGame) {
      console.log(
        '🎯 GAME STATE CHANGED - Should show lobby now!',
        currentGame
      );
    }
  }, [currentGame]);

  useEffect(() => {
    if (currentPlayer) {
      console.log('🎯 PLAYER STATE CHANGED', currentPlayer);
    }
  }, [currentPlayer]);

  const handleConnectTest = async () => {
    try {
      await socketService.connect();
    } catch (error) {
      console.error('❌ Connection failed:', error);
    }
  };

  const handleTestGameCreation = async () => {
    try {
      console.log('🎮 Testing game creation...');
      await socketService.connect();
      const response = await socketService.createGame(
        'Test Player',
        'missing_heiress'
      );
      console.log('🎮 Game creation response:', response);

      if (response.success && response.game && response.player) {
        const { setCurrentGame, setCurrentPlayer } = useGameStore.getState();
        setCurrentGame(response.game);
        setCurrentPlayer(response.player);
        console.log('✅ Game state should be updated now');
      }
    } catch (error) {
      console.error('❌ Game creation failed:', error);
    }
  };

  // Auto-test connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await socketService.connect();
        console.log('✅ Auto-connection successful!');

        // Also test game creation after connection
        setTimeout(async () => {
          try {
            console.log('🎮 Auto-testing game creation...');
            const response = await socketService.createGame(
              'Auto Test Player',
              'missing_heiress'
            );
            console.log('🎮 Auto game creation response:', response);

            if (response.success && response.game && response.player) {
              const { setCurrentGame, setCurrentPlayer } =
                useGameStore.getState();
              setCurrentGame(response.game);
              setCurrentPlayer(response.player);
              console.log('✅ Auto game state should be updated now');
            }
          } catch (error) {
            console.error('❌ Auto game creation failed:', error);
          }
        }, 3000);
      } catch (error) {
        console.error('❌ Auto-connection failed:', error);
      }
    };

    // Test connection after a short delay
    setTimeout(testConnection, 2000);
  }, []);

  // Show game lobby if player is in a game
  if (currentGame) {
    console.log(
      '🎯 RENDERING GAME LOBBY - currentGame exists!',
      currentGame.code
    );
    return (
      <div className="min-h-screen bg-mystery-dark">
        {/* Header */}
        <header className="bg-mystery-purple border-b border-gray-700">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-mystery font-bold text-mystery-light text-center">
              🔍 Murder Mystery Game
            </h1>
            <p className="text-gray-400 text-center mt-2">
              {currentGame.scenario.title}
            </p>
          </div>
        </header>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border-b border-red-500 px-4 py-3">
            <div className="max-w-6xl mx-auto">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          </div>
        )}

        {/* Game Lobby */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          <GameLobby />
        </main>
      </div>
    );
  }

  console.log('🎯 RENDERING HOME SCREEN - no currentGame');
  return (
    <div className="min-h-screen bg-mystery-dark">
      {/* Header */}
      <header className="bg-mystery-purple border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-mystery font-bold text-mystery-light text-center">
            🔍 Murder Mystery Game
          </h1>
          <p className="text-gray-400 text-center mt-2">
            A multiplayer detective game for friends
          </p>
        </div>
      </header>

      {/* Connection Status */}
      <div className="bg-mystery-purple border-b border-gray-700 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></span>
              <span className="text-sm text-gray-400">
                {socketConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            {!socketConnected && (
              <Button size="sm" variant="ghost" onClick={handleConnectTest}>
                Connect to Server
              </Button>
            )}
            {socketConnected && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTestGameCreation}
              >
                🧪 Test Game Creation
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 bg-opacity-20 border-b border-red-500 px-4 py-3">
          <div className="max-w-6xl mx-auto">
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={() => setCurrentView('create')} className="h-20">
                <div className="text-center">
                  <div className="text-2xl mb-1">🎭</div>
                  <div>Create Game</div>
                </div>
              </Button>
              <Button
                onClick={() => setCurrentView('join')}
                variant="secondary"
                className="h-20"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">🚪</div>
                  <div>Join Game</div>
                </div>
              </Button>
            </div>

            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="System Status" subtitle="All systems operational">
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>✅ React App</span>
                    <span className="text-green-400">Working</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ State Management</span>
                    <span className="text-green-400">Working</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ UI Components</span>
                    <span className="text-green-400">Working</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>✅ Tailwind CSS</span>
                    <span className="text-green-400">Working</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🔌 Socket Connection</span>
                    <span
                      className={
                        socketConnected ? 'text-green-400' : 'text-red-400'
                      }
                    >
                      {socketConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </Card>

              <Card title="Available Scenarios" subtitle="Ready to play">
                <div className="space-y-3">
                  {scenarioService.getAllScenarioPreviews().map((scenario) => (
                    <div
                      key={scenario.id}
                      className="bg-mystery-dark rounded p-3"
                    >
                      <h4 className="font-semibold text-mystery-light">
                        {scenario.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {scenario.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {scenario.minPlayers}-{scenario.maxPlayers} players
                        </span>
                        <span className="text-xs text-mystery-gold">Ready</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {currentView === 'create' && (
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <Button variant="ghost" onClick={() => setCurrentView('home')}>
                ← Back to Home
              </Button>
            </div>
            <CreateGameForm />
          </div>
        )}

        {currentView === 'join' && (
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <Button variant="ghost" onClick={() => setCurrentView('home')}>
                ← Back to Home
              </Button>
            </div>
            <JoinGameForm />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
