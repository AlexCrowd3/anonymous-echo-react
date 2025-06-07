
import React from 'react';
import { Users, Clock } from 'lucide-react';

interface WaitingAnimationProps {
  currentPlayers: number;
  minPlayers: number;
  maxPlayers: number;
}

export const WaitingAnimation: React.FC<WaitingAnimationProps> = ({
  currentPlayers,
  minPlayers,
  maxPlayers
}) => {
  const playersNeeded = minPlayers - currentPlayers;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-white/20 rounded-full animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Clock className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>
      
      <div className="text-center">
        <p className="text-white font-medium mb-2">Ожидание игроков</p>
        <div className="flex items-center justify-center gap-2 text-white/80">
          <Users className="w-4 h-4" />
          <span>{currentPlayers}/{maxPlayers}</span>
        </div>
        <p className="text-white/60 text-sm mt-1">
          Нужно еще {playersNeeded} {playersNeeded === 1 ? 'игрок' : 'игроков'}
        </p>
      </div>

      {/* Animated dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
        <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
      </div>
    </div>
  );
};
