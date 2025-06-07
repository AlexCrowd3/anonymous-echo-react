
import React, { useState } from 'react';
import { AuthForm } from '../components/auth/AuthForm';
import { GameMenu } from '../components/GameMenu';
import { CreateChat } from '../components/CreateChat';
import { JoinChat } from '../components/JoinChat';
import { GameInterface } from '../components/GameInterface';
import { LoadingScreen } from '../components/LoadingScreen';
import { useAuth } from '../hooks/useAuth';

export type GameState = 'menu' | 'create' | 'join' | 'playing';

const Index = () => {
  const { user, loading } = useAuth();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthForm onSuccess={() => setGameState('menu')} />;
  }

  return (
    <div className="min-h-screen bg-blue-600">
      {gameState === 'menu' && (
        <GameMenu
          onCreateChat={() => setGameState('create')}
          onJoinChat={() => setGameState('join')}
        />
      )}

      {gameState === 'create' && (
        <CreateChat
          onBack={() => setGameState('menu')}
          onSuccess={() => setGameState('menu')}
        />
      )}

      {gameState === 'join' && (
        <JoinChat
          onBack={() => setGameState('menu')}
          onJoin={(chatId) => {
            setCurrentChatId(chatId);
            setGameState('playing');
          }}
        />
      )}

      {gameState === 'playing' && currentChatId && (
        <GameInterface
          chatId={currentChatId}
          onBack={() => {
            setGameState('menu');
            setCurrentChatId(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
