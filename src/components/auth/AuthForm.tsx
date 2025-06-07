
import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuthFormProps {
  onSuccess: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
            }
          }
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden bg-blue-600">
      <div className="glass-card rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ANO</h1>
          <p className="text-white/80 text-lg">Анонимные чаты</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                placeholder="Имя пользователя"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Email"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              placeholder="Пароль"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="text-red-300 text-sm text-center bg-red-500/20 p-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button text-white py-3 px-6 rounded-2xl font-medium text-lg hover:shadow-lg transition-all disabled:opacity-50"
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
            className="w-full text-white/80 text-sm hover:text-white transition-all"
          >
            {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-white/20 rounded-full mb-4">
            <span className="text-white text-sm">i</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            В этой игре вы сможете узнать что думают о вас ваши друзья, и анонимно высказать мнение о других
          </p>
        </div>
      </div>
    </div>
  );
};
