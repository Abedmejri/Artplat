// src/components/SubmitToChallengeModal.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useSession } from '../hooks/useSession';
import { motion } from 'framer-motion';

interface Challenge {
  id: number;
  title: string;
}

interface SubmitToChallengeModalProps {
  artworkId: number;
  onClose: () => void;
}

const SubmitToChallengeModal = ({ artworkId, onClose }: SubmitToChallengeModalProps) => {
  const session = useSession();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: challengesData } = await supabase.from('challenges').select('id, title').or('deadline.is.null,deadline.gt.now');
      if (challengesData) setChallenges(challengesData);

      const { data: submissionsData } = await supabase.from('submissions').select('challenge_id').eq('artwork_id', artworkId);
      if (submissionsData) setSubmittedIds(new Set(submissionsData.map(s => s.challenge_id)));
      setLoading(false);
    };
    fetchData();
  }, [artworkId]);

  const handleSubmit = async (challengeId: number) => {
    if (!session?.user) return;
    setMessage('Submitting entry...');

    const { error } = await supabase.from('submissions').insert({
      challenge_id: challengeId,
      artwork_id: artworkId,
      user_id: session.user.id,
    });

    if (error) {
      setMessage('Entry failed. Perhaps it was already submitted?');
    } else {
      setMessage('Entry successfully registered!');
      setSubmittedIds(prev => new Set(prev).add(challengeId));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-ink-black/80 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-stone-dark w-full max-w-md p-6 rounded-lg shadow-2xl border-2 border-parchment/10 m-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-heading text-2xl text-white mb-4">Register for a Duel</h2>
        {loading && <p className="text-parchment/70">Loading active duels...</p>}
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {!loading && challenges.length === 0 && <p className="text-parchment/70">No active duels found.</p>}
          {challenges.map(challenge => {
            const isSubmitted = submittedIds.has(challenge.id);
            return (
              <div key={challenge.id} className="flex justify-between items-center p-3 bg-ink-black/50 border border-parchment/10 rounded-md">
                <span className="text-parchment font-body">{challenge.title}</span>
                <button 
                  onClick={() => handleSubmit(challenge.id)}
                  disabled={isSubmitted}
                  className="text-sm font-bold py-1 px-3 rounded-sm bg-spell-glow-teal text-ink-black disabled:bg-stone-dark disabled:text-parchment/50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitted ? 'Registered' : 'Register'}
                </button>
              </div>
            );
          })}
        </div>
        
        {message && <p className="mt-4 text-center font-bold text-spell-glow-teal">{message}</p>}
        <button onClick={onClose} className="mt-6 w-full text-sm text-parchment/60 hover:underline">Close Roster</button>
      </motion.div>
    </motion.div>
  );
};

export default SubmitToChallengeModal;