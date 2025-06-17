import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, MessageCircle, Database, Gamepad2, Lock, User as UserIcon } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { WaitingAnimation } from './WaitingAnimation';
import { useChats } from '../hooks/useChats';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const JoinChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session, refreshSession } = useAuth();
  const { chats, loading, refetch } = useChats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error || !currentSession) {
          console.error('Нет активной сессии:', error);
          navigate('/login');
          return;
        }
        
        if (!user) {
          await refreshSession();
        }
        
        refetch();
      } catch (err) {
        console.error('Ошибка проверки сессии:', err);
        navigate('/login');
      }
    };
    
    checkSession();
  }, [location, refetch, navigate, refreshSession, user]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    navigate(-1);
  };

  const handleJoinClick = async (chat: any) => {
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
      // Получаем текущую сессию
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Ошибка получения сессии:', sessionError);
        throw new Error('Ошибка авторизации. Пожалуйста, войдите снова.');
      }

      if (!currentSession?.user) {
        throw new Error('Сессия недействительна. Пожалуйста, войдите снова.');
      }

      const currentUser = currentSession.user;

      // Проверка пароля
      if (chat.password && chat.password !== enteredPassword) {
        throw new Error('Неверный пароль!');
      }

      // Проверка количества игроков
      if (chat.player_count >= chat.max_players) {
        throw new Error('Комната переполнена!');
      }

      // Присоединяемся к чату
      const { error: joinError } = await supabase
        .from('chat_players')
        .insert({
          chat_id: chat.id,
          user_id: currentUser.id
        });

      if (joinError) {
        if (joinError.message.includes('duplicate key')) {
          // Если пользователь уже в комнате - перенаправляем
          navigate(`/waiting-room/${chat.id}`);
          return;
        }
        throw joinError;
      }

      // Обновляем количество игроков
      await supabase
        .from('chats')
        .update({ player_count: chat.player_count + 1 })
        .eq('id', chat.id);

      navigate(`/waiting-room/${chat.id}`);

    } catch (err: any) {
      console.error('Ошибка при присоединении:', err);
      
      // Определяем тип ошибки
      if (err.message.includes('invalid JWT') || err.message.includes('Сессия')) {
        setError('Сессия устарела. Пожалуйста, войдите снова.');
        setTimeout(() => navigate('/login'), 1500);
      } else if (err.message.includes('duplicate key')) {
        setError('Вы уже в этой комнате. Перенаправляем...');
        setTimeout(() => navigate(`/waiting-room/${selectedChat.id}`), 1500);
      } else {
        setError(err.message || 'Ошибка при подключении к комнате');
      }
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

  const getQuestionCount = async (chatId: string) => {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('chat_id', chatId);
    return count || 0;
  };

  if (loading || !session) {
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
          onClick={handleBack}
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

      <div className="px-4 pt-2 pb-4 z-20">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск комнат по названию..."
        />
      </div>

      {error && (
        <div className="px-4 mb-4">
          <div className="bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
            {error.includes('Сессия') && (
              <button 
                onClick={() => navigate('/login')}
                className="mt-2 text-blue-600 underline"
              >
                Войти снова
              </button>
            )}
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
              <ChatCard 
                key={chat.id}
                chat={chat}
                onJoin={handleJoinClick}
                joining={joining}
                getQuestionCount={getQuestionCount}
              />
            ))}
          </div>
        )}
      </div>

      {selectedChat && (
        <PasswordModal
          onClose={() => {
            setSelectedChat(null);
            setPassword('');
            setError('');
          }}
          onSubmit={handlePasswordSubmit}
          password={password}
          setPassword={setPassword}
          joining={joining}
        />
      )}
    </div>
  );
};

const ChatCard = ({ chat, onJoin, joining, getQuestionCount }: any) => {
  const [questionCount, setQuestionCount] = useState(chat.questions?.length || 0);

  useEffect(() => {
    const loadQuestionCount = async () => {
      const count = await getQuestionCount(chat.id);
      setQuestionCount(count);
    };
    loadQuestionCount();
  }, [chat.id, getQuestionCount]);

  return (
    <div className="bg-white/90 rounded-xl p-5 border border-[#0092FF]/20 shadow-sm hover:shadow-md transition-all hover:border-[#0092FF]/40">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{chat.name}</h3>
            {chat.password && <Lock className="w-4 h-4 text-[#0092FF]/60" />}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
              chat.mode === 'custom' 
                ? 'bg-[#0092FF]/20 text-[#0092FF]' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {chat.mode === 'custom' ? <Gamepad2 className="w-3 h-3" /> : <Database className="w-3 h-3" />}
              {chat.mode === 'custom' ? 'Свои вопросы' : 'Из базы'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{chat.player_count}/{chat.max_players}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{questionCount} вопросов</span>
            </div>
          </div>

          {chat.players?.length > 0 && (
            <div className="mb-2">
              <span className="text-xs text-gray-500">Игроки: </span>
              <span className="text-xs text-gray-700">
                {chat.players.join(', ')}
              </span>
            </div>
          )}

          {chat.is_started ? (
            <div className="mt-2">
              <span className="text-xs bg-green-500/10 text-green-700 px-2 py-1 rounded-full">
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
              <span className="text-xs bg-blue-500/10 text-blue-700 px-2 py-1 rounded-full">
                Готов к запуску
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onJoin(chat)}
          disabled={chat.player_count >= chat.max_players || joining}
          className="bg-[#0092FF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#007acc] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joining ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
          ) : (
            'Войти'
          )}
        </button>
      </div>
    </div>
  );
};

const PasswordModal = ({ onClose, onSubmit, password, setPassword, joining }: any) => {
  return (
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
          onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all"
          >
            Отмена
          </button>
          <button
            onClick={onSubmit}
            disabled={joining}
            className="flex-1 bg-[#0092FF] text-white py-2 px-4 rounded-lg hover:bg-[#007acc] transition-all disabled:opacity-50"
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
  );
};

export default JoinChat;