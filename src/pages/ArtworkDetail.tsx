// src/pages/ArtworkDetail.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import SubmitToChallengeModal from '../components/SubmitToChallengeModal';
import LikeButton from '../components/LikeButton';
import CommentsSection from '../components/CommentsSection';
import { motion, AnimatePresence } from 'framer-motion';

// Interfaces for data shapes
interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  donation_url: string | null; // The donation link field
}

interface ArtworkWithProfile {
  id: number;
  title: string;
  description: string | null;
  media_url: string;
  created_at: string;
  user_id: string;
  profiles: Profile | null;
}

const ArtworkDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [artwork, setArtwork] = useState<ArtworkWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const session = useSession();

  useEffect(() => {
    const fetchArtwork = async () => {
        if (!id) { setError('No artwork ID provided.'); setLoading(false); return; }
        setLoading(true); setError(null);
        
        // Fetch artwork and all necessary profile data, including the donation_url
        const { data, error } = await supabase
          .from('artworks')
          .select(`*, profiles (id, username, avatar_url, bio, donation_url)`)
          .eq('id', id)
          .single();
          
        if (error) { 
          setError('Could not retrieve this masterpiece from the archives.'); 
          console.error(error); 
        } else { 
          setArtwork(data as ArtworkWithProfile); 
        }
        setLoading(false);
    };
    fetchArtwork();
  }, [id]);

  if (loading) return <p className="text-center text-parchment p-10">Unveiling the artifact...</p>;
  if (error || !artwork) return <p className="text-center text-gryffindor-red p-10 bg-gryffindor-red/20 rounded-lg">{error || 'This artifact could not be found.'}</p>;

  const artist = artwork.profiles;
  const isOwner = session?.user?.id === artwork?.user_id;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto font-body"
    >
      {/* Main content grid: Image on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Left Column: The Artifact Image */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="bg-ink-black p-4 rounded-lg border border-parchment/10 shadow-2xl">
            <img 
              src={artwork.media_url} 
              alt={artwork.title} 
              className="w-full h-auto rounded-md" 
            />
          </div>
        </motion.div>

        {/* Right Column: Artifact Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-stone-dark/50 p-6 rounded-lg border border-parchment/10"
          >
            <h1 className="font-heading text-5xl text-white text-shadow-glow mb-3">{artwork.title}</h1>
            <p className="text-parchment/70 leading-relaxed text-lg">{artwork.description || "No ancient texts or notes accompany this artifact."}</p>
          </motion.div>

          {/* Artist Info - The Ancient Crafter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-stone-dark/50 p-6 rounded-lg border border-parchment/10"
          >
            <div className="flex justify-between items-start">
              <h3 className="font-heading text-2xl text-parchment mb-4">Crafted By</h3>
              
              {/* The new Donation Button */}
              {artist?.donation_url && (
                <a 
                  href={artist.donation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Support the Artist"
                  className="flex items-center space-x-2 bg-spell-glow-teal/80 text-ink-black font-bold py-1 px-3 rounded-sm text-sm shadow-md shadow-spell-glow-teal/10 hover:bg-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM4.125 4.125a2 2 0 100 4 2 2 0 000-4zM15.875 4.125a2 2 0 100 4 2 2 0 000-4zM4.125 10a2 2 0 100 4 2 2 0 000-4zM10 10a2 2 0 100 4 2 2 0 000-4zM15.875 10a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <span>Donate</span>
                </a>
              )}
            </div>

            <Link to={`/profile/${artist?.username}`} className="flex items-center space-x-4 group mt-2">
              <img 
                src={artist?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${artist?.username}`} 
                alt={artist?.username || ''} 
                className="w-16 h-16 rounded-full border-2 border-parchment/20 group-hover:border-spell-glow-teal transition-colors" 
              />
              <div>
                <p className="font-heading text-xl text-white group-hover:text-spell-glow-teal transition-colors">{artist?.username || 'Mysterious Crafter'}</p>
                <p className="text-sm text-parchment/60 italic line-clamp-2">{artist?.bio || "Their story is yet to be told."}</p>
              </div>
            </Link>
          </motion.div>
          
          {/* Interaction Buttons - Casting Charms */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <LikeButton artworkId={artwork.id} />
            <button onClick={() => setShowComments(true)} className="w-full py-3 px-4 bg-stone-dark/50 border border-parchment/10 text-parchment font-bold rounded-sm hover:border-spell-glow-teal hover:text-white transition-all">
              View Inscriptions
            </button>
          </motion.div>

          {isOwner && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <button onClick={() => setShowSubmitModal(true)} className="w-full py-3 px-4 bg-spell-glow-teal/80 text-ink-black font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all">
                Submit to Duel
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Slide-out Comments Panel - The Scriptorium */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-ink-black border-l border-parchment/10 shadow-2xl z-50 p-8 overflow-y-auto"
          >
            <button onClick={() => setShowComments(false)} className="absolute top-6 right-6 text-parchment hover:text-white text-4xl">&times;</button>
            <CommentsSection artworkId={artwork.id} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {showSubmitModal && <SubmitToChallengeModal artworkId={artwork.id} onClose={() => setShowSubmitModal(false)} />}
    </motion.div>
  );
};

export default ArtworkDetail;