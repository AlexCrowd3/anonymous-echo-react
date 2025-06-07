
import React, { useState, useEffect } from 'react';
import { AuthForm } from '../components/AuthForm';
import { GameMenu } from '../components/GameMenu';
import { CreateChat } from '../components/CreateChat';
import { JoinChat } from '../components/JoinChat';
import { GameInterface } from '../components/GameInterface';

export type User = {
  id: string;
  username: string;
  isLoggedIn: boolean;
};

export type Chat = {
  id: string;
  name: string;
  mode: 'custom' | 'database';
  questions: string[];
  players: string[];
  answers: { [key: string]: string[] };
  currentQuestionIndex: number;
  isActive: boolean;
};

export type GameState = 'auth' | 'menu' | 'create' | 'join' | 'playing';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState>('auth');
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('anoUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setGameState('menu');
    }
  }, []);

  const handleLogin = (username: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      isLoggedIn: true
    };
    setUser(newUser);
    localStorage.setItem('anoUser', JSON.stringify(newUser));
    setGameState('menu');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('anoUser');
    setGameState('auth');
    setCurrentChat(null);
  };

  const handleCreateChat = (chatName: string, mode: 'custom' | 'database', questions?: string[]) => {
    const databaseQuestions = [
      "Какая самая странная еда, которую ты когда-либо пробовал?",
      "Если бы ты мог иметь любую суперсилу, какую бы выбрал?",
      "Какой самый смешной случай произошел с тобой на публике?",
      "Что бы ты делал, если бы выиграл миллион рублей?",
      "Какое самое страшное место ты когда-либо посещал?"
    ];

    const newChat: Chat = {
      id: Math.random().toString(36).substr(2, 9),
      name: chatName,
      mode,
      questions: mode === 'database' ? databaseQuestions : questions || [],
      players: [user!.username],
      answers: {},
      currentQuestionIndex: 0,
      isActive: false
    };

    setChats([...chats, newChat]);
    setCurrentChat(newChat);
    setGameState('playing');
  };

  const handleJoinChat = (chat: Chat) => {
    if (!chat.players.includes(user!.username)) {
      chat.players.push(user!.username);
    }
    setCurrentChat(chat);
    setGameState('playing');
  };

  const handleBackToMenu = () => {
    setGameState('menu');
    setCurrentChat(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <AuthForm onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {gameState === 'menu' && (
        <GameMenu
          user={user}
          onLogout={handleLogout}
          onCreateChat={() => setGameState('create')}
          onJoinChat={() => setGameState('join')}
        />
      )}

      {gameState === 'create' && (
        <CreateChat
          onBack={handleBackToMenu}
          onCreate={handleCreateChat}
        />
      )}

      {gameState === 'join' && (
        <JoinChat
          chats={chats}
          onBack={handleBackToMenu}
          onJoin={handleJoinChat}
        />
      )}

      {gameState === 'playing' && currentChat && (
        <GameInterface
          chat={currentChat}
          user={user}
          onBack={handleBackToMenu}
          onUpdateChat={setCurrentChat}
        />
      )}
    </div>
  );
};

export default Index;
