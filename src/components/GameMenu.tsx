import React, { useState, useEffect } from 'react';
import { Plus, Users, LogOut, User as UserIcon, ChevronDown, ChevronUp, Settings, History, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type FloatingMessage = {
  id: number;
  text: string;
  top: string;
  color: string;
  duration: number;
  delay: number;
  direction: 'left' | 'right';
};

export const GameMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [messages] = useState<FloatingMessage[]>([
    { id: 1, text: "Привет!", top: "15%", color: "#0092FF", duration: 25, delay: 0, direction: 'right' },
    { id: 2, text: "Как дела?", top: "25%", color: "#FF6B00", duration: 30, delay: 0, direction: 'left' },
    { id: 3, text: "Давай играть!", top: "70%", color: "#00C896", duration: 35, delay: 0, direction: 'right' },
    { id: 4, text: "Анонимно", top: "80%", color: "#9C51B6", duration: 20, delay: 0, direction: 'left' },
  ]);

  // Анимация для плавающих сообщений и пульсара
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      @keyframes floatRight {
        0% { transform: translateX(-100%) rotate(-5deg); }
        100% { transform: translateX(100vw) rotate(5deg); }
      }
      @keyframes floatLeft {
        0% { transform: translateX(100vw) rotate(5deg); }
        100% { transform: translateX(-100%) rotate(-5deg); }
      }
      @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 0.9; }
        100% { transform: scale(0.8); opacity: 0.7; }
      }
      .floating-message {
        position: absolute;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 16px;
        padding: 8px 12px;
        font-size: 14px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 6px;
        z-index: 1;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(0, 0, 0, 0.05);
        white-space: nowrap;
      }
      .pulsar {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,146,255,0.2) 0%, rgba(0,146,255,0) 70%);
        animation: pulse 3s ease-in-out infinite;
        z-index: 0;
      }
      .action-button {
        transition: all 0.3s ease;
        background: white;
        border: 2px solid rgba(0, 146, 255, 0.3);
      }
      .action-button:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 20px rgba(0, 146, 255, 0.2);
      }
      .action-icon-container {
        transition: all 0.3s ease;
        background-color: rgba(0, 146, 255, 0.1);
      }
      .create-button:hover .action-icon-container {
        transform: rotate(90deg);
        background-color: rgba(0, 146, 255, 0.2);
      }
      .join-button:hover .action-icon-container {
        transform: scale(1.1);
        background-color: rgba(0, 146, 255, 0.2);
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => document.head.removeChild(styleElement);
  }, []);

  const getMessageStyle = (msg: FloatingMessage): React.CSSProperties => ({
    top: msg.top,
    color: msg.color,
    animation: `${msg.direction === 'right' ? 'floatRight' : 'floatLeft'} ${msg.duration}s linear infinite`,
    animationDelay: `${msg.delay}s`,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      window.location.reload(); // Добавьте принудительную перезагрузку
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };



  const handleCreateChat = () => {
    navigate('/create-chat');
  };

  const handleJoinChat = () => {
    navigate('/join-chat');
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      {/* Пульсирующий круг в центре */}
      <div className="pulsar"></div>

      {/* Плавающие сообщения */}
      {messages.map((msg) => (
        <div key={msg.id} className="floating-message" style={getMessageStyle(msg)}>
          <MessageSquare className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      ))}

      {/* Навигационная панель */}
      <header className="w-full py-4 px-4 flex justify-between items-center bg-white z-20 shadow-sm relative">
        <button 
          onClick={toggleProfile}
          className="flex items-center gap-2 text-[#0092FF] hover:text-[#0092FF]/80 transition-all duration-300 z-10"
        >
          <div className="w-10 h-10 rounded-full bg-[#0092FF]/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-[#0092FF]" />
          </div>
          <span className="font-medium">{user?.username}</span>
          {showProfile ? (
            <ChevronUp className="w-4 h-4 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform" />
          )}
        </button>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <img 
            src="/img/logo.png" 
            alt="ANO Logo" 
            className="h-10 object-contain transition-all duration-300 hover:scale-105"
          />
        </div>

        <button
          onClick={handleSignOut}
          className="p-2 text-[#0092FF]/80 hover:text-[#0092FF] hover:bg-[#0092FF]/10 rounded-lg transition-all duration-300 group z-10"
          title="Выйти"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </header>

      {showProfile && (
        <div className="absolute top-20 left-4 z-30 w-64 bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0092FF]/10 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-[#0092FF]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{user?.username}</h3>
                <div className="flex items-center mt-1">
                  <span className="text-[#0092FF] font-bold">{user?.n_coin || 50}</span>
                  <span className="text-xs text-gray-500 ml-1">N-Coin</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-2">
            <button className="w-full px-4 py-2 flex items-center gap-2 text-left text-gray-700 hover:text-[#0092FF] hover:bg-[#0092FF]/5 rounded-lg transition-colors duration-300">
              <Settings className="w-4 h-4" />
              Настройки профиля
            </button>
            <button className="w-full px-4 py-2 flex items-center gap-2 text-left text-gray-700 hover:text-[#0092FF] hover:bg-[#0092FF]/5 rounded-lg transition-colors duration-300">
              <History className="w-4 h-4" />
              История игр
            </button>
          </div>
        </div>
      )}

      {/* Основное содержимое */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        {/* Кнопки */}
        <div className="w-full max-w-md space-y-6 mb-8">
          <button
            onClick={handleCreateChat}
            className="w-full group relative overflow-hidden action-button create-button p-6 rounded-xl"
          >
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center action-icon-container">
                <Plus className="w-6 h-6 text-[#0092FF]" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Создать комнату</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Новая анонимная комната
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={handleJoinChat}
            className="w-full group relative overflow-hidden action-button join-button p-6 rounded-xl"
          >
            <div className="relative flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center action-icon-container">
                <Users className="w-6 h-6 text-[#0092FF]" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">Присоединиться</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Найти комнату
                </p>
              </div>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default GameMenu;