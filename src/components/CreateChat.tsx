import React, { useState } from 'react';
import { ArrowLeft, Lock, Gamepad2, Database, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const CreateChat: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatName, setChatName] = useState('');
  const [mode, setMode] = useState<'custom' | 'database'>('custom');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [minPlayers, setMinPlayers] = useState(2);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    navigate(-1);
  };

  const handleCreate = async () => {
    if (!chatName.trim()) {
      setError('Введите название комнаты');
      return;
    }

    if (minPlayers > maxPlayers) {
      setError('Минимальное количество игроков не может быть больше максимального');
      return;
    }

    setCreating(true);
    setError('');

    try {
      if (!user) throw new Error('Пользователь не авторизован');

      // Создаем комнату через RPC функцию для безопасности
      const { data: chat, error: createError } = await supabase.rpc('create_chat_with_owner', {
        p_name: chatName,
        p_mode: mode,
        p_max_players: maxPlayers,
        p_min_players: minPlayers,
        p_password: hasPassword ? password : null,
        p_created_by: user.id
      });

      if (createError) throw createError;

      // Перенаправляем в комнату ожидания
      navigate(`/waiting-room/${chat.id}`);

    } catch (err: any) {
      console.error('Create chat error:', err);
      setError(err.message || 'Ошибка при создании комнаты');
    } finally {
      setCreating(false);
    }
  };

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
          <h1 className="text-xl font-bold text-[#0092FF]">Создать комнату</h1>
        </div>

        <div className="w-10 h-10 rounded-full bg-[#0092FF]/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-[#0092FF]" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24 z-10">
        <div className="bg-white/90 rounded-xl p-5 border border-[#0092FF]/20 shadow-sm mt-4">
          {error && (
            <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название комнаты
              </label>
              <input
                type="text"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all"
                placeholder="Придумайте название"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Режим игры
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-all ${
                    mode === 'custom'
                      ? 'bg-[#0092FF]/20 text-[#0092FF] border-[#0092FF]/50'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  Свои вопросы
                </button>
                <button
                  type="button"
                  onClick={() => setMode('database')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border transition-all ${
                    mode === 'database'
                      ? 'bg-[#0092FF]/20 text-[#0092FF] border-[#0092FF]/50'
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Из базы
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Минимально игроков
                </label>
                <select
                  value={minPlayers}
                  onChange={(e) => setMinPlayers(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all"
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                    <option key={`min-${num}`} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Максимально игроков
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all"
                >
                  {[4, 5, 6, 8, 10].map((num) => (
                    <option key={`max-${num}`} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <input
                  type="checkbox"
                  checked={hasPassword}
                  onChange={() => setHasPassword(!hasPassword)}
                  className="rounded text-[#0092FF] focus:ring-[#0092FF]"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  Защитить паролем
                </span>
              </label>
              {hasPassword && (
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-[#0092FF]/30 transition-all"
                  placeholder="Введите пароль"
                  minLength={4}
                  maxLength={20}
                />
              )}
            </div>

            <button
              onClick={handleCreate}
              disabled={creating || (hasPassword && password.length < 4)}
              className="w-full bg-[#0092FF] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#007acc] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {creating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
              ) : (
                'Создать комнату'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChat;