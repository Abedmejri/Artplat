// src/pages/Explore.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type Artwork } from '../components/ArtworkCard';

const Explore = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('artworks')
        .select(`id, title, media_url, profiles(username)`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching artworks:', error);
      } else {
        setArtworks(data as unknown as Artwork[]);
      }
      setLoading(false);
    };
    fetchArtworks();
  }, []);

  if (loading) return <p className="text-center text-parchment p-10">Summoning the artworks...</p>;

  return (
    <main>
      <motion.header 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center my-12"
      >
        <h1 className="font-heading text-6xl text-white tracking-wider text-shadow-glow">The Great Hall</h1>
        <p className="font-body text-parchment/70 mt-4 text-lg max-w-2xl mx-auto">Welcome, witches and wizards. Behold the enchanted portraits gathered from across the wizarding world. Each holds a story.</p>
      </motion.header>
      
      {artworks.length === 0 ? (
        <div className="text-center text-ink-black p-10 bg-parchment/80 rounded-md">
            The hall is currently empty. Be the first to hang your portrait!
        </div>
      ) : (
        <div className="max-w-5xl mx-auto columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {artworks.map((art, index) => (
            <motion.div
              key={art.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="break-inside-avoid" // Prevents items from breaking across columns
            >
              <Link to={`/artwork/${art.id}`} className="block group relative overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={art.media_url} 
                  alt={art.title} 
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-heading text-2xl text-white">{art.title}</h3>
                    <p className="font-body text-parchment/80">By {art.profiles?.username || 'Unknown'}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Explore;