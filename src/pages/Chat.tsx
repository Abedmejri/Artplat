// src/pages/Chat.tsx

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the shape of our message data
interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const Chat = () => {
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Helper function to auto-scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Effect to fetch initial messages and subscribe to new ones
  useEffect(() => {
    // Fetch initial chat history
    const fetchMessages = async () => {
     const { data, error: _error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: true });
        
      if (data) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();

    // Set up the real-time subscription
    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, 
        async (payload) => {
          // The payload only has the new row data, but not the user's profile.
          // We need to fetch the profile details separately.
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          
          const formattedNewMessage = { ...payload.new, profiles: profileData } as Message;
          
          setMessages(currentMessages => [...currentMessages, formattedNewMessage]);
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Effect to scroll down whenever the messages array changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;
    
    await supabase.from('messages').insert({
      content: newMessage,
      user_id: session.user.id
    });
    setNewMessage('');
  };

  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-l-sm border-y border-l border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "py-3 px-5 bg-spell-glow-teal text-ink-black font-body font-bold rounded-r-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50";

  return (
    <main className="container mx-auto p-4 md:p-8">
      <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="font-heading text-5xl text-white text-shadow-glow">The Great Hall Chat</h1>
        <p className="font-body text-parchment/70 mt-2">Speak with fellow witches and wizards in real-time.</p>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-ink-black/80 border border-parchment/10 rounded-lg shadow-2xl flex flex-col h-[70vh]"
      >
        {/* Message Display Area */}
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map(msg => (
            <div key={msg.id} className="flex items-start space-x-3 max-w-xl">
              <img src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${msg.user_id}`} alt={msg.profiles?.username || ''} className="w-10 h-10 rounded-full border-2 border-parchment/20" />
              <div>
                <Link to={`/profile/${msg.profiles?.username}`} className="font-heading text-spell-glow-teal hover:underline">{msg.profiles?.username || 'An unknown whisper'}</Link>
                <p className="text-parchment text-lg break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Message Input Area */}
        {session ? (
          <form onSubmit={handleSendMessage} className="flex p-4 border-t border-parchment/10">
            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Inscribe a message..." className={inputStyles} />
            <button type="submit" disabled={!newMessage.trim()} className={buttonStyles}>Send</button>
          </form>
        ) : (
          <div className="p-4 text-center text-parchment/70 border-t border-parchment/10">
            You must be <Link to="/login" className="font-bold text-spell-glow-teal hover:underline">logged in</Link> to join the conversation.
          </div>
        )}
      </motion.div>
    </main>
  );
};

export default Chat;