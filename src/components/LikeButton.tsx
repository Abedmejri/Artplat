// src/components/LikeButton.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';

interface LikeButtonProps {
  artworkId: number;
}

const LikeButton = ({ artworkId }: LikeButtonProps) => {
  const session = useSession();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      setLoading(true);
      // Get the total number of likes for this artwork
      const { count } = await supabase

        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('artwork_id', artworkId);

      if (count !== null) setLikes(count);

      // Check if the current user has liked this artwork
      if (session?.user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('*')
          .eq('artwork_id', artworkId)
          .eq('user_id', session.user.id)
          .single();

        if (likeData) setIsLiked(true);
      }
      setLoading(false);
    };

    fetchLikes();
  }, [artworkId, session]);

  const handleLike = async () => {
    if (!session?.user) {
      alert('You must be logged in to like an artwork.');
      return;
    }

    if (isLiked) {
      // Unlike the artwork
      setIsLiked(false);
      setLikes(likes - 1);
      await supabase
        .from('likes')
        .delete()
        .eq('artwork_id', artworkId)
        .eq('user_id', session.user.id);
    } else {
      // Like the artwork
      setIsLiked(true);
      setLikes(likes + 1);
      await supabase
        .from('likes')
        .insert({ artwork_id: artworkId, user_id: session.user.id });
    }
  };

  const buttonStyles = `w-full flex items-center justify-center p-3 rounded-md font-bold text-lg transition-all duration-200 border-2 ${
    isLiked
      ? 'bg-gold text-ink border-gold'
      : 'bg-wood/80 text-parchment border-wood hover:bg-wood hover:border-gold'
  }`;

  if (loading) return <div className={buttonStyles + " opacity-50"}>...</div>;

  return (
    <button onClick={handleLike} className={buttonStyles}>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {likes} {likes === 1 ? 'Appreciation' : 'Appreciations'}
    </button>
  );
};

export default LikeButton;