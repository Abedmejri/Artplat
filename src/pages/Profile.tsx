// src/pages/Profile.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import ArtworkCard, { Artwork } from '../components/ArtworkCard';
import { motion } from 'framer-motion';

// Define the shape of the profile data we expect to fetch
interface ProfileData {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  website: string | null;
  donation_url: string | null;
}

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const session = useSession();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!username) { setError('No artist specified.'); setLoading(false); return; }
      setLoading(true); setError(null);

      // 1. Fetch the profile by username
      const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('username', username).single();
      if (profileError || !profileData) { setError(`Could not find artist: "${username}".`); setLoading(false); return; }
      setProfile(profileData as ProfileData);

      // 2. Fetch the artworks for that profile's ID
      const { data: artworksData, error: artworksError } = await supabase.from('artworks').select(`id, title, media_url, profiles(username)`).eq('user_id', profileData.id).order('created_at', { ascending: false });
      if (artworksError) { setError('Could not load artworks for this artist.'); } 
      else { setArtworks(artworksData as Artwork[]); }
      setLoading(false);
    };
    fetchProfileData();
  }, [username]);
  
  const handleStartConversation = async () => {
    if (!session?.user || !profile) return;
    
    // Call our database function to get or create a private conversation
    const { data: conversationId, error } = await supabase.rpc('get_or_create_conversation', {
      user1_id: session.user.id,
      user2_id: profile.id
    });

    if (error) {
      console.error("Error starting conversation:", error);
      alert("Could not start conversation.");
    } else {
      // Navigate to the new messages page with the unique conversation ID
      navigate(`/messages/${conversationId}`);
    }
  };

  if (loading) return <p className="text-center text-parchment p-10">Searching the archives for this artist...</p>;
  if (error) return <p className="text-center text-gryffindor-red p-10 bg-gryffindor-red/20 rounded-lg">{error}</p>;
  if (!profile) return <p className="text-center text-parchment p-10">This artist is not in our records.</p>;
  
  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <main>
      {/* Profile Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 p-8 bg-stone-dark/50 border border-parchment/10 rounded-lg shadow-2xl mb-12"
      >
        <img 
          src={profile.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.username}`} 
          alt={profile.username || 'Artist'}
          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-parchment/20 shadow-lg"
        />
        <div className="text-center sm:text-left">
          <h1 className="font-heading text-5xl text-white">{profile.username}</h1>
          <p className="mt-2 text-parchment/80 text-lg max-w-xl">{profile.bio || "An artist of great talent and mystery."}</p>
          
          <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="font-body text-spell-glow-teal hover:underline">
                Visit Personal Archives &rarr;
              </a>
            )}
            
            {profile.donation_url && (
              <a href={profile.donation_url} target="_blank" rel="noopener noreferrer" className="inline-block py-2 px-6 bg-spell-glow-teal text-ink-black font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all">
                Support the Artist
              </a>
            )}
            
            {!isOwnProfile && session && (
              <button 
                onClick={handleStartConversation}
                className="inline-block py-2 px-6 bg-stone-dark/50 border border-parchment/10 text-parchment font-bold rounded-sm hover:border-spell-glow-teal hover:text-white transition-all"
              >
                Message Artist
              </button>
            )}
          </div>
        </div>
      </motion.header>

      {/* Artworks Gallery */}
      <h2 className="font-heading text-4xl text-white mb-8 text-shadow-glow">Collection of Works</h2>
      {artworks.length === 0 ? (
          <div className="text-center text-parchment/70 p-10 bg-stone-dark/50 rounded-lg border border-parchment/10">
              This artist has not yet exhibited any public works.
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {artworks.map((art) => (
                <ArtworkCard key={art.id} artwork={art} />
              ))}
          </div>
      )}
    </main>
  );
};

export default Profile;