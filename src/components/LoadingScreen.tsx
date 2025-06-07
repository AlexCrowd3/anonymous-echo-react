
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 bg-blue-600">
      <div className="glass-card rounded-3xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
          <MessageCircle className="w-10 h-10 text-white animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">ANO</h1>
        <p className="text-white/80 text-lg mb-6">Анонимные чаты</p>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
        
        <p className="text-white/60 text-sm mt-4">Загрузка...</p>
      </div>
    </div>
  );
};
