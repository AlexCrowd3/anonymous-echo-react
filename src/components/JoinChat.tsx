import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageCircle, Lock, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const JoinChat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [playersInfo, setPlayersInfo] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchChats = async () => {
      try {
        setLoading(true);
        
        // Получаем список доступных чатов
        const { data: chatsData, error: chatsError } = await supabase
          .from('chats')
          .select('*')
          .eq('status', 'waiting');

        if (chatsError) throw chatsError;

        setChats(chatsData || []);

        // Загружаем информацию об игроках для каждого чата
        const playersData: Record<string, string[]> = {};
        
        for (const chat of chatsData || []) {
          // Исправленный запрос для получения игроков
          const { data: players, error: playersError } = await supabase
            .from('chat_players')
            .select('user_id, profiles!inner(username)')
            .eq('chat_id', chat.id);

          if (playersError) throw playersError;

          playersData[chat.id] = players?.map(p => p.profiles?.username || 'Аноним') || [];
        }
        
        setPlayersInfo(playersData);
      } catch (err) {
        console.error('Error fetching chats:', err);
        setError('Ошибка загрузки комнат');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    chat.player_count < chat.max_players
  );

  const handleJoinClick = async (chat: any) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (chat.password) {
      setSelectedChat(chat);
      return;
    }
    await joinChat(chat);
  };

  const joinChat = async (chat: any, enteredPassword?: string) => {
    setError('');
    setJoining(true);

    try {
      // Проверяем пароль если требуется
      if (chat.password && chat.password !== enteredPassword) {
        throw new Error('Неверный пароль');
      }

      // Проверяем есть ли еще место в комнате
      const { data: currentChat } = await supabase
        .from('chats')
        .select('player_count, max_players')
        .eq('id', chat.id)
        .single();

      if (!currentChat || currentChat.player_count >= currentChat.max_players) {
        throw new Error('Комната уже заполнена');
      }

      // Добавляем пользователя в чат
      const { error: joinError } = await supabase
        .from('chat_players')
        .insert({
          chat_id: chat.id,
          user_id: user?.id,
          is_owner: false
        });

      if (joinError) throw joinError;

      // Обновляем счетчик игроков
      const { error: updateError } = await supabase
        .from('chats')
        .update({ player_count: currentChat.player_count + 1 })
        .eq('id', chat.id);

      if (updateError) throw updateError;

      // Успешное присоединение
      navigate(`/waiting-room/${chat.id}`);

    } catch (err: any) {
      console.error('Join error:', err);
      setError(err.message || 'Ошибка при подключении');
    } finally {
      setJoining(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (selectedChat) {
      await joinChat(selectedChat, password);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0092FF]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      <header className="w-full py-4 px-4 flex justify-between items-center bg-white z-20 shadow-sm relative">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-[#0092FF]/80 hover:text-[#0092FF] hover:bg-[#0092FF]/10 rounded-lg transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-bold text-[#0092FF]">Присоединиться</h1>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#0092FF]/10 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-[#0092FF]" />
        </div>
      </header>

      {/* Встроенный компонент поиска */}
      <div className="px-4 pt-2 pb-4 z-20">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all pl-10"
            placeholder="Поиск комнат по названию..."
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 mb-4">
          <div className="bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24 z-10">
        {filteredChats.length === 0 ? (
          <div className="bg-white/90 rounded-2xl p-8 text-center border border-[#0092FF]/20 shadow-sm">
            <MessageCircle className="w-12 h-12 text-[#0092FF]/60 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Ничего не найдено' : 'Нет доступных комнат'}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте новую комнату или подождите'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredChats.map((chat) => (
              <div 
                key={chat.id}
                className="bg-white/90 rounded-xl p-5 border border-[#0092FF]/20 shadow-sm hover:shadow-md transition-all hover:border-[#0092FF]/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{chat.name}</h3>
                      {chat.password && <Lock className="w-4 h-4 text-[#0092FF]/60" />}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{chat.player_count}/{chat.max_players}</span>
                      </div>
                    </div>

                    {playersInfo[chat.id]?.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500">Игроки: </span>
                        <span className="text-xs text-gray-700">
                          {playersInfo[chat.id].join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleJoinClick(chat)}
                    disabled={joining}
                    className="bg-[#0092FF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#007acc] transition-all disabled:opacity-50"
                  >
                    {joining ? '...' : 'Войти'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedChat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#0092FF]" />
              Введите пароль
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all mb-4"
              placeholder="Пароль"
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedChat(null);
                  setPassword('');
                  setError('');
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all"
              >
                Отмена
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={joining || !password}
                className="flex-1 bg-[#0092FF] text-white py-2 px-4 rounded-lg hover:bg-[#007acc] transition-all disabled:opacity-50"
              >
                {joining ? '...' : 'Войти'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinChat;