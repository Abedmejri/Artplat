// src/components/ChatWindow.tsx

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { motion } from 'framer-motion';

interface ChatWindowProps {
  conversationId: number;
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const ChatWindow = ({ conversationId }: ChatWindowProps) => {
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

  useEffect(() => {
    if (!conversationId) return;

    // --- 1. FETCH INITIAL MESSAGES ---
    const fetchMessages = async () => {
     const { data, error: _error } = await supabase
        .from('messages')
        .select('*, profiles(username, avatar_url)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
        
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    // --- 2. SET UP REAL-TIME SUBSCRIPTION (Corrected Version) ---
    const channel = supabase
      .channel('public:messages') // Must subscribe to the table's channel
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          // Filter to only get messages for THIS conversation
          filter: `conversation_id=eq.${conversationId}` 
        }, 
        async (payload) => {
          // The new message from the payload
          const newMsg = payload.new;

          // We need to fetch the sender's profile data to display it
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', newMsg.sender_id)
            .single();

          // Combine the message with the profile data
          const formattedNewMessage = { ...newMsg, profiles: profileData } as Message;
          
          // Add the new message to our state, which triggers a re-render
          setMessages(currentMessages => [...currentMessages, formattedNewMessage]);
        }
      )
      .subscribe();

    // --- 3. CLEANUP FUNCTION ---
    // This is crucial to prevent memory leaks when the user navigates away
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]); // Re-run this ENTIRE effect if the conversationId changes

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;
    
    await supabase.from('messages').insert({
      content: newMessage,
      sender_id: session.user.id,
      conversation_id: conversationId,
    });
    setNewMessage('');
  };

  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-l-sm border-y border-l border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "py-3 px-5 bg-spell-glow-teal text-ink-black font-body font-bold rounded-r-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50";

  return (
    <div className="flex flex-col h-full">
      {/* Message Display Area */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map(msg => {
          const isMe = msg.sender_id === session?.user?.id;
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && <img src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${msg.sender_id}`} alt="" className="w-10 h-10 rounded-full" />}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-md p-3 rounded-lg ${isMe ? 'bg-spell-glow-teal text-ink-black' : 'bg-stone-dark/50 text-parchment'}`}
              >
                <p className="text-lg break-words">{msg.content}</p>
              </motion.div>
              {isMe && <img src={session.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${session.user.id}`} alt="" className="w-10 h-10 rounded-full" />}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input Area */}
      <form onSubmit={handleSendMessage} className="flex p-4 border-t border-parchment/10">
        <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Inscribe a message..." className={inputStyles} />
        <button type="submit" disabled={!newMessage.trim()} className={buttonStyles}>Send</button>
      </form>
    </div>
  );
};

export default ChatWindow;