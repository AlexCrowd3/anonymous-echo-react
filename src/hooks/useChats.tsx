
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Chat {
  id: string;
  name: string;
  mode: 'custom' | 'database';
  questions: string[];
  password?: string;
  max_players: number;
  min_players: number;
  is_started: boolean;
  created_by: string;
  created_at: string;
  player_count: number;
  players: string[];
}

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = async () => {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          *,
          chat_players (
            user_id,
            profiles (username)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const chatsWithPlayerInfo = data?.map(chat => ({
        ...chat,
        player_count: chat.chat_players?.length || 0,
        players: chat.chat_players?.map((cp: any) => cp.profiles?.username || 'User') || []
      })) || [];

      setChats(chatsWithPlayerInfo);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('chats-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chats'
      }, () => {
        fetchChats();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_players'
      }, () => {
        fetchChats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { chats, loading, refetch: fetchChats };
};
