
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Users, MessageCircle, Play } from 'lucide-react';
import { Chat, User } from '../pages/Index';

interface GameInterfaceProps {
  chat: Chat;
  user: User;
  onBack: () => void;
  onUpdateChat: (chat: Chat) => void;
}

export const GameInterface: React.FC<GameInterfaceProps> = ({
  chat,
  user,
  onBack,
  onUpdateChat
}) => {
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [userAnswers, setUserAnswers] = useState<string[]>([]);

  const canStartGame = chat.players.length >= chat.minPlayers && !chat.isStarted;
  const currentQuestion = chat.questions[chat.currentQuestionIndex];
  const isLastQuestion = chat.currentQuestionIndex >= chat.questions.length - 1;

  const handleStartGame = () => {
    const updatedChat = { ...chat, isStarted: true };
    onUpdateChat(updatedChat);
  };

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...userAnswers, currentAnswer.trim()];
      setUserAnswers(newAnswers);
      setCurrentAnswer('');

      const updatedChat = { ...chat };
      if (!updatedChat.answers[user.id]) {
        updatedChat.answers[user.id] = [];
      }
      updatedChat.answers[user.id].push(currentAnswer.trim());

      onUpdateChat(updatedChat);
    }
  };

  const handleNextQuestion = () => {
    if (!isLastQuestion) {
      const updatedChat = { ...chat };
      updatedChat.currentQuestionIndex++;
      onUpdateChat(updatedChat);
    }
  };

  const getAllAnswersForCurrentQuestion = () => {
    const answers: string[] = [];
    Object.values(chat.answers).forEach(userAnswers => {
      if (userAnswers[chat.currentQuestionIndex]) {
        answers.push(userAnswers[chat.currentQuestionIndex]);
      }
    });
    return answers;
  };

  const allAnswers = getAllAnswersForCurrentQuestion();
  const hasAnswered = userAnswers.length > chat.currentQuestionIndex;

  if (!chat.isStarted) {
    return (
      <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden">
        <div className="w-full max-w-md">
          <div className="gradient-card rounded-2xl p-8 text-center">
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
                <span>{chat.players.length}/{chat.maxPlayers} игроков</span>
              </div>
              <div className="text-sm text-white/60">
                Игроки: {chat.players.join(', ')}
              </div>
            </div>

            {chat.players.length < chat.minPlayers ? (
              <div className="text-center">
                <div className="text-white/80 mb-4">
                  Ожидание игроков...
                </div>
                <div className="text-sm text-white/60">
                  Нужно еще {chat.minPlayers - chat.players.length} игроков для начала
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-white/80 mb-6">
                  Готовы начать игру?
                </div>
                <button
                  onClick={handleStartGame}
                  className="gradient-button text-white py-3 px-8 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
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
      <div className="gradient-card rounded-2xl p-4 mb-4">
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
                  <span>{chat.players.length} игроков</span>
                </div>
                <span>Вопрос {chat.currentQuestionIndex + 1} из {chat.questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Current Question */}
        <div className="gradient-card rounded-2xl p-6 border border-white/30">
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
          <div className="gradient-card rounded-2xl p-6">
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
                className="gradient-button text-white p-3 rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="gradient-card rounded-2xl p-6 border border-green-400/30 bg-green-500/10">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Ответ отправлен!</h3>
              <p className="text-white/80">Ждем ответов от других игроков...</p>
            </div>
          </div>
        )}

        {/* All Answers */}
        {allAnswers.length > 0 && (
          <div className="gradient-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Анонимные ответы ({allAnswers.length})
            </h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {allAnswers.map((answer, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-4 rounded-xl border border-white/20"
                >
                  <p className="text-white/90 leading-relaxed">{answer}</p>
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
            className="w-full gradient-button text-white py-4 px-6 rounded-2xl font-medium text-lg hover:shadow-lg transition-all"
          >
            Следующий вопрос
          </button>
        )}

        {hasAnswered && isLastQuestion && (
          <div className="gradient-card rounded-2xl p-6 text-center border border-green-400/30 bg-green-500/10">
            <h3 className="text-xl font-bold text-white mb-2">Игра завершена!</h3>
            <p className="text-white/80 mb-4">Спасибо за участие в анонимном чате</p>
            <button
              onClick={onBack}
              className="gradient-button text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Вернуться в меню
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
