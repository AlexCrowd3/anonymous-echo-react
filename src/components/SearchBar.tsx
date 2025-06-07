
import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = "Поиск комнат..." 
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
        placeholder={placeholder}
      />
    </div>
  );
};
