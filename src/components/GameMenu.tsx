
import React from 'react';
import { Plus, Users, LogOut, MessageCircle } from 'lucide-react';
import { User } from '../pages/Index';

interface GameMenuProps {
  user: User;
  onLogout: () => void;
  onCreateChat: () => void;
  onJoinChat: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  user,
  onLogout,
  onCreateChat,
  onJoinChat
}) => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Добро пожаловать, {user.username}!</h1>
                <p className="text-slate-400">Выберите действие для начала игры</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              title="Выйти"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu Options */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={onCreateChat}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-2xl transition-all transform hover:scale-105 border border-purple-400/20 shadow-lg hover:shadow-purple-500/25"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Создать чат</h3>
                <p className="text-purple-100 text-sm">
                  Создайте новый анонимный чат с вопросами
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={onJoinChat}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white p-6 rounded-2xl transition-all transform hover:scale-105 border border-pink-400/20 shadow-lg hover:shadow-pink-500/25"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Присоединиться</h3>
                <p className="text-pink-100 text-sm">
                  Найдите и присоединитесь к существующему чату
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/30">
          <h3 className="text-lg font-semibold text-white mb-3">Как играть?</h3>
          <div className="space-y-2 text-slate-300 text-sm">
            <p>• <span className="text-purple-400">Режим 1:</span> Создайте свои вопросы и отвечайте анонимно</p>
            <p>• <span className="text-pink-400">Режим 2:</span> Отвечайте на 5 случайных вопросов из базы</p>
            <p>• Все ответы полностью анонимны</p>
            <p>• Пригласите друзей для большего веселья!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
