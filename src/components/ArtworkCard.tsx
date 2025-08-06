// src/components/ArtworkCard.tsx

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Define the shape of our artwork data, including the artist's profile
export interface Artwork {
    id: number;
    title: string;
    media_url: string;
    profiles: {
        username: string | null;
    } | null;
}

const ArtworkCard = ({ artwork }: { artwork: Artwork }) => {
  const artistUsername = artwork.profiles?.username || 'Anonymous';

  return (
    <Link to={`/artwork/${artwork.id}`} className="block group">
      <motion.div 
        whileHover={{ y: -8 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="w-full"
      >
        {/* The Image Container */}
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-stone-200">
            <img 
              src={artwork.media_url} 
              alt={artwork.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
        </div>
        
        {/* The Museum Label */}
        <div className="mt-4">
          <h3 className="text-base font-medium text-stone-900 truncate" title={artwork.title}>{artwork.title}</h3>
          <p className="text-sm text-stone-500 mt-1">
            By {artistUsername}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default ArtworkCard;