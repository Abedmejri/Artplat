// src/components/ArtworkCard.tsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export interface Artwork {
    id: number;
    title: string;
    media_url: string;
    profiles: {
        username: string | null;
    } | null;
}

const ArtworkCard = ({ artwork }: { artwork: Artwork }) => {
  const artistUsername = artwork.profiles?.username || 'A Mysterious Sorcerer';

  return (
    <Link to={`/artwork/${artwork.id}`} className="block group">
      <motion.div 
        whileHover={{ scale: 1.05, y: -5, boxShadow: "0 0 25px 5px rgba(0, 242, 234, 0.3)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-stone-dark/50 p-3 rounded-lg border border-parchment/10"
      >
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md">
          <img 
            src={artwork.media_url} 
            alt={artwork.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="mt-4 text-center">
          <h3 className="font-heading text-xl text-parchment truncate" title={artwork.title}>{artwork.title}</h3>
          <p className="text-sm text-parchment/60 mt-1">
            By <span className="italic">{artistUsername}</span>
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArtworkCard;