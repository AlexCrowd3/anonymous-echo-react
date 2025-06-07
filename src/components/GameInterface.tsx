
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Users, MessageCircle, Play } from 'lucide-react';
import { WaitingAnimation } from './WaitingAnimation';
import { supabase } from '@/integrations/supabase/client';

interface GameInterfaceProps {
  chatId: string;
  onBack: () => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  chatId,
  onBack
}) => {
  const [chat, setChat] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fetchChatData();
    fetchAnswers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`chat-${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_players',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        fetchChatData();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'answers',
        filter: `chat_id=eq.${chatId}`
      }, () => {
        fetchAnswers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  const fetchChatData = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_players (
            user_id,
            profiles (username)
          )
        `)
        .eq('id', chatId)
        .single();

      if (error) throw error;

      const chatWithPlayerInfo = {
        ...data,
        player_count: data.chat_players?.length || 0,
        players: data.chat_players?.map((cp: any) => cp.profiles?.username || 'User') || []
      };

      setChat(chatWithPlayerInfo);
    } catch (error) {
      console.error('Error fetching chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const { data, error } = await supabase
        .from('answers')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myAnswers = data?.filter(a => a.user_id === user.id) || [];
        setUserAnswers(myAnswers);
      }

      setAllAnswers(data || []);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ is_started: true })
        .eq('id', chatId);

      if (error) throw error;
      
      setChat({ ...chat, is_started: true });
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const { error } = await supabase
        .from('answers')
        .insert({
          chat_id: chatId,
          user_id: user.id,
          question_index: currentQuestionIndex,
          answer: currentAnswer.trim()
        });

      if (error) throw error;

      setCurrentAnswer('');
      fetchAnswers();
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (chat?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-white">Комната не найдена</p>
      </div>
    );
  }

  const canStartGame = chat.player_count >= chat.min_players && !chat.is_started;
  const currentQuestion = chat.questions?.[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex >= (chat.questions?.length || 0) - 1;
  const hasAnswered = userAnswers.some(a => a.question_index === currentQuestionIndex);
  const currentQuestionAnswers = allAnswers.filter(a => a.question_index === currentQuestionIndex);

  if (!chat.is_started) {
    return (
      <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <button
                onClick={onBack}
                className="absolute top-4 left-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">{chat.name}</h1>
            
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-white/80 mb-2">
                <Users className="w-4 h-4" />
                <span>{chat.player_count}/{chat.max_players} игроков</span>
              </div>
              <div className="text-sm text-white/60">
                Игроки: {chat.players.join(', ')}
              </div>
            </div>

            {chat.player_count < chat.min_players ? (
              <WaitingAnimation
                currentPlayers={chat.player_count}
                minPlayers={chat.min_players}
                maxPlayers={chat.max_players}
              />
            ) : (
              <div className="text-center">
                <div className="text-white/80 mb-6">
                  Готовы начать игру?
                </div>
                <button
                  onClick={handleStartGame}
                  className="glass-button text-white py-3 px-8 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
                >
                  <Play className="w-5 h-5" />
                  Начать игру
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      {/* Header */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{chat.name}</h1>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{chat.player_count} игроков</span>
                </div>
                <span>Вопрос {currentQuestionIndex + 1} из {chat.questions?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        {/* Current Question */}
        <div className="glass-card rounded-2xl p-6 border border-white/30">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 text-white flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Текущий вопрос</h2>
              <p className="text-white/90 text-lg leading-relaxed">{currentQuestion}</p>
            </div>
          </div>
        </div>

        {/* Answer Input or Submitted Status */}
        {!hasAnswered ? (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Ваш ответ</h3>
            <div className="flex gap-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all resize-none"
                placeholder="Напишите то, что думаете..."
                rows={3}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim()}
                className="glass-button text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 border border-green-400/30 bg-green-500/10">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Ответ отправлен!</h3>
              <p className="text-white/80">Ждем ответов от других игроков...</p>
            </div>
          </div>
        )}

        {/* All Answers */}
        {currentQuestionAnswers.length > 0 && (
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Анонимные ответы ({currentQuestionAnswers.length})
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
              {currentQuestionAnswers.map((answer, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-4 rounded-xl border border-white/20"
                >
                  <p className="text-white/90 leading-relaxed">{answer.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="pt-4">
        {hasAnswered && !isLastQuestion && (
          <button
            onClick={handleNextQuestion}
            className="w-full glass-button text-white py-4 px-6 rounded-2xl font-medium text-lg hover:shadow-lg transition-all"
          >
            Следующий вопрос
          </button>
        )}

        {hasAnswered && isLastQuestion && (
          <div className="glass-card rounded-2xl p-6 text-center border border-green-400/30 bg-green-500/10">
            <h3 className="text-xl font-bold text-white mb-2">Игра завершена!</h3>
            <p className="text-white/80 mb-4">Спасибо за участие в анонимном чате</p>
            <button
              onClick={onBack}
              className="glass-button text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Вернуться в меню
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
