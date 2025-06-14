
import React, { useState } from 'react';
import { ArrowLeft, Users, MessageCircle, Database, Gamepad2, Lock } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { WaitingAnimation } from './WaitingAnimation';
import { useChats } from '../hooks/useChats';
import { supabase } from '@/integrations/supabase/client';

interface JoinChatProps {
  onBack: () => void;
  onJoin: (chatId: string) => void;
}

export const JoinChat: React.FC<JoinChatProps> = ({ onBack, onJoin }) => {
  const { chats, loading } = useChats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [joining, setJoining] = useState(false);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinClick = async (chat: any) => {
    if (chat.password) {
      setSelectedChat(chat);
      return;
    }
    await joinChat(chat);
  };

  const joinChat = async (chat: any, enteredPassword?: string) => {
    if (chat.password && chat.password !== enteredPassword) {
      alert('Неверный пароль!');
      return;
    }

    if (chat.player_count >= chat.max_players) {
      alert('Комната переполнена!');
      return;
    }

    setJoining(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const { error } = await supabase
        .from('chat_players')
        .insert({
          chat_id: chat.id,
          user_id: user.id
        });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      onJoin(chat.id);
    } catch (error: any) {
      console.error('Error joining chat:', error);
      alert('Ошибка при подключении к комнате');
    } finally {
      setJoining(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (selectedChat) {
      await joinChat(selectedChat, password);
      setSelectedChat(null);
      setPassword('');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

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

      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск комнат по названию..."
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {filteredChats.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-white/60 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchQuery ? 'Ничего не найдено' : 'Нет доступных комнат'}
              </h3>
              <p className="text-white/70">
                {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте новую комнату или подождите'}
              </p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="glass-card rounded-2xl p-6 hover:bg-white/15 transition-all"
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
                        <span>{chat.player_count}/{chat.max_players} игроков</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{chat.questions?.length || 0} вопросов</span>
                      </div>
                    </div>

                    {chat.players.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-white/50">Игроки: </span>
                        <span className="text-xs text-white/70">
                          {chat.players.join(', ')}
                        </span>
                      </div>
                    )}

                    {chat.is_started ? (
                      <div className="mt-2">
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                          Игра началась
                        </span>
                      </div>
                    ) : chat.player_count < chat.min_players ? (
                      <div className="mt-2 flex items-center gap-2">
                        <WaitingAnimation 
                          currentPlayers={chat.player_count}
                          minPlayers={chat.min_players}
                          maxPlayers={chat.max_players}
                        />
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
                    disabled={chat.player_count >= chat.max_players || joining}
                    className="glass-button text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joining ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Войти'
                    )}
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
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm">
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
                disabled={joining}
                className="flex-1 glass-button text-white py-2 px-4 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                {joining ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                ) : (
                  'Войти'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinChat