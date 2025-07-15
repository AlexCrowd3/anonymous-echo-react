import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Play, LogOut, User, Crown, Loader2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

interface Chat {
  id: string;
  name: string;
  status: string;
  max_players: number;
  min_players: number;
  password?: string;
}

interface Player {
  user_id: string;
  is_owner: boolean;
  profiles?: {
    username: string;
  };
}

interface Question {
  id: string;
  question_text: string;
  is_ano: boolean;
  order: number;
}

const WaitingRoom: React.FC = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [chat, setChat] = useState<Chat | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [isLeaving, setIsLeaving] = useState(false);
  
  const channelsRef = useRef<any[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  const displayNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), type === 'success' ? 3000 : 2000);
  }, []);

  const fetchChatData = useCallback(async (): Promise<Chat | null> => {
    if (!chatId) {
      navigate('/');
      return null;
    }

    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (chatError || !chatData) {
      console.error('Ошибка при получении комнаты:', chatError);
      displayNotification('Комната не найдена', 'error');
      navigate('/');
      return null;
    }

    return chatData;
  }, [chatId, navigate, displayNotification]);

  const fetchPlayersData = useCallback(async () => {
    if (!chatId) return;

    const { data: playersData, error: playersError } = await supabase
      .from('chat_players')
      .select('*, profiles(username)')
      .eq('chat_id', chatId);

    if (playersError) {
      console.error('Ошибка при получении игроков:', playersError);
      return;
    }

    setPlayers(playersData || []);
    setIsCreator(playersData?.some(p => p.user_id === user?.id && p.is_owner) || false);
  }, [chatId, user?.id]);

  const fetchQuestionsData = useCallback(async () => {
    if (!chatId) return;

    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('chat_id', chatId)
      .order('order', { ascending: true });

    if (questionsError) {
      console.error('Ошибка при получении вопросов:', questionsError);
      return;
    }

    setQuestions(questionsData || []);
  }, [chatId]);

  const setupSubscriptions = useCallback(async () => {
    if (!chatId) return;

    // Отписываемся от всех предыдущих каналов
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    try {
      // Подписка на изменения игроков
      const playersChannel = supabase
        .channel('chat_players_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chat_players',
          filter: `chat_id=eq.${chatId}`
        }, async (payload) => {
          // Принудительно обновляем данные игроков
          await fetchPlayersData();
        });

      // Подписка на изменения чата
      const chatChannel = supabase
        .channel('chat_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `id=eq.${chatId}`
        }, (payload) => {
          if (payload.eventType === 'DELETE') {
            displayNotification('Комната закрыта', 'info');
            setTimeout(() => navigate('/'), 3000);
          } else if (payload.eventType === 'UPDATE') {
            setChat(payload.new as Chat);
            if ((payload.new as Chat).status === 'in_progress') {
              navigate(`/game/${chatId}`);
            }
          }
        });

      // Подписка на изменения вопросов
      const questionsChannel = supabase
        .channel('questions_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `chat_id=eq.${chatId}`
        }, async () => {
          // Принудительно обновляем вопросы
          await fetchQuestionsData();
        });

      // Сохраняем подписки
      channelsRef.current = [
        playersChannel.subscribe(),
        chatChannel.subscribe(),
        questionsChannel.subscribe()
      ];
    } catch (error) {
      console.error('Ошибка при создании подписок:', error);
    }
  }, [chatId, displayNotification, fetchPlayersData, fetchQuestionsData, navigate]);

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    const initializeData = async () => {
      try {
        setLoading(true);
        
        const chatData = await fetchChatData();
        if (!chatData) return;

        setChat(chatData);

        await Promise.all([
          fetchPlayersData(),
          fetchQuestionsData()
        ]);

        if (chatData.status === 'in_progress') {
          navigate(`/game/${chatId}`);
          return;
        }

        await setupSubscriptions();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        displayNotification('Ошибка загрузки данных', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    return () => {
      // Отписываемся от всех каналов при размонтировании
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [chatId, displayNotification, fetchChatData, fetchPlayersData, fetchQuestionsData, navigate, setupSubscriptions]);

  const startGame = async () => {
    if (!chat || !isCreator) return;
    
    if (players.length < chat.min_players) {
      displayNotification(`Нужно минимум ${chat.min_players} игроков`, 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'in_progress' })
        .eq('id', chat.id);

      if (error) throw error;
      
      displayNotification('Игра начинается!', 'success');
      setTimeout(() => navigate(`/game/${chat.id}`), 2000);
    } catch (error) {
      console.error('Ошибка при запуске игры:', error);
      displayNotification('Ошибка при запуске игры', 'error');
    } finally {
      setLoading(false);
    }
  };

  const leaveRoom = async () => {
    if (!user || !chatId || isLeaving) return;
    setIsLeaving(true);

    try {
      // Удаляем пользователя из комнаты
      const { error } = await supabase
        .from('chat_players')
        .delete()
        .eq('user_id', user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      // Проверяем остались ли игроки
      const { count } = await supabase
        .from('chat_players')
        .select('*', { count: 'exact', head: true })
        .eq('chat_id', chatId);

      // Если игроков не осталось - удаляем комнату
      if (count === 0) {
        await supabase.from('questions').delete().eq('chat_id', chatId);
        await supabase.from('chats').delete().eq('id', chatId);
      }

      displayNotification('Вы вышли из комнаты', 'success');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Ошибка при выходе из комнаты:', error);
      displayNotification('Ошибка при выходе', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  if (loading && !chat) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-12 h-12 text-[#0092FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Анимация поиска игроков */}
      <div className="w-full h-64 flex-shrink-0 flex items-center justify-center bg-white">
        <div className="relative">
          <div className="w-48 h-48 rounded-full border-4 border-[#0092FF] border-t-transparent animate-spin"></div>
          <Users className="absolute inset-0 m-auto w-12 h-12 text-[#0092FF]" />
        </div>
      </div>

      {/* Уведомление */}
      {showNotification && (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${
          notificationType === 'success' ? 'bg-[#0092FF]' : 
          notificationType === 'error' ? 'bg-red-500' : 'bg-[#0092FF]'
        }`}>
          <div className="text-white text-center p-6">
            {notificationType === 'success' ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
            ) : notificationType === 'error' ? (
              <XCircle className="w-16 h-16 mx-auto mb-4" />
            ) : null}
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {notificationMessage}
            </h2>
          </div>
        </div>
      )}

      {/* Основной контент с прокруткой */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto" ref={contentRef}>
          <header className="w-full py-4 flex justify-between items-center bg-white sticky top-0 z-10 px-4">
            <button
              onClick={leaveRoom}
              disabled={isLeaving}
              className="p-2 text-[#0092FF]/80 hover:text-[#0092FF] hover:bg-[#0092FF]/10 rounded-lg transition-all group disabled:opacity-50"
            >
              {isLeaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              )}
            </button>
            
            <h1 className="text-xl md:text-2xl font-bold text-[#0092FF]">{chat?.name}</h1>
            
            <div className="w-10"></div>
          </header>

          <div className="max-w-md mx-auto mt-4 pb-24 px-4">
            {/* Блок с информацией о комнате */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5 mb-5">
              <div className="flex justify-between items-center mb-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-[#0092FF]">
                    {players.length}/{chat?.max_players || 0}
                  </div>
                  <div className="text-sm text-gray-500">Игроков</div>
                </div>
                
                {chat?.password && (
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Пароль</div>
                    <div className="text-lg md:text-xl font-bold text-[#0092FF]">
                      {chat.password}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                <div 
                  className="bg-[#0092FF] h-2.5 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${Math.min(100, (players.length / (chat?.max_players || 1)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Список игроков */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5 mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0092FF]" />
                Участники комнаты ({players.length})
              </h2>
              
              <div className="space-y-3">
                {players.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Ожидаем игроков...
                  </div>
                ) : (
                  players.map((player) => (
                    <div 
                      key={player.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        player.is_owner 
                          ? 'bg-[#0092FF]/10 border border-[#0092FF]/20' 
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#0092FF]/10 flex items-center justify-center text-[#0092FF]">
                        <User className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="font-medium text-gray-900">
                        {player.profiles?.username || 'Аноним'}
                      </div>
                      {player.is_owner && (
                        <div className="ml-auto flex items-center gap-1 text-yellow-500">
                          <Crown className="w-4 h-4" />
                          <span className="text-xs">Создатель</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Список вопросов */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5 mb-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0092FF]" />
                Вопросы ({questions.length})
              </h2>
              
              <div className="space-y-3">
                {questions.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    Вопросы не добавлены
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <div 
                      key={question.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#0092FF]/10 flex items-center justify-center text-[#0092FF] mt-1">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {question.question_text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {question.is_ano ? 'Из базы вопросов' : 'Пользовательский'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка начала игры */}
      {isCreator && (
        <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-4 border-t border-gray-200 z-30">
          <button
            onClick={startGame}
            disabled={players.length < (chat?.min_players || 0) || loading}
            className={`w-full bg-[#0092FF] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
              players.length >= (chat?.min_players || 0) 
                ? 'hover:bg-[#007acc]' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                Начать игру ({players.length}/{chat?.max_players})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;