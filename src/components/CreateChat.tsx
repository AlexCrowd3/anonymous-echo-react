import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Gamepad2, Database, Lock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const CreateChat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatName, setChatName] = useState('');
  const [mode, setMode] = useState<'custom' | 'ano'>('custom');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [playerCount, setPlayerCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [anoQuestions, setAnoQuestions] = useState<string[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Загрузка вопросов ANO из базы данных
  useEffect(() => {
    const loadAnoQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const { data, error } = await supabase
          .from('ano_questions')
          .select('question_text')
          .order('id', { ascending: true });

        if (error) throw error;
        setAnoQuestions(data.map(q => q.question_text));
      } catch (error) {
        console.error('Ошибка загрузки вопросов ANO:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadAnoQuestions();
  }, []);

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

  const getRandomAnoQuestions = (): string[] => {
    if (anoQuestions.length === 0) return [];
    const shuffled = [...anoQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatName.trim()) return alert('Введите название комнаты');
    if (!user) return alert('Требуется авторизация');

    setLoading(true);

    try {
      let finalQuestions: string[];
      
      if (mode === 'ano') {
        finalQuestions = getRandomAnoQuestions();
        if (finalQuestions.length === 0) {
          throw new Error('Не удалось загрузить вопросы ANO');
        }
      } else {
        finalQuestions = questions.filter(q => q.trim() !== '');
        if (finalQuestions.length === 0) {
          throw new Error('Добавьте хотя бы один вопрос');
        }
      }

      // Добавлено min_players со значением по умолчанию 2
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name: chatName.trim(),
          mode,
          password: hasPassword ? password : null,
          max_players: playerCount,
          min_players: 2, // Добавлено обязательное поле
          created_by: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (chatError) throw chatError;

      const questionsToInsert = finalQuestions.map((question, index) => ({
        chat_id: chat.id,
        question_text: question,
        order: index + 1,
        is_ano: mode === 'ano'
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      const { error: playerError } = await supabase
        .from('chat_players')
        .insert({
          chat_id: chat.id,
          user_id: user.id,
          is_owner: true
        });

      if (playerError) throw playerError;

      navigate(`/waiting-room/${chat.id}`);
    } catch (error: any) {
      console.error('Ошибка создания комнаты:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* Шапка */}
      <header className="w-full py-4 px-4 flex justify-between items-center bg-white z-20 shadow-sm sticky top-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-[#0092FF]/80 hover:text-[#0092FF] hover:bg-[#0092FF]/10 rounded-lg transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <h1 className="text-2xl font-bold text-[#0092FF]">Создать комнату</h1>
        <div className="w-10"></div>
      </header>

      {/* Основной контент с прокруткой */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Название комнаты */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название комнаты
              </label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-[#0092FF]/30 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-transparent transition-all"
                placeholder="Придумайте название"
                required
              />
            </div>

            {/* Количество игроков */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0092FF]" />
                Количество игроков
              </h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                  className="p-2 bg-[#0092FF]/10 text-[#0092FF]/80 hover:text-[#0092FF] rounded-lg transition-all"
                  disabled={playerCount <= 2}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-[#0092FF]">{playerCount}</span>
                  <span className="text-sm text-gray-500 ml-2">игроков</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                  className="p-2 bg-[#0092FF]/10 text-[#0092FF]/80 hover:text-[#0092FF] rounded-lg transition-all"
                  disabled={playerCount >= 20}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Пароль */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#0092FF]" />
                  Пароль
                </h3>
                <button
                  type="button"
                  onClick={() => setHasPassword(!hasPassword)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    hasPassword 
                      ? 'bg-[#0092FF]/20 text-[#0092FF]' 
                      : 'bg-[#0092FF]/10 text-[#0092FF]/60'
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
                  className="w-full px-4 py-3 bg-white border border-[#0092FF]/30 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-transparent transition-all"
                  placeholder="Придумайте пароль"
                />
              )}
            </div>

            {/* Режим игры */}
            <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Режим игры</h3>
              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'custom'
                      ? 'border-[#0092FF]/50 bg-[#0092FF]/10 text-[#0092FF]'
                      : 'border-[#0092FF]/20 bg-white text-gray-700 hover:border-[#0092FF]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Gamepad2 className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Свои вопросы</div>
                      <div className="text-sm text-gray-500">Создайте вопросы сами</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('ano')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    mode === 'ano'
                      ? 'border-[#0092FF]/50 bg-[#0092FF]/10 text-[#0092FF]'
                      : 'border-[#0092FF]/20 bg-white text-gray-700 hover:border-[#0092FF]/30'
                  }`}
                  disabled={isLoadingQuestions}
                >
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Вопросы от ANO</div>
                      <div className="text-sm text-gray-500">
                        {isLoadingQuestions 
                          ? 'Загрузка вопросов...' 
                          : `Доступно ${anoQuestions.length} вопросов`}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Пользовательские вопросы */}
            {mode === 'custom' && (
              <div className="bg-white rounded-xl shadow-sm border border-[#0092FF]/20 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Ваши вопросы</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="p-2 bg-[#0092FF]/10 text-[#0092FF] rounded-lg hover:bg-[#0092FF]/20 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 max-h-[160px] overflow-y-auto">
                  {questions.map((question, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border border-[#0092FF]/30 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-transparent transition-all"
                        placeholder={`Вопрос ${index + 1}`}
                      />
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(index)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка создания */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0092FF] text-white py-4 px-6 rounded-xl font-medium text-lg hover:bg-[#007acc] hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center mb-4"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Создание...
                </>
              ) : (
                'Создать комнату'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateChat;