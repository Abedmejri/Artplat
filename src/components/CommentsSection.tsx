// src/components/CommentsSection.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { Link } from 'react-router-dom';

interface CommentsSectionProps {
  artworkId: number;
}

interface CommentWithProfile {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

const CommentsSection = ({ artworkId }: CommentsSectionProps) => {
  const session = useSession();
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`*, profiles (username, avatar_url)`)
        .eq('artwork_id', artworkId)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching comments:', error);
      else if (data) setComments(data as CommentWithProfile[]);
      setLoading(false);
    };
    fetchComments();
  }, [artworkId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !newComment.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        artwork_id: artworkId,
        user_id: session.user.id,
        content: newComment,
      })
      .select(`*, profiles (username, avatar_url)`)
      .single();
    
    if (error) {
      alert('Could not inscribe comment.');
    } else if (data) {
      setComments([data as CommentWithProfile, ...comments]);
      setNewComment('');
    }
  };
  
  const inputStyles = "w-full px-4 py-3 bg-stone-dark rounded-sm border border-parchment/20 focus:outline-none focus:ring-2 focus:ring-spell-glow-teal text-parchment font-body placeholder-parchment/50";
  const buttonStyles = "py-2 px-4 bg-spell-glow-teal text-ink-black font-body font-bold rounded-sm shadow-lg shadow-spell-glow-teal/20 hover:bg-white transition-all disabled:opacity-50";

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-3xl text-white mb-6">Ancient Inscriptions</h2>
      {session ? (
        <form onSubmit={handlePostComment} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Inscribe your thoughts here..."
            className={inputStyles}
            rows={3}
          />
          <button type="submit" disabled={!newComment.trim()} className={buttonStyles}>
            Inscribe
          </button>
        </form>
      ) : (
        <p className="text-center text-parchment/70 p-4 bg-stone-dark rounded-md border border-parchment/10">
          <Link to="/login" className="font-bold text-spell-glow-teal hover:underline">Log in</Link> to inscribe your thoughts.
        </p>
      )}

      <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-height for scroll */}
        {loading && <p className="text-parchment/70">Summoning inscriptions...</p>}
        {comments.map(comment => (
          <div key={comment.id} className="flex space-x-3 bg-stone-dark/50 p-4 rounded-md border border-parchment/10">
            <img 
              src={comment.profiles?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${comment.profiles?.username}`}
              alt={comment.profiles?.username || ''}
              className="w-12 h-12 rounded-full border-2 border-parchment/20 flex-shrink-0"
            />
            <div>
              <Link to={`/profile/${comment.profiles?.username}`} className="font-heading text-xl text-white hover:text-spell-glow-teal transition-colors">
                {comment.profiles?.username}
              </Link>
              <p className="font-body text-parchment/80 text-lg mt-1">{comment.content}</p>
              <p className="font-body text-xs text-parchment/50 mt-1">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {!loading && comments.length === 0 && <p className="text-parchment/60 italic">No ancient inscriptions yet. Be the first to carve your words.</p>}
      </div>
    </div>
  );
};

export default CommentsSection;