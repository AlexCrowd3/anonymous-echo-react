
import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AuthFormProps {
  onLogin: (username: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 overflow-hidden">
      <div className="gradient-card rounded-3xl p-8 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">ANO</h1>
          <p className="text-white/80 text-lg">Анонимные чаты</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all text-lg"
              placeholder="Введите ваше имя"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full gradient-button text-white py-4 px-6 rounded-2xl font-medium text-lg hover:shadow-lg transition-all"
          >
            Играть
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
