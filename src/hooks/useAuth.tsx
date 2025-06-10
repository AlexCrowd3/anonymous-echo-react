
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  password: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем localStorage на наличие сохраненного пользователя
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const signIn = (profile: Profile) => {
    setUser(profile);
    localStorage.setItem('currentUser', JSON.stringify(profile));
  };

  return { user, loading, signOut, signIn };
};
