import { useState, useEffect } from 'react';
import { UserList } from './UserList';
import { ChatWindow } from './ChatWindow';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

export function Chat() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      loadSelectedUser(selectedUserId);
    }
  }, [selectedUserId]);

  const loadSelectedUser = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading user:', error);
      return;
    }

    setSelectedUser(data);
  };

  return (
    <div className="h-screen flex">
      <div className="w-full md:w-96 flex-shrink-0">
        <UserList selectedUserId={selectedUserId} onSelectUser={setSelectedUserId} />
      </div>

      <div className="flex-1 hidden md:flex">
        {selectedUser ? (
          <ChatWindow selectedUser={selectedUser} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-xl font-semibold mb-2">Select a conversation</p>
              <p className="text-sm">Choose a user from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 md:hidden bg-white z-50">
          <button
            onClick={() => setSelectedUserId(null)}
            className="absolute top-4 left-4 text-blue-600 font-medium"
          >
            ← Back
          </button>
          <ChatWindow selectedUser={selectedUser} />
        </div>
      )}
    </div>
  );
}
