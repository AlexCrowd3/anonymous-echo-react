
import React from 'react';
import { ArrowLeft, Users, MessageCircle, Database, Gamepad2 } from 'lucide-react';
import { Chat } from '../pages/Index';

interface JoinChatProps {
  chats: Chat[];
  onBack: () => void;
  onJoin: (chat: Chat) => void;
}

export const JoinChat: React.FC<JoinChatProps> = ({ chats, onBack, onJoin }) => {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Присоединиться к чату</h1>
        </div>

        {/* Chat List */}
        <div className="space-y-4">
          {chats.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 text-center">
              <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Нет доступных чатов</h3>
              <p className="text-slate-400">Создайте новый чат или подождите, пока кто-то создаст его</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{chat.name}</h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        chat.mode === 'custom' 
                          ? 'bg-purple-500/20 text-purple-300' 
                          : 'bg-pink-500/20 text-pink-300'
                      }`}>
                        {chat.mode === 'custom' ? <Gamepad2 className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                        {chat.mode === 'custom' ? 'Свои вопросы' : 'Из базы'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{chat.players.length} игроков</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{chat.questions.length} вопросов</span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs text-slate-500">Игроки: </span>
                      <span className="text-xs text-slate-400">
                        {chat.players.join(', ')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onJoin(chat)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Войти
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
