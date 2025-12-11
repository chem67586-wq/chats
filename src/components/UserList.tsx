import { useEffect, useState } from 'react';
import { LogOut, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ChatUser, Profile } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface UserListProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

export function UserList({ selectedUserId, onSelectUser }: UserListProps) {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();

    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const loadUsers = async () => {
    if (!profile?.id) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', profile.id)
      .order('last_seen', { ascending: false });

    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    const usersWithMessages = await Promise.all(
      data.map(async (user) => {
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
          .order('created_at', { ascending: false })
          .limit(1);

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id)
          .eq('receiver_id', profile.id)
          .eq('read', false);

        return {
          ...user,
          lastMessage: messages?.[0],
          unreadCount: count || 0,
        };
      })
    );

    setUsers(usersWithMessages);
  };

  const filteredUsers = users.filter((user) =>
    user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <p className="text-sm text-gray-500">{profile?.display_name}</p>
          </div>
          <button
            onClick={signOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'No users found' : 'No other users yet'}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => onSelectUser(user.id)}
              className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                selectedUserId === user.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user.display_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-800 truncate">
                    {user.display_name || user.email}
                  </h3>
                  {user.unreadCount! > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] text-center">
                      {user.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {user.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
