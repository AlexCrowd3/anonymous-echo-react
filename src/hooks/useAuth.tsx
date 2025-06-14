import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('supabase.auth.user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signIn = (userData: any) => {
    setUser(userData);
    // Сохраняем пользователя в localStorage
    localStorage.setItem('supabase.auth.user', JSON.stringify(userData));
  };

  const signOut = () => {
    localStorage.removeItem('supabase.auth.user');
    setUser(null);
    setLoading(false);
  };

  return { user, loading, signIn, signOut };
};