import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Логин
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (profileError) throw new Error('Ошибка проверки пользователя');
        if (!profile) throw new Error('Пользователь не найден');
        if (profile.password !== password) throw new Error('Неверный пароль');

        await signIn(profile);
        onSuccess();
      } else {
        // Регистрация
        if (password.length < 6) throw new Error('Пароль должен быть не менее 6 символов');
        
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (existingProfile) throw new Error('Пользователь с таким именем уже существует');

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            username: username,
            password: password,
            n_coin: 50  // Начальный баланс
          })
          .select()
          .single();

        if (createError) throw new Error('Ошибка регистрации: ' + createError.message);

        signIn(newProfile);
        onSuccess();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden bg-white">
      <div className="bg-white border-2 border-[#0092FF]/20 rounded-3xl p-8 w-full max-w-sm shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#0092FF]/10 rounded-full mb-6">
            <User className="w-10 h-10 text-[#0092FF]" />
          </div>
          <h1 className="text-4xl font-bold text-[#0092FF] mb-2">ANO</h1>
          <p className="text-gray-600 text-lg">Анонимные чаты</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0092FF]/80" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-[#0092FF]/30 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-transparent transition-all"
              placeholder="Имя пользователя"
              required
              minLength={3}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0092FF]/80" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white border-2 border-[#0092FF]/30 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0092FF]/50 focus:border-transparent transition-all"
              placeholder="Пароль"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#0092FF]/80 hover:text-[#0092FF]"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0092FF] text-white py-3 px-6 rounded-2xl font-medium text-lg hover:bg-[#007acc] hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Загрузка...
              </div>
            ) : (
              isLogin ? 'Войти' : 'Регистрация'
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-[#0092FF]/80 text-sm hover:text-[#0092FF] transition-all"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-[#0092FF]/10 rounded-full mb-4">
            <span className="text-[#0092FF] text-sm">i</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            В этой игре вы сможете узнать что думают о вас ваши друзья, и анонимно высказать мнение о других
          </p>
        </div>
      </div>
    </div>
  );
};