
import React, { useState } from 'react';
import { ArrowLeft, Plus, Minus, Gamepad2, Database, Lock, Users } from 'lucide-react';

interface CreateChatProps {
  onBack: () => void;
  onCreate: (
    chatName: string, 
    mode: 'custom' | 'database', 
    questions?: string[], 
    password?: string,
    maxPlayers?: number,
    minPlayers?: number
  ) => void;
}

export const CreateChat: React.FC<CreateChatProps> = ({ onBack, onCreate }) => {
  const [chatName, setChatName] = useState('');
  const [mode, setMode] = useState<'custom' | 'database'>('custom');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [minPlayers, setMinPlayers] = useState(2);

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
        onCreate(
          chatName.trim(), 
          mode, 
          validQuestions,
          hasPassword ? password : undefined,
          maxPlayers,
          minPlayers
        );
      } else {
        onCreate(
          chatName.trim(), 
          mode, 
          undefined,
          hasPassword ? password : undefined,
          maxPlayers,
          minPlayers
        );
      }
    }
  };

  return (
    <div className="h-screen flex flex-col p-4 overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Создать комнату</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chat Name */}
          <div className="gradient-card rounded-2xl p-6">
            <label className="block text-sm font-medium text-white/90 mb-3">
              Название комнаты
            </label>
            <input
              type="text"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Введите название"
              required
            />
          </div>

          {/* Player Settings */}
          <div className="gradient-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Настройки игроков
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Минимум</label>
                <input
                  type="number"
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="2"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Максимум</label>
                <input
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Math.max(minPlayers, parseInt(e.target.value) || 10))}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  min={minPlayers}
                  max="20"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="gradient-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Пароль
              </h3>
              <button
                type="button"
                onClick={() => setHasPassword(!hasPassword)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  hasPassword 
                    ? 'bg-white/20 text-white' 
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {hasPassword ? 'Включен' : 'Выключен'}
              </button>
            </div>
            {hasPassword && (
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Введите пароль"
              />
            )}
          </div>

          {/* Mode Selection */}
          <div className="gradient-card rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Режим игры</h3>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'custom'
                    ? 'border-white/50 bg-white/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Gamepad2 className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Свои вопросы</div>
                    <div className="text-sm opacity-75">Создайте вопросы сами</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('database')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  mode === 'database'
                    ? 'border-white/50 bg-white/20 text-white'
                    : 'border-white/20 bg-white/5 text-white/70 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-medium">Из базы данных</div>
                    <div className="text-sm opacity-75">5 случайных вопросов</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Custom Questions */}
          {mode === 'custom' && (
            <div className="gradient-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Ваши вопросы</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="gradient-button text-white p-2 rounded-lg hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-40 overflow-y-auto">
                {questions.map((question, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => updateQuestion(index, e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                      placeholder={`Вопрос ${index + 1}`}
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-3 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-xl transition-all"
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
            className="w-full gradient-button text-white py-4 px-6 rounded-2xl font-medium text-lg hover:shadow-lg transition-all"
          >
            Создать комнату
          </button>
        </form>
      </div>
    </div>
  );
};
