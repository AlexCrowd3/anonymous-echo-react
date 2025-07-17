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
  started_at?: string;
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

  // Функция для показа уведомлений
  const displayNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }, []);

  // Загрузка данных комнаты
  const fetchChatData = useCallback(async () => {
    if (!chatId) {
      navigate('/');
      return null;
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error || !data) {
      displayNotification('Комната не найдена', 'error');
      navigate('/');
      return null;
    }

    return data;
  }, [chatId, navigate, displayNotification]);

  // Загрузка списка игроков
  const fetchPlayersData = useCallback(async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('chat_players')
        .select('*, profiles(username)')
        .eq('chat_id', chatId);

      if (error) throw error;

      const updatedPlayers = data || [];
      setPlayers(updatedPlayers);
      
      // Проверяем является ли текущий пользователь создателем
      const currentUserIsCreator = updatedPlayers.some(
        p => p.user_id === user?.id && p.is_owner
      );
      setIsCreator(currentUserIsCreator);

      // Если нет создателя, но есть игроки - назначаем нового
      if (updatedPlayers.length > 0 && !updatedPlayers.some(p => p.is_owner)) {
        const newOwnerId = updatedPlayers[0].user_id;
        const { error: updateError } = await supabase
          .from('chat_players')
          .update({ is_owner: true })
          .eq('user_id', newOwnerId)
          .eq('chat_id', chatId);

        if (!updateError) {
          displayNotification('Новый создатель комнаты назначен', 'info');
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки игроков:', error);
    }
  }, [chatId, user?.id, displayNotification]);

  // Загрузка вопросов
  const fetchQuestionsData = useCallback(async () => {
    if (!chatId) return;

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('chat_id', chatId)
        .order('order', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
    }
  }, [chatId]);

  // Настройка подписок на изменения
  const setupSubscriptions = useCallback(() => {
    if (!chatId) return;

    // Отписываемся от старых подписок
    channelsRef.current.forEach(channel => supabase.removeChannel(channel));
    channelsRef.current = [];

    // Подписка на изменения игроков
    const playersChannel = supabase
      .channel('players_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_players',
        filter: `chat_id=eq.${chatId}`
      }, fetchPlayersData);

    // Подписка на изменения чата
    const chatChannel = supabase
      .channel('chat_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `id=eq.${chatId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          const updatedChat = payload.new as Chat;
          setChat(updatedChat);
          
          if (updatedChat.status === 'in_progress') {
            navigate(`/game/${chatId}`);
          }
        }
      });

    channelsRef.current = [
      playersChannel.subscribe(),
      chatChannel.subscribe()
    ];
  }, [chatId, fetchPlayersData, navigate]);

  // Запуск игры
  const startGame = async () => {
    if (!chat || !isCreator) return;
    
    if (players.length < chat.min_players) {
      displayNotification(`Нужно минимум ${chat.min_players} игроков`, 'error');
      return;
    }

    if (questions.length === 0) {
      displayNotification('Добавьте вопросы перед началом игры', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('chats')
        .update({ 
          status: 'in_progress',
          started_at: new Date().toISOString() 
        })
        .eq('id', chat.id);

      if (error) throw error;
      
      navigate(`/game/${chat.id}`);
    } catch (error) {
      console.error('Ошибка запуска игры:', error);
      displayNotification('Ошибка запуска игры', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Выход из комнаты
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

      displayNotification('Вы вышли из комнаты', 'success');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      displayNotification('Ошибка выхода', 'error');
    } finally {
      setIsLeaving(false);
    }
  };

  // Инициализация данных
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!chatId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        const chatData = await fetchChatData();
        if (!chatData || !mounted) return;

        setChat(chatData);

        await Promise.all([
          fetchPlayersData(),
          fetchQuestionsData()
        ]);

        if (chatData.status === 'in_progress') {
          navigate(`/game/${chatId}`);
          return;
        }

        setupSubscriptions();
      } catch (error) {
        console.error('Ошибка инициализации:', error);
        displayNotification('Ошибка загрузки данных', 'error');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initialize();

    return () => {
      mounted = false;
      channelsRef.current.forEach(channel => supabase.removeChannel(channel));
    };
  }, [chatId, displayNotification, fetchChatData, fetchPlayersData, fetchQuestionsData, navigate, setupSubscriptions]);

  if (loading && !chat) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-12 h-12 text-[#0092FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Уведомления */}
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
            <h2 className="text-3xl font-bold mb-2">{notificationMessage}</h2>
          </div>
        </div>
      )}

      {/* Основной интерфейс */}
      <div className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-white py-4 px-4 flex justify-between items-center border-b z-10">
          <button
            onClick={leaveRoom}
            disabled={isLeaving}
            className="p-2 text-[#0092FF] hover:bg-[#0092FF]/10 rounded-lg"
          >
            {isLeaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOut className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-xl font-bold text-[#0092FF]">{chat?.name}</h1>
          <div className="w-5"></div>
        </header>

        <div className="max-w-md mx-auto p-4">
          {/* Статистика комнаты */}
          <div className="bg-white rounded-lg shadow-sm border border-[#0092FF]/20 p-4 mb-4">
            <div className="flex justify-between mb-3">
              <div>
                <div className="text-2xl font-bold text-[#0092FF]">
                  {players.length}/{chat?.max_players}
                </div>
                <div className="text-sm text-gray-500">Игроков</div>
              </div>
              {chat?.password && (
                <div>
                  <div className="text-sm text-gray-500">Пароль</div>
                  <div className="text-lg font-bold text-[#0092FF]">
                    {chat.password}
                  </div>
                </div>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#0092FF] h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (players.length / (chat?.max_players || 1)) * 100)}%` 
                }}
              />
            </div>
          </div>

          {/* Список игроков */}
          <div className="bg-white rounded-lg shadow-sm border border-[#0092FF]/20 p-4 mb-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0092FF]" />
              Участники ({players.length})
            </h2>
            <div className="space-y-2">
              {players.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Ожидаем игроков...
                </div>
              ) : (
                players.map(player => (
                  <div 
                    key={player.user_id} 
                    className={`p-3 rounded-lg flex items-center gap-3 ${
                      player.is_owner ? 'bg-[#0092FF]/10' : 'bg-gray-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#0092FF]/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-[#0092FF]" />
                    </div>
                    <div className="font-medium">
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
          <div className="bg-white rounded-lg shadow-sm border border-[#0092FF]/20 p-4 mb-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#0092FF]" />
              Вопросы ({questions.length})
            </h2>
            <div className="space-y-2">
              {questions.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Вопросы не добавлены
                </div>
              ) : (
                questions.map((question, i) => (
                  <div key={question.id} className="p-3 rounded-lg bg-gray-50 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0092FF]/10 flex items-center justify-center mt-1">
                      <span className="text-sm font-bold">{i + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{question.question_text}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {question.is_ano ? 'Из базы' : 'Пользовательский'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка начала игры */}
      {isCreator && chat?.status === 'waiting' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-4 border-t">
          <button
            onClick={startGame}
            disabled={loading || players.length < (chat?.min_players || 0) || questions.length === 0}
            className={`w-full bg-[#0092FF] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
              (!loading && players.length >= chat.min_players && questions.length > 0)
                ? 'hover:bg-[#007acc]' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                Начать игру ({players.length}/{chat.max_players})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default WaitingRoom;