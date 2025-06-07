
import React, { useState } from 'react';
import { ArrowLeft, Send, Users, MessageCircle } from 'lucide-react';
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

  const currentQuestion = chat.questions[chat.currentQuestionIndex];
  const isLastQuestion = chat.currentQuestionIndex >= chat.questions.length - 1;

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      const newAnswers = [...userAnswers, currentAnswer.trim()];
      setUserAnswers(newAnswers);
      setCurrentAnswer('');

      // Обновляем чат с новым ответом
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-4 mb-6 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">{chat.name}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-400">
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

        {/* Current Question */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <MessageCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">Текущий вопрос</h2>
              <p className="text-purple-100 text-lg">{currentQuestion}</p>
            </div>
          </div>
        </div>

        {/* Answer Input */}
        {!hasAnswered ? (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Ваш ответ</h3>
            <div className="flex gap-3">
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                placeholder="Введите ваш анонимный ответ..."
                rows={3}
              />
              <button
                onClick={handleSubmitAnswer}
                disabled={!currentAnswer.trim()}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-green-500/30">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Ответ отправлен!</h3>
              <p className="text-green-300">Ждем ответов от других игроков...</p>
            </div>
          </div>
        )}

        {/* All Answers */}
        {allAnswers.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Анонимные ответы ({allAnswers.length})
            </h3>
            <div className="space-y-3">
              {allAnswers.map((answer, index) => (
                <div
                  key={index}
                  className="bg-slate-900/50 p-4 rounded-lg border border-slate-600"
                >
                  <p className="text-slate-300">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Question Button */}
        {hasAnswered && !isLastQuestion && (
          <button
            onClick={handleNextQuestion}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Следующий вопрос
          </button>
        )}

        {/* Game Complete */}
        {hasAnswered && isLastQuestion && (
          <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Игра завершена!</h3>
            <p className="text-green-300 mb-4">Спасибо за участие в анонимном чате</p>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              Вернуться в меню
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
