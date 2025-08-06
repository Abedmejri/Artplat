// src/pages/MessagesPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { motion } from 'framer-motion';
import ChatWindow from '../components/ChatWindow';

// Define shapes for our data
interface Conversation {
  id: number;
  other_participant: { id: string; username: string | null; avatar_url: string | null; } | null;
}
interface SuggestedArtist {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

const MessagesPage = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [suggestedArtists, setSuggestedArtists] = useState<SuggestedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  // This function is reusable for starting a chat from a suggestion
  const handleStartConversation = async (otherUserId: string) => {
    if (!session?.user) return;
    const { data, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: session.user.id,
      user2_id: otherUserId
    });
    if (error) { alert("Could not start conversation."); } 
    else { navigate(`/messages/${data}`); }
  };

  useEffect(() => {
    if (!session?.user) return;

    const fetchConversationsAndSuggestions = async () => {
      setLoading(true);
      const { data: participationData } = await supabase.from('participants').select('conversation_id').eq('user_id', session.user.id);

      let fetchedConversations: Conversation[] = [];

      if (participationData && participationData.length > 0) {
        setSuggestedArtists([]); // Clear suggestions
        const convIds = participationData.map(p => p.conversation_id);
        const { data: participantsData } = await supabase.from('participants').select('conversation_id, user_id').in('conversation_id', convIds).neq('user_id', session.user.id);
        const otherUserIds = participantsData?.map(p => p.user_id) || [];
        const { data: profilesData } = await supabase.from('profiles').select('id, username, avatar_url').in('id', otherUserIds);
        
        fetchedConversations = participantsData?.map(p => ({
            id: p.conversation_id,
            other_participant: profilesData?.find(profile => profile.id === p.user_id) || null
        })) || [];
      } else {
        // If there are no conversations, fetch suggested artists.
        const { data: suggestedData } = await supabase.rpc('get_random_profiles', { limit_count: 5 });
        if (suggestedData) setSuggestedArtists(suggestedData);
      }

      // --- THIS IS THE NEW "SELF-HEALING" LOGIC ---
      // If a conversationId is in the URL but not in our fetched list (due to replication delay),
      // we manually fetch and add it to ensure the UI is correct.
      const currentConvId = conversationId ? Number(conversationId) : null;
      if (currentConvId && !fetchedConversations.some(c => c.id === currentConvId)) {
        const { data: otherParticipantData } = await supabase.from('participants').select('user_id').eq('conversation_id', currentConvId).neq('user_id', session.user.id).single();
        if (otherParticipantData) {
          const { data: profileData } = await supabase.from('profiles').select('id, username, avatar_url').eq('id', otherParticipantData.user_id).single();
          const missingConversation: Conversation = {
            id: currentConvId,
            other_participant: profileData
          };
          fetchedConversations = [missingConversation, ...fetchedConversations];
        }
      }
      // --- END SELF-HEALING LOGIC ---

      setConversations(fetchedConversations);
      setLoading(false);
    };

    fetchConversationsAndSuggestions();
  }, [session, location.pathname]); // Added conversationId to dependency array

  return (
    <main className="container mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-[calc(100vh-8rem)] bg-ink-black/80 border border-parchment/10 rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Left Column: Conversation List / Suggestions */}
        <div className={`w-full md:w-1/3 border-r border-parchment/10 flex-col ${conversationId && 'hidden md:flex'}`}>
          <div className="p-4 border-b border-parchment/10">
            <h1 className="font-heading text-2xl text-white">Your Owl Post</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && <p className="p-4 text-parchment/70">Loading scrolls...</p>}
            
            {/* Show existing conversations if they exist */}
            {!loading && conversations.length > 0 && conversations.map(conv => (
              <Link 
                key={conv.id} 
                to={`/messages/${conv.id}`}
                className={`flex items-center space-x-3 p-4 border-b border-parchment/10 transition-colors hover:bg-stone-dark/50 ${Number(conversationId) === conv.id ? 'bg-stone-dark' : ''}`}
              >
                <img src={conv.other_participant?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${conv.other_participant?.id}`} alt={conv.other_participant?.username || ''} className="w-12 h-12 rounded-full border-2 border-parchment/20" />
                <div>
                  <p className="font-heading text-lg text-white">{conv.other_participant?.username}</p>
                  <p className="text-sm text-parchment/60 italic">Click to view conversation...</p>
                </div>
              </Link>
            ))}

            {/* Show suggestions ONLY if there are no conversations */}
            {!loading && conversations.length === 0 && (
              <div className="p-4">
                <p className="text-parchment/70 italic mb-4">No messages yet. Why not start a conversation?</p>
                <div className="space-y-3">
                  {suggestedArtists.map(artist => (
                    <div key={artist.id} className="flex items-center justify-between p-2 rounded-md hover:bg-stone-dark/50">
                      <div className="flex items-center space-x-3">
                        <img src={artist.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${artist.id}`} alt={artist.username || ''} className="w-10 h-10 rounded-full" />
                        <p className="font-heading text-md text-white">{artist.username}</p>
                      </div>
                      <button 
                        onClick={() => handleStartConversation(artist.id)}
                        className="text-sm font-bold py-1 px-3 rounded-sm bg-spell-glow-teal text-ink-black hover:bg-white transition-colors"
                      >
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Chat Window */}
        <div className={`w-full md:w-2/3 flex-col ${!conversationId && 'hidden md:flex'}`}>
          {conversationId ? (
            <ChatWindow conversationId={Number(conversationId)} />
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 text-parchment/70">
              <div>
                <h2 className="font-heading text-3xl">Select a conversation</h2>
                <p>Choose a scroll from the left to read your messages.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
};

export default MessagesPage;