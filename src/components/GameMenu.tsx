
import React from 'react';
import { Plus, Users, LogOut, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface GameMenuProps {
  onCreateChat: () => void;
  onJoinChat: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  onCreateChat,
  onJoinChat
}) => {
  const { user, signOut } = useAuth();

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Привет!</h1>
                <p className="text-white/70 text-sm">Выберите действие</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-4 mb-6">
          <button
            onClick={onCreateChat}
            className="w-full glass-button text-white p-6 rounded-2xl transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Создать комнату</h3>
                <p className="text-white/80 text-sm">
                  Создайте новую анонимную комнату
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onJoinChat}
            className="w-full glass-button text-white p-6 rounded-2xl transition-all hover:shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold">Присоединиться</h3>
                <p className="text-white/80 text-sm">
                  Найдите и присоединитесь к комнате
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mb-3">
              <span className="text-white text-sm">i</span>
            </div>
          </div>
          <div className="space-y-2 text-white/80 text-sm leading-relaxed">
            <p>• <span className="text-white">Режим 1:</span> Создайте свои вопросы</p>
            <p>• <span className="text-white">Режим 2:</span> 5 случайных вопросов</p>
            <p>• Все ответы полностью анонимны</p>
            <p>• Пригласите друзей для веселья!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
