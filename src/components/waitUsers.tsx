import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Users, Play, LogOut, User, Crown, Loader2, CheckCircle, XCircle } from 'lucide-react';

const WaitingRoom: React.FC = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [isLeaving, setIsLeaving] = useState(false);

  const displayNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), type === 'success' ? 3000 : 2000);
  };

  useEffect(() => {
    if (!chatId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();

      if (chatError || !chatData) {
        console.error('Ошибка при получении комнаты:', chatError);
        navigate('/');
        return;
      }

      setChat(chatData);
      setIsCreator(chatData.created_by === user?.id);
      await fetchPlayers();
      setLoading(false);
    };

    const fetchPlayers = async () => {
      const { data: playersData, error: playersError } = await supabase
        .from('chat_players')
        .select('*, profiles(username)')
        .eq('chat_id', chatId);

      if (!playersError) {
        setPlayers(playersData || []);
      }
    };

    const playersSubscription = supabase
      .channel('chat_players_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_players',
        filter: `chat_id=eq.${chatId}`
      }, fetchPlayers)
      .subscribe();

    const chatSubscription = supabase
      .channel('chat_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats',
        filter: `id=eq.${chatId}`
      }, async (payload) => {
        if (payload.eventType === 'DELETE') {
          displayNotification('Комната закрыта создателем', 'info');
          setTimeout(() => navigate('/'), 3000);
        }
      })
      .subscribe();

    fetchData();

    return () => {
      playersSubscription.unsubscribe();
      chatSubscription.unsubscribe();
    };
  }, [chatId, navigate, user?.id]);

  const startGame = async () => {
    if (!chat || !isCreator) return;
    
    if (players.length < chat.max_players) {
      displayNotification(`Нужно ${chat.max_players} игроков для начала`, 'error');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('chats')
      .update({ status: 'started' })
      .eq('id', chat.id);

    setLoading(false);
    
    if (error) {
      displayNotification('Ошибка при запуске игры', 'error');
      console.error(error);
      return;
    }

    displayNotification('Игра начинается!', 'success');
    setTimeout(() => navigate(`/chat/${chat.id}`), 2000);
  };

  const leaveRoom = async () => {
    if (!user || !chatId || isLeaving) return;
    setIsLeaving(true);

    try {
      if (isCreator) {
        await supabase.from('questions').delete().eq('chat_id', chatId);
        await supabase.from('chat_players').delete().eq('chat_id', chatId);
        
        const { error: deleteError } = await supabase
          .from('chats')
          .delete()
          .eq('id', chatId);

        if (deleteError) throw deleteError;
        
        displayNotification('Комната успешно удалена', 'success');
        setTimeout(() => navigate('/'), 3000);
      } else {
        const { error } = await supabase
          .from('chat_players')
          .delete()
          .eq('user_id', user.id)
          .eq('chat_id', chatId);

        if (error) throw error;
        displayNotification('Вы вышли из комнаты', 'success');
        setTimeout(() => navigate('/'), 2000);
      }
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
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative pb-24">
      {/* Анимация поиска игроков */}
      <div className="w-full h-64 flex items-center justify-center bg-white z-10">
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
        }`}
        style={{ animation: 'fadeIn 0.5s ease-out forwards' }}>
          <div className="text-white text-center p-6" style={{ animation: 'scaleIn 0.5s ease-out forwards' }}>
            {notificationType === 'success' ? (
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ animation: 'bounce 1s infinite' }} />
            ) : notificationType === 'error' ? (
              <XCircle className="w-16 h-16 mx-auto mb-4" style={{ animation: 'pulse 1.5s infinite' }} />
            ) : null}
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {notificationMessage}
            </h2>
            <div className="h-1 bg-white/50 mt-4 w-full overflow-hidden">
              <div className="h-full bg-white" style={{ 
                animation: `progress ${notificationType === 'success' ? 3 : 2}s linear forwards` 
              }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="flex-1 overflow-y-auto z-20 px-4">
        <header className="w-full py-4 flex justify-between items-center bg-white sticky top-0">
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

        <div className="max-w-md mx-auto mt-4">
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

          <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5 mb-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0092FF]" />
              Участники комнаты
            </h2>
            
            <div className="space-y-3 max-h-[40vh] overflow-y-auto">
              {players.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  Ожидаем игроков...
                </div>
              ) : (
                players.map((player) => (
                  <div 
                    key={player.user_id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      player.user_id === chat?.created_by 
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
                    {player.user_id === chat?.created_by && (
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
        </div>
      </div>

      {/* Кнопка начала игры */}
      {isCreator && (
        <div className="fixed bottom-0 left-0 right-0 bg-white py-3 px-4 border-t border-gray-200 z-30"
        style={{ animation: 'slideUp 0.5s ease-out forwards' }}>
          <button
            onClick={startGame}
            disabled={players.length < (chat?.max_players || 0) || loading}
            className={`w-full bg-[#0092FF] text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 ${
              players.length >= (chat?.max_players || 0) 
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

      {/* Глобальные стили для анимаций */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default WaitingRoom;