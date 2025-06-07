
import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Gamepad2, Database } from 'lucide-react';

interface CreateChatProps {
  onBack: () => void;
  onCreate: (chatName: string, mode: 'custom' | 'database', questions?: string[]) => void;
}

export const CreateChat: React.FC<CreateChatProps> = ({ onBack, onCreate }) => {
  const [chatName, setChatName] = useState('');
  const [mode, setMode] = useState<'custom' | 'database'>('custom');
  const [questions, setQuestions] = useState<string[]>(['']);

  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatName.trim()) {
      if (mode === 'custom') {
        const validQuestions = questions.filter(q => q.trim() !== '');
        if (validQuestions.length === 0) {
          alert('Добавьте хотя бы один вопрос!');
          return;
        }
        onCreate(chatName.trim(), mode, validQuestions);
      } else {
        onCreate(chatName.trim(), mode);
      }
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Создать новый чат</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chat Name */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Название чата
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Введите название чата"
              required
            />
          </div>

          {/* Mode Selection */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Режим игры</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'custom'
                    ? 'border-purple-500 bg-purple-500/20 text-white'
                    : 'border-slate-600 bg-slate-900/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Gamepad2 className="w-6 h-6" />
                  <span className="font-medium">Свои вопросы</span>
                  <span className="text-xs opacity-75">Создайте вопросы сами</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('database')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'database'
                    ? 'border-pink-500 bg-pink-500/20 text-white'
                    : 'border-slate-600 bg-slate-900/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Database className="w-6 h-6" />
                  <span className="font-medium">Из базы данных</span>
                  <span className="text-xs opacity-75">5 случайных вопросов</span>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Questions */}
          {mode === 'custom' && (
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Ваши вопросы</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder={`Вопрос ${index + 1}`}
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-3 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all"
          >
            Создать чат
          </button>
        </form>
      </div>
    </div>
  );
};
