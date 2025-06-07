
import React, { useState } from 'react';
import { ArrowLeft, Users, MessageCircle, Database, Gamepad2, Lock } from 'lucide-react';
import { Chat } from '../pages/Index';

interface JoinChatProps {
  chats: Chat[];
  onBack: () => void;
  onJoin: (chat: Chat, password?: string) => void;
}

export const JoinChat: React.FC<JoinChatProps> = ({ chats, onBack, onJoin }) => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [password, setPassword] = useState('');

  const handleJoinClick = (chat: Chat) => {
    if (chat.password) {
      setSelectedChat(chat);
    } else {
      onJoin(chat);
    }
  };

  const handlePasswordSubmit = () => {
    if (selectedChat) {
      onJoin(selectedChat, password);
      setSelectedChat(null);
      setPassword('');
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Присоединиться</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {chats.length === 0 ? (
            <div className="gradient-card rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Нет доступных комнат</h3>
              <p className="text-white/70">Создайте новую комнату или подождите</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className="gradient-card rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{chat.name}</h3>
                      {chat.password && (
                        <Lock className="w-4 h-4 text-white/60" />
                      )}
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                        chat.mode === 'custom' 
                          ? 'bg-white/20 text-white' 
                          : 'bg-white/15 text-white/90'
                      }`}>
                        {chat.mode === 'custom' ? <Gamepad2 className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                        {chat.mode === 'custom' ? 'Свои вопросы' : 'Из базы'}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{chat.players.length}/{chat.maxPlayers} игроков</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{chat.questions.length} вопросов</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-white/50">Игроки: </span>
                      <span className="text-xs text-white/70">
                        {chat.players.join(', ')}
                      </span>
                    </div>

                    {chat.isStarted ? (
                      <div className="mt-2">
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          Игра началась
                        </span>
                      </div>
                    ) : chat.players.length < chat.minPlayers ? (
                      <div className="mt-2">
                        <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                          Ожидание игроков ({chat.minPlayers - chat.players.length} осталось)
                        </span>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                          Готов к запуску
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleJoinClick(chat)}
                    disabled={chat.players.length >= chat.maxPlayers}
                    className="gradient-button text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Войти
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Password Modal */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="gradient-card rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Введите пароль
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all mb-4"
              placeholder="Пароль"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedChat(null);
                  setPassword('');
                }}
                className="flex-1 bg-white/10 text-white py-2 px-4 rounded-xl hover:bg-white/20 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 gradient-button text-white py-2 px-4 rounded-xl hover:shadow-lg transition-all"
              >
                Войти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
